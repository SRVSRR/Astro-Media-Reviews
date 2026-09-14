import sharp from 'sharp';
import { join, parse } from 'node:path';
import { existsSync } from 'node:fs';

export function ogImageName(coverFilename: string): string {
  const { name } = parse(coverFilename);
  return `og-${name}.webp`;
}

export function ensureOgImage(coverFilename: string): void {
  const ogName = ogImageName(coverFilename);
  const ogPath = join(process.cwd(), 'public', 'images', ogName);
  if (existsSync(ogPath)) return;
  const coverPath = join(process.cwd(), 'public', 'images', coverFilename);
  sharp(coverPath)
    .resize(1200, 630, { fit: 'cover', position: 'top' })
    .webp({ quality: 80 })
    .toFile(ogPath)
    .then(() => {
      console.log(`[og-image] generated ${ogName}`);
    })
    .catch((err) => {
      console.error(`[og-image] failed for ${coverFilename}:`, err.message);
    });
}