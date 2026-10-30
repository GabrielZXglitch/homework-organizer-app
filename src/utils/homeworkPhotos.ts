export interface HomeworkPhoto {
  id: string;
  name: string;
  dataUrl: string;
}

// Leave room below Vercel's 4.5 MB request limit, including JSON overhead.
export const MAX_PHOTO_REQUEST_BYTES = 4_000_000;

export function photoPayload(dataUrl: string) {
  const [header, base64Data] = dataUrl.split(',');
  return { base64Data, mimeType: header.split(';')[0].split(':')[1] };
}

export async function prepareHomeworkPhoto(file: File): Promise<HomeworkPhoto> {
  if (!file.type.startsWith('image/')) throw new Error('Selecione um arquivo de imagem.');
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Não foi possível ler a foto. Use JPG, PNG ou outro formato compatível com seu navegador.'));
      img.src = url;
    });
    const scale = Math.min(1, 2048 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Não foi possível preparar a foto. Tente outro navegador.');
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.85, 0.7, 0.55]) {
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      if (dataUrl.startsWith('data:image/jpeg;base64,') &&
          new Blob([JSON.stringify(photoPayload(dataUrl))]).size < MAX_PHOTO_REQUEST_BYTES) {
        return { id: crypto.randomUUID(), name: file.name, dataUrl };
      }
    }
    throw new Error('A foto é muito grande. Escolha uma imagem menor.');
  } finally {
    URL.revokeObjectURL(url);
  }
}
