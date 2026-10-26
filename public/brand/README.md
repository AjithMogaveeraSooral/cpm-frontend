# Cypress website assets

- `cypress-logo.png`: the user-supplied Cypress tree/building symbol and original
  lettering, cropped, background removed and arranged horizontally for readable
  navigation. The tagline reads “Property Management” (the original “Software”
  word was removed on request; the untouched export is kept outside the repo).
- `cypress-mark.png`: the same supplied symbol for browser icons.
- `sudish-kumar.webp`: optimized copy of the supplied founder portrait, also
  present in the website-review document. Used on the home and founder pages.
- `property-hero.webp`, `remote-ownership.webp`: illustration-only crops from the
  supplied `Home_page.png` design board, referenced in review pages 7–8. Not
  listings or photographs of a claimed Cypress-managed property. The source
  board is only 785 × 2004; higher-resolution original illustrations would
  improve large-screen sharpness. No text, fake metrics or working controls
  are taken from the board.

- `hd-*.webp`: 1920px-wide editorial photographs from Unsplash (Unsplash
  License — free for commercial use, no attribution required). They are
  generic lifestyle/architecture images, not photographs of Cypress-managed
  properties. Source photo ids: `hd-hero-living` 1600607687939-ce8a6c25118c,
  `hd-hero-villa` 1600585154340-be6161a56a0c, `hd-plans-loft`
  1554995207-c18c203602cb, `hd-nri-flight` 1488085061387-422e29b40080,
  `hd-rental-care` 1460317442991-0ec209397118, `hd-home-guardian`
  1570129477492-45c003edd2be, `hd-land-guardian` 1500382017468-9049fed747ef,
  `hd-property-sales` 1582407947304-fd86f028f716, `hd-bengaluru-skyline`
  1596176530529-78163a4f7af2, `hd-maintenance-kitchen`
  1556912172-45b7abe8b7e1. Original HD exports use quality 78; replacements use 88.

The 19 legacy marketing-image filenames (about, contact, FAQ, inquiry, NRI,
owner and tenant services, and the marketplace hero) now contain 1920px-wide
editorial photographs, replacing the low-resolution design-board crops.
`scripts/prepare-editorial-images.cjs` records every source photo ID and can
regenerate these assets from Unsplash or a local candidate directory. These
are illustrations, not actual listings, Cypress staff or product screenshots.
The supplied founder portrait, logo and actual listing images are unchanged.

The script `web/scripts/prepare-brand-assets.cjs` regenerates the five assets
from the original 2816 × 1536 logo, portrait and 785 × 2004 design reference.
It accepts those three source paths as arguments. The original files are not
needed at build time. Next.js static image imports provide hashed URLs and
responsive image optimization; artwork is served locally, never hotlinked.