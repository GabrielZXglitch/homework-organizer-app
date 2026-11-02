// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_PHOTO_REQUEST_BYTES, photoPayload, prepareHomeworkPhoto } from '../src/utils/homeworkPhotos';

const heicTo = vi.hoisted(() => vi.fn());
vi.mock('heic-to', () => ({ heicTo }));
const drawImage = vi.fn();
const encode = vi.fn();
beforeEach(() => {
  heicTo.mockReset().mockResolvedValue(new Blob(['converted'], { type: 'image/png' }));
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
    await expect(prepareHomeworkPhoto(new File(['bad'], 'page.jpg', { type: 'image/jpeg' }))).rejects.toThrow('Não foi possível ler');
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });
  it('uses native HEIC support without loading the converter when available', async () => {
    await prepareHomeworkPhoto(new File(['native'], 'page.heic', { type: 'image/heic' }));
    expect(heicTo).not.toHaveBeenCalled();
  });
  it.each([
    ['page.heic', 'image/heic'], ['page.heif', 'image/heif'],
    ['PAGE.HEIC', ''], ['page.HEIF', 'application/octet-stream'],
    ['page.hif', ''], ['page', 'image/heic-sequence'],
  ])('converts %s (%s) when the browser cannot decode it', async (name, type) => {
    let loads = 0;
    vi.stubGlobal('Image', class {
      naturalWidth = 4000;
      naturalHeight = 3000;
      onload = () => {};
      onerror = () => {};
      set src(_value: string) {
        const first = loads++ === 0;
        queueMicrotask(() => first ? this.onerror() : this.onload());
      }
    });
    const original = new File(['photo'], name, { type });
    const result = await prepareHomeworkPhoto(original);
    expect(heicTo).toHaveBeenCalledWith({ blob: original, type: 'image/png' });
    expect(result.name).toBe(name);
    expect(photoPayload(result.dataUrl).mimeType).toBe('image/jpeg');
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
  });
  it('reports corrupt HEIF files without leaking decoder errors', async () => {
    vi.stubGlobal('Image', class {
      onerror = () => {};
      set src(_value: string) { queueMicrotask(() => this.onerror()); }
    });
    heicTo.mockRejectedValue(new Error('internal decoder details'));
    await expect(prepareHomeworkPhoto(new File(['bad'], 'bad.heif', { type: 'image/heif' })))
      .rejects.toThrow('Não foi possível converter esta foto HEIC/HEIF');
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
  });
  it.each(['jpg', 'png', 'webp', 'avif', 'gif', 'bmp'])('accepts %s when the phone omits the MIME type', async extension => {
    await prepareHomeworkPhoto(new File(['photo'], `page.${extension}`, { type: '' }));
    expect(heicTo).not.toHaveBeenCalled();
  });

});
