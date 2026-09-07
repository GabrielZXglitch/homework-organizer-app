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
          { type: 'text', text: 'Analise esta imagem. Responda APENAS com SIM se mostrar qualquer coisa relacionada a estudo ou escola: caderno, livro, livro didático, folha de papel com escrita, exercício, apostila, prova, anotações, texto impresso ou manuscrito, material escolar, tablet ou computador com conteúdo educacional. Responda APENAS com NAO apenas se for claramente uma foto sem nenhuma relação com estudo, como: parede, comida, selfie, paisagem, objeto doméstico, móvel, eletrodoméstico ou climatizador. Em caso de dúvida, responda SIM.' }
        ]
      }]
    })
  });

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim().toUpperCase() || 'NAO';
  res.json({ aprovado: text.includes('SIM') });
}
