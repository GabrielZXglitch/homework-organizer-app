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
            { type: 'text', text: 'You are a homework verification assistant. Look at this image carefully. Reply ONLY with YES if the image shows any study material: handwritten notes, a notebook, paper with text, a textbook, printed text, school exercises, or any written content. Reply ONLY with NO if the image shows only non-study objects like walls, furniture, food, appliances, people, or outdoor scenes. Any image with visible text or writing should be YES.' }
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
