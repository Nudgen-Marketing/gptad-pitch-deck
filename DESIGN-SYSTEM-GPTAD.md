# GPTAd presentation design system

Derived from the current GPTAd landing page (`landing-page/src/styles.css`), checked 8 October 2026.

| Token | Value | Use |
| --- | --- | --- |
| Ink | `#202123` | Primary text and neutral actions |
| Muted | `#686a6a` | Supporting text |
| Paper | `#ffffff` | Slide surface |
| Surface | `#f7f7f7` | Cards and previews |
| Line | `#e7e8e7` | Borders and rules |
| Green | `#087f5b` | Emphasis and primary CTA |
| Green soft | `#edf6f1` | Intent cues and conversation bubbles |

DM Sans variable (Latin, normal) is embedded in each HTML document. Its SIL Open Font License is retained in `assets/DM-Sans-OFL.txt`. The canonical GPTAd mark is embedded; the `PTAd.` wordmark completes the G supplied by the mark, matching the website.

Use spacious white layouts, large sentence-case headlines, subtle gray cards, and a single green emphasis per headline. Conversation bubbles, workflow cards, intent tables, illustrative bars, and ad concepts explain the product. Avoid decorative charts that imply measured performance.

The deck adapts to viewport width and scrolls vertically on small screens rather than shrinking text. Desktop slides have presentation proportions. Print renders all ten slides as A4 landscape pages; the overview prints to one A4 portrait page. Use 100% scale and disable browser headers and footers.

No external stylesheet, script, or font request is needed to open either document. Metadata uses the repository's expected GitHub Pages URL for the sharing image; update this URL if a custom domain is configured.
