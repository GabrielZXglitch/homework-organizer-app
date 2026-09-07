import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { base64Data, mimeType } = req.body;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.2-11b-vision-preview',
      max_tokens: 10,
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Data}` } },
          { type: 'text', text: 'Responda APENAS com SIM se a imagem mostrar dever de casa, caderno, folha de exercícios ou material escolar. Responda APENAS com NAO para qualquer outra coisa.' }
        ]
      }]
    })
  });

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim().toUpperCase() || 'NAO';
  res.json({ aprovado: text.includes('SIM') });
}
