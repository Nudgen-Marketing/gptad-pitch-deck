#!/usr/bin/env python3
"""Package only public deck files; no source docs or repository metadata."""
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'site'


def main():
    subprocess.run([sys.executable, str(ROOT / 'scripts/check-deck.py')], check=True)
    if SITE.is_symlink():
        raise RuntimeError("Refusing to replace a symlinked site directory")
    if SITE.exists():
        shutil.rmtree(SITE)
    SITE.mkdir()
    for name in ('gptad-pitch-deck.html', 'one-pager.html'):
        shutil.copyfile(ROOT / name, SITE / name)
    shutil.copyfile(ROOT / 'gptad-pitch-deck.html', SITE / 'index.html')
    shutil.copytree(ROOT / 'assets', SITE / 'assets', dirs_exist_ok=True)
    (SITE / '.nojekyll').touch()
    subprocess.run([sys.executable, str(ROOT / 'scripts/check-deck.py'), str(SITE)], check=True)
    print(f'Site packaged at {SITE}')


if __name__ == '__main__':
    main()
