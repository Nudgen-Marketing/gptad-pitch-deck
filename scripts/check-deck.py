#!/usr/bin/env python3
"""Dependency-free checks for the customer deck and packaged Pages site."""
import base64
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]


class Document(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []
        self.ids = []
        self.text = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if 'id' in attrs:
            self.ids.append(attrs['id'])

    def handle_data(self, data):
        self.text.append(data)


def validate(path, count, language='en'):
    assert path.is_file(), f'Missing {path.name}'
    source = path.read_text()
    doc = Document()
    doc.feed(source)
    assert len(doc.ids) == len(set(doc.ids)), f'Duplicate IDs in {path.name}'
    slides = [a for t, a in doc.tags if t == 'section' and 'slide' in a.get('class', '').split()]
    assert len(slides) == count, f'{path.name}: expected {count} slides, found {len(slides)}'
    assert any(t == 'html' and a.get('lang') == language for t, a in doc.tags)
    for name in ('viewport', 'description'):
        assert any(t == 'meta' and a.get('name') == name and a.get('content') for t, a in doc.tags), f'Missing {name}'
    assert any(t == 'meta' and a.get('property') == 'og:title' for t, a in doc.tags)
    text = ' '.join(doc.text).lower()
    disclosures = {
        'en': ('in development', 'illustrative', 'not affiliated', 'does not publish campaigns'),
        'vi': ('đang phát triển', 'minh họa', 'không liên kết', 'không hỗ trợ xuất bản chiến dịch'),
    }
    for phrase in disclosures[language]:
        assert phrase in text, f'Missing disclosure: {phrase}'
    if not count:
        assert 'pricing' in text, 'Missing pricing disclosure'
    assert '@media print' in source and '@page' in source, 'Missing print layout'
    assert 'data:image/png;base64,' in source and 'data:font/woff2;base64,' in source, 'Core assets must be embedded'
    for tag, attrs in doc.tags:
        for key in ('href', 'src'):
            value = attrs.get(key, '')
            if not value:
                continue
            if value.startswith('data:'):
                base64.b64decode(value.split(',', 1)[1], validate=True)
                continue
            url = urlsplit(value)
            if url.scheme:
                assert url.scheme in ('https', 'mailto'), f'Unexpected scheme: {value}'
                if tag in ('img', 'script') or (tag == 'link' and attrs.get('rel') == 'stylesheet'):
                    raise AssertionError(f'External essential dependency: {value}')
                continue
            assert not value.startswith('/'), f'Root-relative URL breaks project Pages: {value}'
            if url.path:
                target = (path.parent / unquote(url.path)).resolve()
                assert target.is_relative_to(path.parent.resolve()) and target.is_file(), f'Broken local URL: {value}'
            elif url.fragment:
                assert unquote(url.fragment) in doc.ids, f'Broken anchor: {value}'
    for href in ('https://console.gptad.io', 'https://cal.com/toannhu/30min'):
        assert any(a.get('href') == href for _, a in doc.tags), f'Missing CTA: {href}'
    if count:
        assert [a['id'] for a in slides] == [f'slide-{i}' for i in range(1, count + 1)]
        assert 'prefers-reduced-motion' in source
        assert all(key in source for key in ('ArrowRight', 'ArrowLeft', 'Home', 'End', 'touchstart', 'touchend'))
    print(f'PASS {path.name}: metadata, {count} slides, assets, links, disclosures, print')


def main():
    root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT
    validate(root / 'gptad-pitch-deck.html', 9)
    validate(root / 'gptad-pitch-deck-vi.html', 9, 'vi')
    validate(root / 'one-pager.html', 0)
    if root != ROOT:
        assert (root / 'index.html').read_bytes() == (root / 'gptad-pitch-deck.html').read_bytes()
        assert (root / '.nojekyll').exists()
        print('PASS packaged homepage and .nojekyll')


if __name__ == '__main__':
    try:
        main()
    except (AssertionError, ValueError) as error:
        print(f'FAIL: {error}', file=sys.stderr)
        sys.exit(1)
