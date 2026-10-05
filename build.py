#!/usr/bin/env python3
"""One command to build every chalk talk and the website.

  python3 build.py                 assemble talk-src/* into talks/*.html, then build docs/
  python3 build.py --check         ...and run the browser check on every talk (tools/check.js)
  python3 build.py --pdf           ...and print each blank handout PDF (tools/blank-pdf.js)
  python3 build.py --sync          ...and refresh the shared copy in /mnt/project-files/chalk-talks/
  python3 build.py --only SLUG     limit --check and --pdf to one talk (repeatable)
  python3 build.py new SLUG --from EXISTING   start a new talk from a copy of an existing one

A talk's source is a folder talk-src/SLUG/ holding only what is particular to that talk:
  title.txt    the page <title>
  talk.css     extra styles (may be empty)
  board.html   the sections inside <main class="board">, after the marker canvas
  talk.js      content, model numbers (CFG), state (S, BLANK) and render()
  edits.json   Chris's saved Edit-mode changes, copied from the live artifact
Everything shared (styles, toolbar, step-by-step, marker, Clear ink, printing, Edit mode)
lives in kit/ and is inlined by this script, so each built talks/SLUG.html is still one
self-contained page that can be published as a claude.ai artifact as is.
"""
import argparse, json, pathlib, shutil, subprocess, sys, zipfile

import build_site

ROOT = pathlib.Path(__file__).resolve().parent
KIT, SRC, TALKS = ROOT / "kit", ROOT / "talk-src", ROOT / "talks"
SHARED = pathlib.Path("/mnt/project-files/chalk-talks")

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:'
         'ital,wght@0,400;0,700;1,400&family=Kalam:wght@400;700&display=swap">\n')
JS_START = '''<script>
(() => {
  const PRISTINE = document.body.innerHTML;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  let EDITS = {};
  try { EDITS = JSON.parse($('#edits').textContent) || {}; } catch (e) {}
'''


def assemble(slug):
    d = SRC / slug
    part = lambda name: (d / name).read_text()
    edits = json.dumps(json.loads(part("edits.json")), ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")
    own = part("talk.css").strip("\n")
    css = (KIT / "kit.css").read_text().rstrip("\n") + ("\n/* " + slug + " */\n" + own if own else "")
    page = (f'<title>{part("title.txt").strip()}</title>\n' + FONTS + "<style>\n" + css + "\n</style>\n"
            f'<script type="application/json" id="edits">{edits}</script>\n\n'
            + (KIT / "toolbar.html").read_text().rstrip("\n") + "\n\n"
            '<main class="board" id="board">\n  <canvas id="ink" aria-hidden="true"></canvas>\n\n'
            + part("board.html").rstrip("\n") + "\n</main>\n\n"
            + JS_START + part("talk.js").rstrip("\n") + "\n\n"
            + (KIT / "engine.js").read_text().rstrip("\n") + "\n</script>\n")
    (TALKS / f"{slug}.html").write_text(page)
    return page


def node(script, slugs):
    r = subprocess.run(["node", str(ROOT / "tools" / script), str(ROOT / "docs"), *slugs])
    if r.returncode:
        sys.exit(f"{script} failed")


def sync():
    """Mirror the repo into the project's shared folder: flat talk pages, standalone copies, site/ and its zip."""
    talks = json.loads((ROOT / "site-src/talks.json").read_text())
    for t in talks:
        body = (ROOT / t["source"]).read_text()
        (SHARED / f'{t["slug"]}.html').write_text(body)
        (SHARED / f'{t["slug"]}-standalone.html').write_text(build_site.SKELETON + body + "\n</body></html>\n")
    flat = [{**t, "source": pathlib.Path(t["source"]).name} for t in talks]
    (SHARED / "site-src").mkdir(exist_ok=True)
    (SHARED / "site-src/talks.json").write_text(json.dumps(flat, indent=2, ensure_ascii=False) + "\n")
    shutil.copy(ROOT / "site-src/index.template.html", SHARED / "site-src/index.template.html")
    (SHARED / "build_site.py").write_text((ROOT / "build_site.py").read_text()
                                          .replace('ROOT / "site-src", ROOT / "docs"', 'ROOT / "site-src", ROOT / "site"'))
    build_site.main(SHARED / "site")
    shutil.copy(SHARED / "site-src/README.md", SHARED / "site/README.md")  # the shared copy keeps its own deploy guide
    with zipfile.ZipFile(SHARED / "chalk-talks-site.zip", "w", zipfile.ZIP_DEFLATED) as z:
        for f in sorted((SHARED / "site").rglob("*")):
            if f.is_file():
                z.write(f, f.relative_to(SHARED / "site"))
    print(f"Synced {len(talks)} talks to {SHARED}")


def new(slug, base):
    if (SRC / slug).exists():
        sys.exit(f"talk-src/{slug} already exists")
    shutil.copytree(SRC / base, SRC / slug)
    (SRC / slug / "edits.json").write_text('{"text": {}, "settings": {}}\n')
    print(f"Copied talk-src/{base} to talk-src/{slug}. Next: rewrite title.txt, board.html, talk.js and talk.css,\n"
          f"add an entry to site-src/talks.json, then run python3 build.py --check --only {slug}")


def main():
    if sys.argv[1:2] == ["new"]:
        a = argparse.ArgumentParser(prog="build.py new")
        a.add_argument("cmd"); a.add_argument("slug"); a.add_argument("--from", dest="base", required=True)
        a = a.parse_args()
        return new(a.slug, a.base)
    a = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    a.add_argument("--check", action="store_true"); a.add_argument("--pdf", action="store_true")
    a.add_argument("--sync", action="store_true"); a.add_argument("--only", action="append", default=[])
    a = a.parse_args()
    slugs = sorted(p.name for p in SRC.iterdir() if (p / "talk.js").exists())
    for s in slugs:
        assemble(s)
    print(f"Assembled {len(slugs)} talks into talks/")
    build_site.main()
    picked = a.only or slugs
    if a.check:
        node("check.js", picked)
    if a.sync:
        sync()
    if a.pdf:
        node("blank-pdf.js", picked)


if __name__ == "__main__":
    main()
