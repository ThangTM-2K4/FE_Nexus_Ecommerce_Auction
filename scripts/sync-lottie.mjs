import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const destDirs = [
  join(root, 'src', 'assets', 'lottie'),
  join(root, 'public', 'lottie'),
];
const sources = [
  join(root, '..', '..'),
  join(root, '..'),
  'd:/FPT/ki_6',
];

const codes = ['401', '403', '404', '500', '503'];

destDirs.forEach((dir) => mkdirSync(dir, { recursive: true }));

let copied = 0;

for (const code of codes) {
  const fileName = `${code}.json`;
  let found = false;

  for (const srcDir of sources) {
    const src = join(srcDir, fileName);
    if (!existsSync(src)) continue;

    for (const destDir of destDirs) {
      const dest = join(destDir, fileName);
      copyFileSync(src, dest);
      console.log(`Copied ${src} -> ${dest}`);
    }

    copied += 1;
    found = true;
    break;
  }

  if (!found) {
    console.warn(`Missing ${fileName} — place it in src/assets/lottie/ or d:/FPT/ki_6/`);
  }
}

if (copied === 0) {
  process.exitCode = 1;
}
