// Post-processing for the GitHub Pages static export.
//   1. Copy index.html -> 404.html so GitHub Pages serves the SPA shell for any
//      unknown path (e.g. /tickets/<real-id>); the client router then renders the
//      correct route from the URL.
//   2. Add .nojekyll so GitHub Pages doesn't strip _next/ asset folders.
import { copyFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const outDir = join(process.cwd(), 'out');
const indexHtml = join(outDir, 'index.html');
const notFoundHtml = join(outDir, '404.html');

if (!existsSync(indexHtml)) {
  console.error(`[pages-postbuild] Expected ${indexHtml} to exist. Did the export run?`);
  process.exit(1);
}

copyFileSync(indexHtml, notFoundHtml);
writeFileSync(join(outDir, '.nojekyll'), '');

console.log('[pages-postbuild] Wrote 404.html SPA fallback and .nojekyll');
