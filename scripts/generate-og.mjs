import sharp from 'sharp';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, parse } from 'node:path';

const blogDir = join(process.cwd(), 'src/content/blog');
const imagesDir = join(process.cwd(), 'public/images');

const covers = readdirSync(blogDir)
  .filter((f) => f.endsWith('.md'))
  .map((f) => readFileSync(join(blogDir, f), 'utf8'))
  .map((raw) => raw.match(/^image: *'([^']+)'/)?.[1])
  .filter(Boolean);

let generated = 0;
for (const cover of covers) {
  const { name } = parse(cover);
  const ogName = `og-${name}.webp`;
  if (existsSync(join(imagesDir, ogName))) continue;
  await sharp(join(imagesDir, cover))
    .resize(1200, 630, { fit: 'cover', position: 'top' })
    .webp({ quality: 80 })
    .toFile(join(imagesDir, ogName));
  console.log(`[og] generated ${ogName}`);
  generated += 1;
}
console.log(generated === 0 ? '[og] nothing to do' : `[og] generated ${generated} og card(s)`);