# Oncology Chalk Talks

Interactive "chalk talk" pages for explaining treatment options in clinic, each of which prints as a
blank or filled-in patient handout. Published with GitHub Pages from the `docs/` folder.

## Layout
- `talks/`: one HTML source per talk (the same page that is published as a claude.ai artifact).
- `site-src/talks.json`: the library listing (title, topic, summary, search tags, updated date).
- `site-src/index.template.html`: the library home page.
- `build_site.py`: wraps each talk into a full page and writes the site to `docs/`.
- `docs/`: the built website. Do not edit by hand; run the build.

## Adding or updating a talk
1. Put the talk source in `talks/` (or update the existing file).
2. Add or update its entry in `site-src/talks.json`.
3. Run `python3 build_site.py` and commit `docs/` with the change.

## Privacy
Pages are static. Patient details typed into a talk live only in the open browser tab and are never
stored or transmitted. Search engines are asked not to index the site (`robots.txt`, `noindex`).
