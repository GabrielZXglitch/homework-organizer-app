import { photoPayload } from './homeworkPhotos';

export class PhotoVerificationError extends Error {
  constructor(message: string, public retryAfterSeconds?: number) {
    super(message);
  }
}

export async function verifyHomeworkPhoto(dataUrl: string, index: number, controller: AbortController) {
  let timedOut = false;
  const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 30_000);
  try {
    const response = await fetch('/api/verify-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(photoPayload(dataUrl)),
      signal: controller.signal,
    });
    // Hosting/proxy errors can return HTML. HTTP status remains authoritative.
    const data = await response.json().catch(() => null);
    if (timedOut) throw new PhotoVerificationError('A validação demorou demais. Tente novamente.');
    if (response.status === 429) {
      const seconds = typeof data?.retryAfterSeconds === 'number' && Number.isFinite(data.retryAfterSeconds) && data.retryAfterSeconds >= 0
        ? Math.ceil(data.retryAfterSeconds) : 60;
      throw new PhotoVerificationError('Limite temporário de validação atingido. Suas fotos foram mantidas. Aguarde para continuar.', seconds);
    }
    if (!response.ok) {
      const messages: Record<number, string> = {
        400: 'A foto enviada é inválida. Remova e selecione a foto novamente.',
        413: 'A foto é muito grande. Remova e escolha uma imagem menor.',
        503: 'A validação de fotos está indisponível. Tente novamente mais tarde.',
        504: 'A validação demorou demais. Tente novamente.',
      };
      throw new PhotoVerificationError(messages[response.status] || 'O serviço não conseguiu validar a foto. Tente novamente.');
    }
    if (typeof data?.aprovado !== 'boolean') {
      throw new PhotoVerificationError('O serviço retornou uma resposta de validação inválida. Tente novamente.');
    }
    return data.aprovado as boolean;
  } catch (cause) {
    if (cause instanceof PhotoVerificationError) throw cause;
    if (timedOut) throw new PhotoVerificationError('A validação demorou demais. Tente novamente.');
    throw new PhotoVerificationError(`Erro ao validar a foto ${index + 1}. Verifique sua conexão e tente novamente.`);
  } finally {
    clearTimeout(timeout);
  }
}
