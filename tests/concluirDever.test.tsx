// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConcluirDever } from '../src/pages/ConcluirDever';

const mocks = vi.hoisted(() => ({
  complete: vi.fn(), navigate: vi.fn(), prepare: vi.fn(), confetti: vi.fn(),
  homework: { id: 'hw1', titulo: 'Exercícios', materia: 'Matemática', exigeFoto: true, status: 'pendente' },
}));
vi.mock('react-router-dom', () => ({ useParams: () => ({ id: 'hw1' }), useNavigate: () => mocks.navigate }));
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
  mocks.homework.exigeFoto = true;
  mocks.homework.status = 'pendente';
  mocks.complete.mockResolvedValue(undefined);
  mocks.prepare.mockImplementation(async (file: File) => ({ id: file.name, name: file.name, dataUrl: `data:image/jpeg;base64,${file.name}` }));
  request.mockReset().mockResolvedValue({ ok: true, json: async () => ({ aprovado: true }) });
  vi.stubGlobal('fetch', request);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('completion with multiple pages', () => {
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
  });
  it('still completes without photos when no proof is required', async () => {
    mocks.homework.exigeFoto = false;
    render(<ConcluirDever />);
    fireEvent.click(confirm());
    await waitFor(() => expect(mocks.complete).toHaveBeenCalledWith('hw1', false));
    expect(request).not.toHaveBeenCalled();
  });
});
