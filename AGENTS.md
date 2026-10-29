# GPTAd Customer Pitch Deck

## Project
English and Vietnamese customer decks for GPTAd, following the static HTML conventions of the sibling Mermail pitch deck repository.

## Canonical documents
- `gptad-pitch-deck.html`: nine self-contained slides, with embedded logo and DM Sans font.
- `gptad-pitch-deck-vi.html`: Vietnamese version of the nine-slide deck, with embedded Vietnamese fonts.
- `one-pager.html`: self-contained printable A4 customer overview.
- `DESIGN-SYSTEM-GPTAD.md`: brand tokens and presentation conventions.
- `docs/content-sources.md`: evidence, product status, and claim boundaries.

## Content conventions
- Customer audience, not an investor fundraising deck.
- Do not invent pricing, customer results, affiliation, advertising access, or campaign publishing.
- Mark mock conversations, data, and concepts as illustrative. Forma and Outline are fictional brands.
- Keep product-in-development and OpenAI independence disclosures.
- Link to `https://console.gptad.io` for early access and `https://cal.com/toannhu/30min` for demos.
- Use relative document links; essential assets and fonts remain embedded for offline viewing.
- Respect reduced motion, keyboard access, and print layouts.

## Verification
Run `python3 scripts/check-deck.py` and `python3 scripts/build-site.py`. Browser checks: `node scripts/check-browser.cjs` after installing Playwright outside this static repository or supplying `PLAYWRIGHT_MODULE`.

Never publish, push, or change repository settings without user authorization.
