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
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      max_tokens: 10,
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Data}` } },
          { type: 'text', text: 'Look at this image. Reply ONLY with YES if you can see any of the following: handwritten text, printed text, a notebook, a book, paper with writing, a school worksheet, a textbook, or any study material. Reply ONLY with NO if the image shows clearly non-study content like food, a person\'s face, furniture, appliances, walls, or outdoor scenes. When in doubt, reply YES.' }
        ]
      }]
    })
  });

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim().toUpperCase() || 'NO';
  res.json({ aprovado: text.includes('YES') });
}
