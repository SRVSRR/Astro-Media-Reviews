import { existsSync } from 'node:fs';
import { join, parse } from 'node:path';

export function ogImageName(coverFilename: string): string {
  const { name } = parse(coverFilename);
  return `og-${name}.webp`;
}

export function ogImagePathFor(coverFilename: string): string {
  const ogName = ogImageName(coverFilename);
  const ogPath = join(process.cwd(), 'public', 'images', ogName);
  return existsSync(ogPath) ? `/images/${ogName}` : `/images/${coverFilename}`;
}