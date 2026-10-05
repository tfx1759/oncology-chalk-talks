#!/usr/bin/env python3
"""Build the Chalk Talks website from the talk sources.

Each talk source is the same body-only HTML that is published as a claude.ai artifact.
This wraps each one in a full document under docs/talks/ and writes the library page
docs/index.html from site-src/talks.json. The site is plain static files: host the
docs/ folder anywhere (GitHub Pages, Netlify, a hospital web server).
"""
import html, json, pathlib, re, shutil

ROOT = pathlib.Path(__file__).resolve().parent
SRC, OUT = ROOT / "site-src", ROOT / "docs"
SKELETON = ('<!doctype html><html lang="en"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
            '<meta name="robots" content="noindex">'
            '<style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);'
            'padding-bottom:env(safe-area-inset-bottom,0px)}html{scroll-padding-top:env(safe-area-inset-top,0px)}'
            'body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#faf9f5;color:#141413}'
            'img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>\n')


def page_text(src):
    """Words a reader sees in a talk, including the choices and tables its script draws."""
    strings = " ".join(re.findall(r"'([^'\\]*\s[^'\\]*)'", " ".join(re.findall(r"<script>(.*?)</script>", src, re.S))))
    visible = re.sub(r"<(script|style)\b.*?</\1>", " ", src, flags=re.S)
    visible = html.unescape(re.sub(r"<[^>]+>", " ", visible))
    return re.sub(r"\s+", " ", visible + " " + strings)


def card(t, src):
    e = html.escape
    find = " ".join([t["title"], t["topic"], t["summary"], *t.get("tags", []), page_text(src)])
    href = f'talks/{t["slug"]}.html'
    return f'''    <article class="talk" data-find="{e(find)}">
      <div class="eyebrow">{e(t["topic"])}</div>
      <h2><a href="{href}">{e(t["title"])}</a></h2>
      <p class="sum">{e(t["summary"])}</p>
      <div class="meta">Updated {e(t["updated"])}</div>
      <div class="acts">
        <a class="btn primary" href="{href}">Open talk</a>
        <a class="btn" href="{href}?print=blank" target="_blank" rel="noopener">Print blank</a>
      </div>
    </article>'''


def main(OUT=OUT):
    talks = json.loads((SRC / "talks.json").read_text())
    if OUT.exists():
        shutil.rmtree(OUT)
    (OUT / "talks").mkdir(parents=True)
    cards = []
    for t in talks:
        body = (ROOT / t["source"]).read_text()
        (OUT / "talks" / f'{t["slug"]}.html').write_text(SKELETON + body + "\n</body></html>\n")
        cards.append(card(t, body))
    page = (SRC / "index.template.html").read_text().replace("<!--TALKS-->", "\n".join(cards))
    (OUT / "index.html").write_text(page)
    (OUT / ".nojekyll").write_text("")
    (OUT / "robots.txt").write_text("User-agent: *\nDisallow: /\n")
    shutil.copy(SRC / "README.md", OUT / "README.md")
    print(f"Built {len(talks)} talks into {OUT}")


if __name__ == "__main__":
    main()
