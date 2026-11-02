// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConcluirDever } from '../src/pages/ConcluirDever';

const mocks = vi.hoisted(() => ({
  routeId: 'hw1', complete: vi.fn(), navigate: vi.fn(), prepare: vi.fn(), confetti: vi.fn(),
  homework: { id: 'hw1', titulo: 'Exercícios', materia: 'Matemática', exigeFoto: true, status: 'pendente' },
}));
vi.mock('react-router-dom', () => ({ useParams: () => ({ id: mocks.routeId }), useNavigate: () => mocks.navigate }));
vi.mock('../src/contexts/HomeworkContext', () => ({ useHomeworks: () => ({ homeworks: [mocks.homework], completeHomework: mocks.complete }) }));
vi.mock('canvas-confetti', () => ({ default: mocks.confetti }));
vi.mock('../src/utils/homeworkPhotos', async importOriginal => ({
  ...await importOriginal<typeof import('../src/utils/homeworkPhotos')>(), prepareHomeworkPhoto: mocks.prepare,
}));
const request = vi.fn();
const file = (name: string) => new File(['image'], name, { type: 'image/jpeg' });
const confirm = () => screen.getByRole('button', { name: 'Marcar como Concluído' });
async function add(names: string[], camera = false) {
  fireEvent.change(screen.getByLabelText(camera ? 'Tirar foto' : 'Selecionar fotos', { selector: 'input' }), {
    target: { files: names.map(file) },
  });
  await waitFor(() => expect(screen.queryByText('Preparando fotos...')).toBeNull());
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.routeId = 'hw1';
  mocks.homework.id = 'hw1';
  mocks.homework.exigeFoto = true;
  mocks.homework.status = 'pendente';
  mocks.complete.mockResolvedValue(undefined);
  let photoId = 0;
  mocks.prepare.mockImplementation(async (file: File) => ({ id: `${file.name}-${++photoId}`, name: file.name, dataUrl: `data:image/jpeg;base64,${file.name}` }));
  request.mockReset().mockResolvedValue({ ok: true, json: async () => ({ aprovado: true }) });
  vi.stubGlobal('fetch', request);
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('completion with multiple pages', () => {
  it('waits on 429 then resumes a three-page batch without resending approved pages', async () => {
    request.mockResolvedValueOnce({ ok: true, json: async () => ({ aprovado: true }) })
      .mockResolvedValueOnce({ ok: false, status: 429, json: async () => ({ code: 'RATE_LIMITED', retryAfterSeconds: 2 }) });
    render(<ConcluirDever />);
    await add(['one', 'two', 'three']);
    fireEvent.click(confirm());
    expect((await screen.findByRole('alert')).textContent).toContain('Limite temporário');
    expect(screen.getAllByRole('img')).toHaveLength(3);
    expect(request).toHaveBeenCalledTimes(2);
    expect(mocks.complete).not.toHaveBeenCalled();
    const button = screen.getByRole('button', { name: 'Aguarde 2s' }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(request).toHaveBeenCalledTimes(2);
    await waitFor(() => expect((screen.getByRole('button', { name: /Aguarde|Marcar/ }) as HTMLButtonElement).disabled).toBe(false), { timeout: 3500 });
    fireEvent.click(confirm());
    await waitFor(() => expect(mocks.complete).toHaveBeenCalledTimes(1));
    expect(request.mock.calls.map(call => JSON.parse(call[1].body).base64Data)).toEqual(['one', 'two', 'two', 'three']);
  });
  it('invalidates removed photos when the same file is attached again', async () => {
    mocks.complete.mockRejectedValueOnce(new Error('offline'));
    render(<ConcluirDever />);
    await add(['one']);
    fireEvent.click(confirm());
    await screen.findByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: 'Remover foto 1' }));
    await add(['one']);
    fireEvent.click(confirm());
    await waitFor(() => expect(mocks.confetti).toHaveBeenCalledTimes(1));
    expect(request).toHaveBeenCalledTimes(2);
  });
  it('clears photos and approvals when the homework changes', async () => {
    mocks.complete.mockRejectedValueOnce(new Error('offline'));
    const view = render(<ConcluirDever />);
    await add(['one']);
    fireEvent.click(confirm());
    await screen.findByRole('alert');
    mocks.routeId = 'hw2';
    mocks.homework.id = 'hw2';
    view.rerender(<ConcluirDever />);
    expect(screen.queryAllByRole('img')).toHaveLength(0);
    await add(['one']);
    fireEvent.click(confirm());
    await waitFor(() => expect(mocks.confetti).toHaveBeenCalledTimes(1));
    expect(request).toHaveBeenCalledTimes(2);
    expect(mocks.complete).toHaveBeenLastCalledWith('hw2', true);
  });
  it.each([
    [413, 'muito grande'], [503, 'indisponível'], [504, 'demorou demais'], [502, 'serviço não conseguiu'],
  ])('uses status %s even when an HTTP error body is not JSON', async (status, message) => {
    request.mockResolvedValueOnce({ ok: false, status, json: async () => { throw new Error('HTML'); } });
    render(<ConcluirDever />);
    await add(['one']);
    fireEvent.click(confirm());
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain(message);
    expect(alert.textContent).not.toContain('conexão');
    expect(mocks.complete).not.toHaveBeenCalled();
  });
  it('rejects a malformed success response without awarding completion', async () => {
    request.mockResolvedValueOnce({ ok: true, json: async () => ({ aprovado: 'true' }) });
    render(<ConcluirDever />);
    await add(['one']);
    fireEvent.click(confirm());
    expect((await screen.findByRole('alert')).textContent).toContain('resposta de validação inválida');
    expect(mocks.complete).not.toHaveBeenCalled();
  });
  it('times out and cancels a pending request when the screen unmounts', async () => {
    request.mockImplementation((_url, options) => new Promise((_resolve, reject) => {
      options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    }));
    const view = render(<ConcluirDever />);
    await add(['one']);
    vi.useFakeTimers();
    fireEvent.click(confirm());
    await act(async () => { await vi.advanceTimersByTimeAsync(30_000); });
    expect(screen.getByRole('alert').textContent).toContain('demorou demais');
    expect(request).toHaveBeenCalledTimes(1);
    fireEvent.click(confirm());
    const signal = request.mock.calls[1][1].signal;
    view.unmount();
    expect(signal.aborted).toBe(true);
    await act(async () => {});
    expect(vi.getTimerCount()).toBe(0);
    expect(mocks.complete).not.toHaveBeenCalled();
  });
  it('requires a photo, appends gallery and camera pages in order and removes individually', async () => {
    render(<ConcluirDever />);
    expect((confirm() as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByLabelText('Selecionar fotos', { selector: 'input' }).hasAttribute('multiple')).toBe(true);
    expect(screen.getByLabelText('Tirar foto', { selector: 'input' }).getAttribute('capture')).toBe('environment');
    await add(['one', 'two']);
    await add(['three'], true);
    expect(screen.getAllByRole('img').map(img => img.getAttribute('alt'))).toEqual(['Página 1: one', 'Página 2: two', 'Página 3: three']);
    fireEvent.click(screen.getByRole('button', { name: 'Remover foto 2' }));
    expect(screen.getAllByRole('img').map(img => img.getAttribute('alt'))).toEqual(['Página 1: one', 'Página 2: three']);
  });
  it('validates every photo sequentially and completes once with the same photo bonus', async () => {
    let approve!: (value: unknown) => void;
    request.mockImplementationOnce(() => new Promise(resolve => { approve = resolve; }));
    render(<ConcluirDever />);
    await add(['one', 'two']);
    fireEvent.click(confirm());
    expect(request).toHaveBeenCalledTimes(1);
    expect(mocks.complete).not.toHaveBeenCalled();
    expect((screen.getByRole('button', { name: 'Remover foto 1' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: /Validando foto/ }));
    expect(request).toHaveBeenCalledTimes(1);
    await act(async () => approve({ ok: true, json: async () => ({ aprovado: true }) }));
    await waitFor(() => expect(mocks.complete).toHaveBeenCalledTimes(1));
    expect(request.mock.calls.map(call => JSON.parse(call[1].body).base64Data)).toEqual(['one', 'two']);
    expect(mocks.complete).toHaveBeenCalledWith('hw1', true);
    await waitFor(() => expect(mocks.confetti).toHaveBeenCalledTimes(1));
  });
  it('identifies a rejected page, preserves photos and allows retry after removal', async () => {
    request.mockResolvedValueOnce({ ok: true, json: async () => ({ aprovado: true }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ aprovado: false }) });
    render(<ConcluirDever />);
    await add(['one', 'two']);
    fireEvent.click(confirm());
    expect((await screen.findByRole('alert')).textContent).toContain('foto 2 não foi aprovada');
    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(mocks.complete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Remover foto 2' }));
    fireEvent.click(confirm());
    await waitFor(() => expect(mocks.complete).toHaveBeenCalledTimes(1));
  });
  it('preserves successful attachments if another file cannot be read', async () => {
    mocks.prepare.mockRejectedValueOnce(new Error('Formato incompatível.'));
    render(<ConcluirDever />);
    await add(['bad', 'good']);
    expect(screen.getByRole('alert').textContent).toContain('bad: Formato incompatível');
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });
  it('allows retry after a network error without dropping photos', async () => {
    request.mockRejectedValueOnce(new Error('offline'));
    render(<ConcluirDever />);
    await add(['one']);
    fireEvent.click(confirm());
    expect((await screen.findByRole('alert')).textContent).toContain('Erro ao validar a foto 1');
    expect(mocks.complete).not.toHaveBeenCalled();
    fireEvent.click(confirm());
    await waitFor(() => expect(mocks.complete).toHaveBeenCalledTimes(1));
  });
  it('does not celebrate a save failure and allows retry', async () => {
    mocks.complete.mockRejectedValueOnce(new Error('offline'));
    render(<ConcluirDever />);
    await add(['one']);
    fireEvent.click(confirm());
    expect((await screen.findByRole('alert')).textContent).toContain('Não foi possível salvar');
    expect(mocks.confetti).not.toHaveBeenCalled();
    expect(screen.getAllByRole('img')).toHaveLength(1);
    fireEvent.click(confirm());
    await waitFor(() => expect(mocks.confetti).toHaveBeenCalledTimes(1));
    expect(request).toHaveBeenCalledTimes(1);
  });
  it('still completes without photos when no proof is required', async () => {
    mocks.homework.exigeFoto = false;
    render(<ConcluirDever />);
    fireEvent.click(confirm());
    await waitFor(() => expect(mocks.complete).toHaveBeenCalledWith('hw1', false));
    expect(request).not.toHaveBeenCalled();
  });
});
