import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { base64Data, mimeType } = req.body || {};
  if (typeof base64Data !== 'string' || !base64Data || typeof mimeType !== 'string' || !mimeType.startsWith('image/')) {
    return res.status(400).json({ error: 'Envie uma imagem válida.' });
  }
  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({ error: 'Validação de fotos indisponível. Tente novamente mais tarde.' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
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
      return res.status(502).json({ error: 'Erro ao validar a imagem. Tente novamente.' });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      return res.status(502).json({ error: 'Resposta de validação indisponível. Tente novamente.' });
    }
    const text = content.trim().toUpperCase();
    return res.json({ aprovado: text.includes('YES') });
  } catch {
    // Errors can contain request headers or provider payloads: do not log them.
    console.error('Não foi possível consultar a validação Groq.');
    return res.status(502).json({ error: 'Erro ao validar a imagem. Tente novamente.' });
  }
}
