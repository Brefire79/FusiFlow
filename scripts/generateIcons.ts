/**
 * Script para gerar ícones PNG a partir dos SVGs existentes.
 *
 * Uso:  npm run generate-icons
 * Pré-requisito: instalar sharp como devDependency
 *                npm install --save-dev sharp @types/sharp
 */

import sharp from 'sharp';
import { resolve, dirname } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir  = resolve(__dirname, '..', 'public');

const green  = (s: string) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const bold   = (s: string) => `\x1b[1m${s}\x1b[0m`;

// Pares de (SVG fonte, PNG destino, tamanho)
const icons = [
  { src: 'icon-512.svg', dest: 'icon-192.png', size: 192 },
  { src: 'icon-512.svg', dest: 'icon-512.png', size: 512 },
] as const;

async function generateIcons() {
  console.log(bold('\n🎨  FusiFlow — Geração de ícones PNG\n'));

  for (const { src, dest, size } of icons) {
    const srcPath  = resolve(publicDir, src);
    const destPath = resolve(publicDir, dest);

    if (!existsSync(srcPath)) {
      console.warn(yellow(`  ⚠️  ${src} não encontrado — pulando ${dest}`));
      continue;
    }

    await sharp(srcPath)
      .resize(size, size)
      .png()
      .toFile(destPath);

    console.log(green(`  ✅  ${dest} (${size}×${size}) gerado em public/`));
  }

  console.log(bold('\n✅  Ícones PNG gerados em public/\n'));
}

generateIcons().catch((err) => {
  console.error('❌  Erro ao gerar ícones:', err);
  console.error('\nInstale o sharp antes de rodar este script:');
  console.error('  npm install --save-dev sharp @types/sharp');
  process.exit(1);
});
