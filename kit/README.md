# The shared chalk-talk kit

Every talk is built from this kit plus its own folder in `talk-src/`. `python3 build.py` inlines both
into one self-contained page, `talks/SLUG.html`, which is what gets published as a claude.ai artifact
and wrapped for the website. Change the kit once and every talk picks it up on the next build.

- `kit.css`: palette (dark green chalkboard on screen, white paper in print), type, layout, print rules,
  Edit mode and blank-handout styles, and components shared by several talks (`.facts`, `.tag`, `.opts.three`, …).
- `toolbar.html`: Step by step, Marker and colours, Undo, Clear ink, Print, Print blank, Edit, Library link.
- `engine.js`: step-by-step reveal, marker layer, Clear ink / Undo (`wipe()`), Print and Print blank,
  `?print=blank`, Edit mode with saving through the artifact runtime.

## What a talk folder must provide

`board.html` holds what goes inside `<main class="board">`:
- `header.top` with the title, patient name field and `#visitDate` (Clear ink keeps the date).
- One `section.step` per numbered part (usually 8: what we found, how it works, choices, out of 100 people,
  schedule and side effects, values, also part of your care, plan). Step by step reveals them in order.
- A doctor box `div.dr.noprint#drPanel` (in the outcome section): sources and notes for the doctor. Edit mode
  adds the model numbers here. Inputs inside `.dr` are never wiped.
- `div.pick.chips#planPick` in the plan section, `textarea.lines` for free text, and a `footer` with references.
- `data-live` on any element whose text the script rewrites (tags, verdicts, captions), so Edit mode skips it.
  `#say` and `#verdict` are skipped automatically.
- `.blank-only` for things shown only on the blank handout (for example a legend to circle by hand).

`talk.js` runs inside the page's closure after `$`, `$$`, `PRISTINE` and `EDITS` exist, and must define:
- `CFG_DEFAULTS`, `CFG = { ...CFG_DEFAULTS, ...(EDITS.settings || {}) }`, `CFG_SPEC` (`{ k, step, label }` per
  model number shown in Edit mode) and `onCfg(key)` (usually `() => render()`).
- `BLANK`: every patient choice held in `S`, set to its blank value (`plan: null` at least).
  `S = { sel: '…', ...BLANK }`. Clear ink and Print blank do `Object.assign(S, BLANK)`.
- `render()`: draws everything from `S` and `CFG`, and calls `autosize()`.
- `autosize()`: grows `textarea.lines` to fit.

## House rules the check enforces
`python3 build.py --check` opens each built talk and fails if there is a script error, a patient field is filled
on load, Clear ink or Print blank does not return the page to how it loaded, Undo or the end of printing does not
bring the visit back, Edit mode offers live text, or the page scrolls sideways at phone width.

## Starting a new talk
`python3 build.py new SLUG --from EXISTING-SLUG` copies the closest existing talk's folder (with its saved edits
cleared). Rewrite its content, add the talk to `site-src/talks.json`, then `python3 build.py --check --only SLUG`.
