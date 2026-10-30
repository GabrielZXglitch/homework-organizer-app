// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_PHOTO_REQUEST_BYTES, photoPayload, prepareHomeworkPhoto } from '../src/utils/homeworkPhotos';

const drawImage = vi.fn();
const encode = vi.fn();
beforeEach(() => {
  vi.stubGlobal('Image', class {
    naturalWidth = 4000;
    naturalHeight = 3000;
    onload = () => {};
    onerror = () => {};
    set src(_value: string) { queueMicrotask(() => this.onload()); }
  });
  vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:photo'), revokeObjectURL: vi.fn() });
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ fillRect: vi.fn(), drawImage } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(encode);
  encode.mockReset().mockReturnValue('data:image/jpeg;base64,YQ==');
  drawImage.mockClear();
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('photo preparation', () => {
  it('resizes large images, encodes JPEG and frees the original URL', async () => {
    const photo = await prepareHomeworkPhoto(new File(['image'], 'page.png', { type: 'image/png' }));
    expect(photo.name).toBe('page.png');
    expect(photoPayload(photo.dataUrl)).toEqual({ base64Data: 'YQ==', mimeType: 'image/jpeg' });
    expect(drawImage.mock.calls[0].slice(1)).toEqual([0, 0, 2048, 1536]);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:photo');
  });
  it('rejects non-images before decoding', async () => {
    await expect(prepareHomeworkPhoto(new File(['text'], 'page.txt', { type: 'text/plain' }))).rejects.toThrow('arquivo de imagem');
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });
  it('lowers quality when the encoded request is too large', async () => {
    encode.mockReturnValueOnce('data:image/jpeg;base64,' + 'a'.repeat(MAX_PHOTO_REQUEST_BYTES));
    await prepareHomeworkPhoto(new File(['image'], 'page.jpg', { type: 'image/jpeg' }));
    expect(encode.mock.calls.map(call => call[1])).toEqual([0.85, 0.7]);
  });
  it('rejects images still too large after compression', async () => {
    encode.mockReturnValue('data:image/jpeg;base64,' + 'a'.repeat(MAX_PHOTO_REQUEST_BYTES));
    await expect(prepareHomeworkPhoto(new File(['image'], 'page.jpg', { type: 'image/jpeg' }))).rejects.toThrow('muito grande');
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });
  it('reports unreadable images and frees their URL', async () => {
    vi.stubGlobal('Image', class {
      onerror = () => {};
      set src(_value: string) { queueMicrotask(() => this.onerror()); }
    });
    await expect(prepareHomeworkPhoto(new File(['bad'], 'page.heic', { type: 'image/heic' }))).rejects.toThrow('Não foi possível ler');
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });
});
