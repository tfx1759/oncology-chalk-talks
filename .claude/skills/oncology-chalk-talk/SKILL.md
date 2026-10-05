---
name: oncology-chalk-talk
description: Build or correct one of Chris's oncology chalk-talk patient handouts (interactive Artifact + website page) in the tfx1759/oncology-chalk-talks repo.
---

# Oncology chalk talk

Chris (medical oncologist) uses these pages to walk patients through treatment choices, then prints them as a handout. Every talk shares one layout and one set of rules. Quality comes from the kit, the rules below and the browser check, not from reading older conversations, so do not re-read other talks in full.

## Where things are
- Repo `tfx1759/oncology-chalk-talks` (attach it with add_repo if it is not cloned). Read `kit/README.md` first: it is the contract for a talk folder.
- `talk-src/SLUG/`: title.txt, board.html, talk.js, talk.css, edits.json. Only these change for a talk.
- `kit/`: shared styles, toolbar, engine. Change only for fixes meant for every talk.
- `talks/SLUG.html` is built output and is the file published as the Artifact. Never hand-edit it.
- Project memory has each talk's Artifact link and its open clinical questions.

## New talk
1. Pick the closest existing talk as a base (same decision shape: adjuvant risk reduction, metastatic first line, etc.). Read only its talk.js and the parts of board.html you are replacing.
2. `python3 build.py new SLUG --from BASE`, then rewrite title.txt, board.html, talk.js, talk.css.
3. Research the trials Chris names (use subagents for literature when several trials are involved; keep notes in the scratchpad).
4. Add an entry to `site-src/talks.json`: slug, source `talks/SLUG.html`, title as a patient question, topic, summary, clinical tags (drug names, trial names, synonyms), updated date.
5. `python3 build.py --check --only SLUG`, fix anything it reports, then look at screenshots at 1100px and 390px and the printed blank PDF.
6. `python3 build.py --pdf --sync --only SLUG`, commit talk-src/, talks/, docs/ and site-src/ together, push main (GitHub Pages deploys from /docs).
7. Publish `talks/SLUG.html` as a new Artifact with `capabilities {"artifact":{}}` and a one-word icon.
8. Save a short memory file for the talk (link, slug, how the numbers were built, open points) and add it to MEMORY.md.
9. Reply to Chris: the link, that it is on the site, and the specific numbers or wording to check. Attach the Artifact and the blank PDF.

## Correcting a talk
1. Before changing anything, `Artifact read` the live Artifact. If its `<script id="edits">` JSON differs from `talk-src/SLUG/edits.json`, copy it in: those are Chris's saved edits and must never be lost.
2. Edit talk-src (or kit for a shared fix), run `python3 build.py --check --pdf --sync`, commit and push.
3. Republish to the existing Artifact URL.

## Clinical rules (Chris checks these closely)
- Every number and claim has a source in the footer references or the doctor box.
- Side-effect rows give the risk added over the usual background rate, from placebo-controlled data where it exists. Never present event rates from an active-comparator arm (e.g. ATAC) as side effects. When no placebo exists, say what the comparator is and note differing definitions (all-cause vs treatment-related).
- Model defaults (baseline risks, effect sizes) are assumptions: say in the reply which ones Chris must verify, and expose them as editable model numbers (CFG_SPEC).
- Say plainly when trials were never compared head to head, and when a blend of trials is shown.

## Layout rules
- Sections: 1 What we found, 2 How it works (diagram), 3 Choices (pros/cons cards), 4 Out of 100 people (icon chart or timeline), 5 Schedule and side effects, 6 What matters to you, 7 Also part of your care, 8 Plan and call us if. Footer with references.
- Patient fields start blank, never example numbers. Every patient choice lives in `S` and in `BLANK`. Any verdict that depends on patient answers waits until they are entered, and its element carries `data-live`.
- Plain language at about a 6th to 8th grade level; drug names with what they are ("a daily pill").
- Screen is the dark green chalkboard and print is white paper; both come from the kit, so do not restyle colours per talk.
- The page must pass `build.py --check`: no script errors, Clear ink and Print blank return the page to its loaded state, Undo restores, no sideways scroll at phone width.

## Keeping it cheap
- Do not read whole built pages in talks/ or docs/; read talk-src and kit/README.md.
- Do not re-derive the build: build.py does assembly, site, check, PDFs and the shared-folder sync.
- Write tests only for logic particular to the talk (e.g. a risk score); the generic check covers the rest.
