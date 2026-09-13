import { imageSize } from 'image-size';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';

export interface ImageDims {
  width: number;
  height: number;
}

export function getImageDims(filename: string): ImageDims {
  try {
    const dims = imageSize(readFileSync(join(process.cwd(), 'public', 'images', filename)));
    return { width: dims.width ?? 1200, height: dims.height ?? 630 };
  } catch {
    return { width: 1200, height: 630 };
  }
}