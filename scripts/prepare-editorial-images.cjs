// Rebuild editorial photographs, never listing photos or product screenshots.
// Usage: node scripts/prepare-editorial-images.cjs [local-candidate-directory]
// Sources: https://unsplash.com/license; IDs retained for reproducibility.
const sharp = require('sharp');
const { readFile } = require('node:fs/promises');
const path = require('node:path');

const images = {
  'about-hero': ['apt-exterior-c', '1515263487990-61b07816b324'],
  'about-mug': ['desk-laptop-a', '1497366811353-6870744d04b2'],
  'contact-balcony': ['living-d', '1600607687939-ce8a6c25118c'],
  'faq-hero': ['kitchen-b', '1600566753086-00f18fb6b3ea'],
  'faq-devices': ['desk-laptop-b', '1512428559087-560fa5ceab42'],
  'find-prop-hero': ['apt-exterior-b', '1460317442991-0ec209397118'],
  'inquiry-owner-desk': ['bedroom-a', '1600573472592-401b489a3cdc'],
  'inquiry-tenant-living': ['living-plants-a', '1522708323590-d24dbb6b0267'],
  'maintenance-phone': ['electrician', '1621905251189-08b45d6a269e'],
  'nri-card-building': ['apt-exterior-c', '1515263487990-61b07816b324'],
  'nri-card-tablet': ['desk-laptop-b', '1512428559087-560fa5ceab42'],
  'nri-card-statement': ['documents-sign', '1450101499163-c8848c66ca85'],
  'nri-card-travel': ['passport-map', '1488085061387-422e29b40080'],
  'nri-hero': ['office-glass', '1486406146926-c627a92ad1ab'],
  'owner-living-sofa': ['living-d', '1600607687939-ce8a6c25118c'],
  'owner-mgmt-cta': ['desk-laptop-b', '1512428559087-560fa5ceab42'],
  'owner-mgmt-hero': ['bedroom-a', '1600573472592-401b489a3cdc'],
  'tenant-cta-man': ['living-c', '1586023492125-27b2c045efd7'],
  'tenant-services-hero': ['kitchen-b', '1600566753086-00f18fb6b3ea'],
  'hd-hero-living': ['living-d', '1600607687939-ce8a6c25118c'],
  'hd-rental-care': ['apt-exterior-b', '1460317442991-0ec209397118'],
};

async function main() {
  const cacheDirectory = process.argv[2];
  for (const [name, [candidate, id]] of Object.entries(images)) {
    let source;
    if (cacheDirectory) source = await readFile(path.join(cacheDirectory, `${candidate}.webp`));
    else {
      const response = await fetch(`https://images.unsplash.com/photo-${id}?w=2400&q=90&fm=webp&fit=max`);
      if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
      source = Buffer.from(await response.arrayBuffer());
    }
    const metadata = await sharp(source).metadata();
    if (metadata.width < 1920) throw new Error(`${name}: source too small; will not upscale`);
    const result = await sharp(source).rotate().resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 88, effort: 5 }).toFile(path.resolve(__dirname, '../public/brand', `${name}.webp`));
    console.log(`${name}: ${result.width}×${result.height}`);
  }
}

module.exports = { images };
if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });