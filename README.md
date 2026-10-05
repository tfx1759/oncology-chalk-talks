# Oncology Chalk Talks

Interactive "chalk talk" pages for explaining treatment options in clinic, each of which prints as a
blank or filled-in patient handout. Published with GitHub Pages from the `docs/` folder.

## Layout
- `talk-src/SLUG/`: what is particular to each talk (title, board HTML, script, extra CSS, saved edits).
- `kit/`: everything the talks share (styles, toolbar, step-by-step, marker, printing, Edit mode). See `kit/README.md`.
- `build.py`: one command that assembles `talk-src/` + `kit/` into `talks/`, builds the site, and optionally
  checks every talk in a browser, prints blank handout PDFs and refreshes the project's shared folder.
- `talks/`: the built talk pages, one self-contained HTML file each (the page published as a claude.ai artifact).
  Do not edit by hand; edit `talk-src/` or `kit/` and run the build.
- `site-src/talks.json`: the library listing (title, topic, summary, search tags, updated date).
- `site-src/index.template.html`: the library home page.
- `build_site.py`: wraps each talk into a full page and writes the site to `docs/` (run by `build.py`).
- `docs/`: the built website. Do not edit by hand.
- `tools/`: the browser check and the blank-PDF printer used by `build.py`.

## Adding or updating a talk
1. New talk: `python3 build.py new SLUG --from CLOSEST-EXISTING-SLUG`, then rewrite its files in `talk-src/SLUG/`
   and add an entry to `site-src/talks.json`. Existing talk: edit its `talk-src/` folder.
2. If the talk's artifact has saved Edit-mode changes, copy its `edits` JSON into `talk-src/SLUG/edits.json` first.
3. `python3 build.py --check --pdf --sync`, then commit `talk-src/`, `talks/` and `docs/` together.

## Privacy
Pages are static. Patient details typed into a talk live only in the open browser tab and are never
stored or transmitted. Search engines are asked not to index the site (`robots.txt`, `noindex`).
