import type { VercelRequest, VercelResponse } from '@vercel/node';

export function retryAfterSeconds(value: string | null, now = Date.now()): number {
  if (value && /^\d+(?:\.\d+)?$/.test(value.trim())) {
    const seconds = Number(value);
    if (Number.isFinite(seconds)) return Math.ceil(seconds);
  }
  if (value && /^[a-z]{3,9}[, ]/i.test(value.trim())) {
    const date = Date.parse(value);
    if (Number.isFinite(date)) return Math.max(0, Math.ceil((date - now) / 1000));
  }
  return 60;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { base64Data, mimeType } = req.body || {};
  if (typeof base64Data !== 'string' || !base64Data || typeof mimeType !== 'string' || !mimeType.startsWith('image/')) {
    return res.status(400).json({ code: 'INVALID_PHOTO', error: 'Envie uma imagem válida.' });
  }
  if (Buffer.byteLength(JSON.stringify({ base64Data, mimeType }), 'utf8') >= 4_000_000) {
    return res.status(413).json({ code: 'PHOTO_TOO_LARGE', error: 'A foto é muito grande. Escolha uma imagem menor.' });
  }
  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({ code: 'VALIDATION_UNAVAILABLE', error: 'Validação de fotos indisponível. Tente novamente mais tarde.' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.8-27b',
        max_tokens: 10,
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Data}` } },
            { type: 'text', text: 'You are checking whether a photo shows study material, not grading the student. Reply ONLY with YES or NO. Reply YES when the image shows handwritten schoolwork, notes, notebook pages with writing or attempted exercises, textbooks, worksheets, printed study material, calculations, diagrams, or educational drawings. Handwriting may be messy, uneven, cursive, faint, crossed out, misspelled, or impossible for you to transcribe. Do not require readable words, neat handwriting, correct answers, or proof that every exercise is finished. Use the overall page context and visible writing, numbers, or diagrams to recognize study material even when you cannot read individual characters. If handwriting is difficult to read but the image appears to show schoolwork, reply YES. Reply NO only when there is no identifiable study material, such as unrelated objects, a blank page without work, or a photo so dark, blurred, or cropped that even the presence of study material cannot be recognized. Do not reject a photo solely because of handwriting quality.' }
          ]
        }]
      })
    });

    if (!response.ok) {
      // Never log credentials, submitted photos or raw provider responses.
      console.error('Falha na validação Groq. Status HTTP:', response.status);
      if (response.status === 429) {
        return res.status(429).json({
          code: 'RATE_LIMITED',
          error: 'Limite temporário de validação atingido. Aguarde para tentar novamente.',
          retryAfterSeconds: retryAfterSeconds(response.headers.get('retry-after')),
        });
      }
      return res.status(502).json({ code: 'VALIDATION_FAILED', error: 'Erro ao validar a imagem. Tente novamente.' });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const text = typeof content === 'string' ? content.trim().toUpperCase() : '';
    if (text !== 'YES' && text !== 'NO') {
      return res.status(502).json({ code: 'INVALID_RESPONSE', error: 'Resposta de validação indisponível. Tente novamente.' });
    }
    return res.json({ aprovado: text === 'YES' });
  } catch {
    // Errors can contain request headers or provider payloads: do not log them.
    console.error('Não foi possível consultar a validação Groq.');
    if (controller.signal.aborted) {
      return res.status(504).json({ code: 'VALIDATION_TIMEOUT', error: 'A validação demorou demais. Tente novamente.' });
    }
    return res.status(502).json({ code: 'VALIDATION_FAILED', error: 'Erro ao validar a imagem. Tente novamente.' });
  } finally {
    clearTimeout(timeout);
  }
}
