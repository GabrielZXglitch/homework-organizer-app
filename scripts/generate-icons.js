import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = '/home/gabriel/Downloads/logo.png';
const publicDir = path.resolve(__dirname, '../public');

async function generateIcons() {
  try {
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // PWA Icons
    await sharp(inputPath).resize(192, 192).toFile(path.join(publicDir, 'pwa-192x192.png'));
    console.log('Created pwa-192x192.png');
    
    await sharp(inputPath).resize(512, 512).toFile(path.join(publicDir, 'pwa-512x512.png'));
    console.log('Created pwa-512x512.png');

    // Apple Touch Icon
    await sharp(inputPath).resize(180, 180).toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('Created apple-touch-icon.png');

    // Favicon (32x32)
    await sharp(inputPath).resize(32, 32).toFile(path.join(publicDir, 'favicon.png'));
    console.log('Created favicon.png');

  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
