const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const sharp = require('sharp');
const { images } = require('./prepare-editorial-images.cjs');

test('replacement editorial photographs are HD WebP assets, not small mockup crops', async () => {
  assert.equal(Object.keys(images).length, 21);
  for (const name of Object.keys(images)) {
    const image = await sharp(path.resolve(__dirname, '../public/brand', `${name}.webp`)).metadata();
    assert.equal(image.format, 'webp', name);
    assert.ok(image.width >= 1920, `${name}: width ${image.width}`);
    assert.ok(image.height >= 1080, `${name}: height ${image.height}`);
  }
});