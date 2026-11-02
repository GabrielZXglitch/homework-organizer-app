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

// Some phones provide an empty or generic MIME type for photos from Files.
const HEIF_EXTENSION = /\.(heic|heif|hif)$/i;
const IMAGE_EXTENSION = /\.(jpe?g|jfif|png|webp|gif|avif|bmp|tiff?|ico|svg|jxl|heic|heif|hif)$/i;

async function loadImage(blob: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(blob);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => img.naturalWidth > 0 && img.naturalHeight > 0
        ? resolve(img) : reject(new Error('Imagem vazia.'));
      img.onerror = () => reject(new Error('Não foi possível abrir a imagem.'));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function prepareHomeworkPhoto(file: File): Promise<HomeworkPhoto> {
  const heif = /^image\/hei[cf](?:-sequence)?$/i.test(file.type) || HEIF_EXTENSION.test(file.name);
  if (!file.type.startsWith('image/') && !IMAGE_EXTENSION.test(file.name)) {
    throw new Error('Selecione um arquivo de imagem.');
  }
  let image: HTMLImageElement;
  try {
    // Safari may decode HEIF natively: avoid downloading the decoder in that case.
    image = await loadImage(file);
  } catch {
    if (!heif) {
      throw new Error('Não foi possível ler a foto. O arquivo pode estar danificado ou usar um formato não suportado pelo navegador.');
    }
    try {
      const { heicTo } = await import('heic-to');
      // PNG avoids a lossy intermediate conversion before the final JPEG encoding.
      const converted = await heicTo({ blob: file, type: 'image/png' });
      image = await loadImage(converted);
    } catch {
      throw new Error('Não foi possível converter esta foto HEIC/HEIF. Tente selecionar a original novamente ou tirar outra foto.');
    }
  }
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
}
