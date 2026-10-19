// Rebuild optimized, local assets from the user-supplied logo, portrait and
// Home_page.png design reference. No remote images or stock substitutions.
// Usage: node scripts/prepare-brand-assets.cjs <logo> <portrait> <reference>
const sharp = require('sharp');
const { mkdir } = require('node:fs/promises');
const path = require('node:path');

async function main() {
  const [logo, portrait, reference] = process.argv.slice(2);
  if (!logo || !portrait || !reference) throw new Error('Supply logo, portrait and homepage reference paths.');
  const output = path.resolve(__dirname, '../public/brand');
  await mkdir(output, { recursive: true });

  // Remove the off-white paper background, retaining the supplied artwork.
  async function logoCrop(region) {
    const { data, info } = await sharp(logo).extract(region).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += 4) {
      const min = Math.min(data[i], data[i + 1], data[i + 2]);
      const max = Math.max(data[i], data[i + 1], data[i + 2]);
      if (min > 210 && max - min < 28) data[i + 3] = 0;
    }
    return sharp(data, { raw: info }).png().toBuffer();
  }
  const mark = await logoCrop({ left: 1090, top: 245, width: 640, height: 680 });
  const lettering = await logoCrop({ left: 726, top: 984, width: 1368, height: 306 });
  await sharp(mark).resize({ height: 256 }).png().toFile(path.join(output, 'cypress-mark.png'));
  await sharp({ create: { width: 680, height: 170, channels: 4, background: '#00000000' } })
    .composite([
      { input: await sharp(mark).resize({ height: 164 }).toBuffer(), left: 0, top: 3 },
      { input: await sharp(lettering).resize({ width: 500 }).toBuffer(), left: 175, top: 29 },
    ]).png().toFile(path.join(output, 'cypress-logo.png'));
  await sharp(portrait).rotate().resize({ width: 960, withoutEnlargement: true })
    .webp({ quality: 88 }).toFile(path.join(output, 'sudish-kumar.webp'));
  // Only illustration regions: exclude mockup headings, controls and sample data.
  // These are illustrative design assets, never advertised as available listings.
  await sharp(reference).extract({ left: 408, top: 65, width: 377, height: 212 })
    .webp({ quality: 92 }).toFile(path.join(output, 'property-hero.webp'));
  await sharp(reference).extract({ left: 418, top: 1326, width: 173, height: 182 })
    .webp({ quality: 90 }).toFile(path.join(output, 'remote-ownership.webp'));
  console.log(`Prepared five branding assets in ${output}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });