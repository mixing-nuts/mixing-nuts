import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const kb = (bytes) => `${Math.round(bytes / 1024)}KB`;

const DIRS = ['public/images/categories'];
const SIZE = 400;
const QUALITY = 80;

const SINGLE_FILES = [
  { dir: 'public/images', file: 'hero-animated-fallback.png', width: 1080 },
  { dir: 'public/images', file: 'back-1.png', width: 1080 },
  { dir: 'public/images', file: 'about-img-2.png', width: 1080 },
];

for (const dir of DIRS) {
  const files = (await readdir(dir)).filter((f) => f.endsWith('.png'));

  for (const file of files) {
    const input = path.join(dir, file);
    const output = path.join(dir, file.replace(/\.png$/i, '.webp'));

    const before = (await stat(input)).size;
    await sharp(input)
      .resize(SIZE, SIZE, { fit: 'inside' })
      .webp({ quality: QUALITY })
      .toFile(output);
    const after = (await stat(output)).size;

    console.log(`${file} -> ${path.basename(output)}  ${kb(before)} -> ${kb(after)}`);
  }
}

for (const { dir, file, width } of SINGLE_FILES) {
  const input = path.join(dir, file);
  const output = path.join(dir, file.replace(/\.png$/i, '.webp'));

  let before;
  try {
    before = (await stat(input)).size;
  } catch {
    console.log(`${file} -> ya existe el webp, se omite`);
    continue;
  }

  await sharp(input)
    .resize(width, width, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(output);
  const after = (await stat(output)).size;

  console.log(`${file} -> ${path.basename(output)}  ${kb(before)} -> ${kb(after)}`);
}
