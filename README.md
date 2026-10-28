# GPTAd — Customer Pitch Deck

English and Vietnamese customer presentations for [GPTAd](https://gptad.io), a product in development for conversational ad concepts, intent research, and competitor insights. Structured like the sibling `mermail-pitch-deck` repository: static HTML, canonical assets, presentation docs, validation scripts, and GitHub Pages deployment.

| File / folder | Purpose |
| --- | --- |
| `gptad-pitch-deck.html` | Ten-slide interactive customer deck; works directly from disk. |
| `gptad-pitch-deck-vi.html` | Vietnamese version of the ten-slide customer deck, with offline assets and print support. |
| `one-pager.html` | Printable A4 customer overview. |
| `assets/` | GPTAd brand assets, DM Sans and Noto Sans fonts, and font licenses. |
| `DESIGN-SYSTEM-GPTAD.md` | Brand tokens and layout conventions. |
| `docs/` | Content evidence and speaker notes. |
| `scripts/` | Dependency-free validation, public-site packaging, and optional browser checks. |
| `.github/workflows/` | Validation, preview artifacts, and GitHub Pages deployment. |
| `output/pdf/` | Browser-exported deck and overview PDFs. |

## View and present

Open `gptad-pitch-deck.html` (English), `gptad-pitch-deck-vi.html` (Vietnamese), or `one-pager.html` (English overview) in a modern browser. Logo and font are embedded; viewing and navigation work offline. External demo, contact, and early-access links require internet access.

Use **← / →**, **Page Up / Page Down**, **Home / End**, swipe, or the on-screen arrows. A slide can be linked directly with `#slide-6`. On small screens, scroll vertically to read the active slide. The language link switches between English and Vietnamese. The final slide links to the English one-page overview.

Use **Print / PDF** to print all ten slides as A4 landscape pages. Print the one-pager as A4 portrait. Set scale to 100%, enable background graphics, and disable browser headers/footers. Prepared PDFs are in `output/pdf/`; regenerate them when HTML changes.

## Validate and package

Requires Python 3.9+ with no third-party Python dependencies:

```sh
python3 scripts/check-deck.py
python3 scripts/build-site.py
python3 -m http.server 8000 --directory site
```

Open `http://localhost:8000`. Packaging creates an ignored `site/` directory containing only the public HTML, assets, and `.nojekyll`. Both language versions are included. It maps the English deck to `index.html` and validates packaged links.

Optional browser validation requires Node.js and Playwright with Chromium installed. Use an existing external Playwright installation without adding a build system to this repository:

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/node_modules/playwright node scripts/check-browser.cjs
```

If using an installed Google Chrome instead of Playwright Chromium, add `PLAYWRIGHT_CHANNEL=chrome`.

Browser checks run against both deck languages and the English overview. They cover navigation boundaries, links, touch gestures, viewport layouts, reduced motion, offline viewing, and print layouts. They export PDFs and QA screenshots; QA screenshots are ignored.

## Slides

1. Cover — Be part of the answer.
2. Problem — The shortlist starts with a question.
3. Audience — Founders, marketers, ecommerce brands, and agencies.
4. Solution — A connected research and creative workspace.
5. Workflow — Brief → questions → angles → concepts.
6. Intent research — Needs behind the prompt.
7. Competitor insights — Clearly labeled illustrative visibility gaps.
8. Ad studio — Two example message angles.
9. Early-access expectations — Product status, pricing, and platform limits.
10. Invitation — Demo, potential pilot, and design-partner introductions.

## GitHub Actions and Pages

Changes to either deck language trigger the workflow. It validates both versions and packages a downloadable `gptad-pitch-deck-preview` artifact for relevant pull requests, `main` pushes, and manual runs. Pull requests and manual runs from other branches cannot deploy. Only `main` pushes and manual runs from `main` upload a Pages artifact and run the deployment job. Only that job has `pages: write` and `id-token: write`.

When publication is authorized:

1. Push the repository to `Nudgen-Marketing/gptad-pitch-deck` on `main`.
2. In **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source.
3. Permit `main` in the `github-pages` environment's deployment branch policy.
4. Run the workflow from `main`, or push a relevant file change.

Expected routes:

- `https://nudgen-marketing.github.io/gptad-pitch-deck/`
- `https://nudgen-marketing.github.io/gptad-pitch-deck/gptad-pitch-deck.html`
- `https://nudgen-marketing.github.io/gptad-pitch-deck/gptad-pitch-deck-vi.html`
- `https://nudgen-marketing.github.io/gptad-pitch-deck/one-pager.html`

No custom domain is configured. If one is added later, update the sharing-image metadata and docs. GitHub deployment has not been exercised merely by running the local build. See [GitHub's workflow setup documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Content and licensing

Content verified against the live GPTAd website on **8 October 2026**. See [content sources](docs/content-sources.md) and [speaker notes](docs/speaker-notes.md). Previews are illustrative, pricing is unannounced, and campaign publishing is not available today. GPTAd is independent of OpenAI.

Brand assets come from GPTAd's landing page. DM Sans (English) and Noto Sans (Vietnamese) are distributed under the SIL Open Font License. Their licenses are included in `assets/DM-Sans-OFL.txt` and `assets/Noto-Sans-OFL.txt`.
