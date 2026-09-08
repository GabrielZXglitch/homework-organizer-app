import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { base64Data, mimeType } = req.body;

  console.log(`Diagnostic [Groq Request]:`);
  console.log(`- Base64 Size: ${base64Data?.length || 0} caracteres`);
  console.log(`- Base64 Preview (100 chars): ${base64Data?.substring(0, 100) || 'N/A'}`);
  console.log(`- MimeType: ${mimeType}`);

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

  const data = await response.json();
  
  if (!response.ok) {
    console.error(`Groq API Error: ${response.status} ${response.statusText}`);
    console.error(`Groq Error Body:`, JSON.stringify(data, null, 2));
  }

  const text = data.choices?.[0]?.message?.content?.trim().toUpperCase() || 'NO';
  res.json({ aprovado: text.includes('YES') });
}
