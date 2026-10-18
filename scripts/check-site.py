"""Validate the static catalog and version-local resource closure. Standard library only."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import unquote, urlsplit
import re

ROOT = Path(__file__).resolve().parents[1]
SKIP = {'.git', '.cache', '__pycache__'}


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path, self.ids, self.links, self.h1 = path, set(), [], 0
        self.feed(path.read_text(encoding='utf-8'))

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, (self.path, 'duplicate ID', attrs['id'])
            self.ids.add(attrs['id'])
        self.h1 += tag == 'h1'
        for key in ('href', 'src'):
            if attrs.get(key):
                self.links.append((attrs[key], tag == 'a' and key == 'href'))


files = [p for p in ROOT.rglob('*') if not SKIP.intersection(p.relative_to(ROOT).parts)]
assert not any(p.is_symlink() for p in files), 'Keep versions independent: symbolic links are not allowed'
pages = {p.resolve(): Page(p) for p in files if p.suffix == '.html'}
checked = 0


def check_url(path, url, navigation=False):
    global checked
    parsed = urlsplit(url)
    if parsed.scheme or parsed.netloc:
        assert navigation or parsed.scheme == 'data', (path, 'external runtime resource', url)
        return
    assert not parsed.path.startswith('/'), (path, 'use portable relative paths', url)
    target = (path.parent / unquote(parsed.path)).resolve() if parsed.path else path.resolve()
    assert target.is_relative_to(ROOT), (path, 'reference escapes repository', url)
    version = next((ROOT / part for part in path.relative_to(ROOT).parts[:1] if re.fullmatch(r'v\d+', part)), None)
    if version:
        archive_navigation = navigation and target.is_relative_to(ROOT / 'drafts')
        assert target.is_relative_to(version) or archive_navigation, (path, 'reference escapes version', url)
    if target.is_dir():
        target /= 'index.html'
    assert target.is_file(), (path, 'missing resource', url)
    if parsed.fragment and target in pages:
        assert unquote(parsed.fragment) in pages[target].ids, (path, 'missing fragment', url)
    checked += 1


for path, page in pages.items():
    assert page.h1 == 1, (path, 'expected one h1', page.h1)
    for url, navigation in page.links:
        check_url(path, url, navigation)
for path in files:
    if path.suffix == '.css':
        text = path.read_text(encoding='utf-8')
        for url in re.findall(r'url\(([^)]+)\)', text):
            check_url(path, url.strip(' \t\r\n\'"'))
        for url in re.findall(r'@import\s+[\'"]([^\'"]+)[\'"]', text):
            check_url(path, url)
print(f'PASS: {len(pages)} pages, {checked} local references, unique IDs, fragments, and version isolation.')
