# Cypress website assets

- `cypress-logo.png`: the user-supplied Cypress tree/building symbol and original
  lettering, cropped, background removed and arranged horizontally for readable
  navigation. The wording “Property Management Software” is preserved.
- `cypress-mark.png`: the same supplied symbol for browser icons.
- `sudish-kumar.webp`: optimized copy of the supplied founder portrait, also
  present in the website-review document. Used on the home and founder pages.
- `property-hero.webp`, `remote-ownership.webp`: illustration-only crops from the
  supplied `Home_page.png` design board, referenced in review pages 7–8. Not
  listings or photographs of a claimed Cypress-managed property. The source
  board is only 785 × 2004; higher-resolution original illustrations would
  improve large-screen sharpness. No text, fake metrics or working controls
  are taken from the board.

The script `web/scripts/prepare-brand-assets.cjs` regenerates the five assets
from the original 2816 × 1536 logo, portrait and 785 × 2004 design reference.
It accepts those three source paths as arguments. The original files are not
needed at build time. Next.js static image imports provide hashed URLs and
responsive image optimization; artwork is served locally, never hotlinked.