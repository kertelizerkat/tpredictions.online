# Predicter redesign — verification audit

Owner: **verifier**. Harness (Lead-owned): `_preview/preview.html`, `_preview/fixtures.js`,
`_preview/integration.html`. Contract: `_preview/DESIGN.md`. Rig: `_preview/tools/shoot.ps1`,
`_preview/tools/probe.ps1` (+ `-DryRun` plan checks).

**Audit status: STATIC PASS — VISUAL NOT INDEPENDENTLY VERIFIED (delegated to Lead).**
Late fixes landed at ~15:39–15:47 (report head `<header>` → `<div>`; premium 2× scale removed;
dark surfaces lightened). Per Lead instruction the screenshot matrix was stopped; the only
captured PNGs (`win-*` dark/light 1280/390 from ~15:39–15:41, `loading-*`) are **stale
pre-fix** and are NOT used for a visual verdict. Lead is taking the final fresh screenshots.
No Chrome was run after the stop order (last matrix attempt aborted before capture).

## 1. Harness validation (task-3, pre-implementation) — PASS

Evidence: `_preview/shots/` (`win-dark-1280.png` 32 437 B, `win-dark-390.png` 25 557 B,
`win-light-390.png` 214 643 B at validation time, + matching `dom-*.html`/`console-*.log`).

| # | Check | Result |
|---|---|---|
| H1 | percent-encoded `file://` URL loads preview | PASS |
| H2 | `?theme=light` → `<html class="pvr-light">` + `styles2.css` | PASS |
| H3 | theme switch is visual (dark vs light) | PASS |
| H4 | screenshot pipeline valid PNGs, 1280 + 390 | PASS (3/4; 4th hit a Chrome handle race, fixed with move-retry) |
| H5 | DOM dump exposes `PVR <level>: <status>` + `#pvr-status[data-level]` | PASS |
| H6 | console capture, no JS errors | PASS |
| H7 | fixtures cover every fixture-backed `data-case` | PASS |
| H8 | `probe.ps1` integration probe | PASS (Lead ran it: **ITEST PASS 36/36**, 0 page errors) |

Harness bugs: none functional in Lead-owned files. Minor DESIGN doc drift (case list in
§Testing is a subset of preview.html's supported cases). Verifier rig fixes during task-3:
Chrome helper handle race (move retry), `-File` comma-list binding (in-script split + `-DryRun`).

## 2. Screenshot matrix — NOT USED (stale/pre-fix)

Requested budgeted matrix (`win,draw,unpredictable,empty,error,loading` × dark/light ×
1280/390 + win dark 320/768 + partial light 1280) was **not captured post-fix**. Stale
pre-fix artifacts in `_preview/shots/`: `win-dark-1280.png`, `win-dark-390.png`,
`win-light-1280.png`, `win-light-390.png`, `loading-dark-390.png`,
`loading-light-1280.png`, `loading-light-390.png` (+ matching `dom-*`/`console-*` from
15:36–15:41). **Do not use for visual claims** — captured before the header/premium/surface
fixes; `win-dark-1280` even shows the pre-fix fixed-header lift-out bug.

DOM dumps from those stale runs still prove the renderer wiring (structure unchanged by the
fixes): `win-dark-1280` → title `PVR ok: rendered win`, `#pvr-status data-level="ok"`,
`<article class="pcr-report is-in" data-tone="win">`, 3 outcome values `54% 15% 31%`,
2 `.pcr-form`, 3 `role="img"` meters, `.pcr-sr` summary present, no `.comparison-*`;
console logs: zero `ERROR:CONSOLE` / `Uncaught`.

## 3. Static / source audit — **PASS** (checks that need no screenshots)

| # | Check | Evidence | Result |
|---|---|---|---|
| I1 | `predictor-view.js` before `main.js`, cache-busters `20261028-predictor-report-v1` | `Logged/index.html:487–488`; stylesheet/light-swap lines 12/19 bumped | PASS |
| I2 | `#predictor-input-hint` in both predictor templates, button text "Predict" | `Logged/js/main.js:39` and `:216`; button `Predict` at 40/217 | PASS |
| I3 | `enhanceTeamComparison` gone; no `.comparison-*` in JS/CSS | regex counts 0 in `main.js`, `predictor-view.js`, both stylesheets | PASS |
| I4 | renderer API complete | `window.PredictorView = { version, parse, render, renderEmpty, renderError, renderFallback }` (`predictor-view.js` ~426–433) | PASS |
| I5 | XSS rule: only raw-fallback `innerHTML` sink | `.innerHTML` count = 1 (`renderFallback` `.pcr-raw`); all model DOM built with `createElement`+`textContent` | PASS |
| I6 | report head element collision fixed | `el('div','pcr-head')` only; `el('header')` count 0 in current `predictor-view.js` (15:39:46). Global `header` position:fixed rules exist (`styles.css:91,548` / `styles2.css:110,633`) but no longer match the report head | PASS |
| I7 | premium 2× scale removed | `scale(2)` count 0 in current `main.js` (15:47:38); premium gets centred button + mode note (21 `premium` refs); remaining `style.transform` writes are mode-restore only | PASS |
| I8 | delegated actions: retry + example chip | `main.js:479–502` single `#contentArea` listener, `data-pcr-action` retry/example, chip sets `#input.value`, clears invalid/hint, focuses, no auto-submit | PASS |
| I9 | Enter key predicts | `main.js:359–360` `keypress` → Enter → `predict()` | PASS |
| I10 | main.js contract (busy/error/success/fallback) | busy: `.is-loading`, "Analysing…", disabled, `output[aria-busy=true]` + `replaceChildren` (649–665); classification auth→logout, no-results/format→`renderError`, else `render`→`renderFallback` (681–699); success `is-success`/"Predicted"→1200 ms restore, `scrollDown100px()`, `aria-busy=false` (694–733) | PASS |
| I11 | empty state on tab open per mode | `switchContent` line 290–291 → `refreshPredictorEmptyState(main_state)`; premium → premium empty variant, individual → examples (renderer `renderEmpty`) | PASS |
| I12 | progress panel untouched | progress IDs/classes identical in both templates (main.js 47–64 / 224–241) and all polling code calls existing IDs; `#predictor-progress` logic retained (571–667) | PASS |
| I13 | CSS scoping both themes | new block: 96 `.pcr-*` selectors each theme, 0 unscoped top-level `.pcr-*`; 98 lines start `.container33`; dark 16 392 B / light 16 395 B block; selector sets identical | PASS |
| I14 | required CSS behaviours present | `.container33 .container-bts` width/padding/radius; `#input` 46px + focus ring + `.is-invalid`; `.btn33` spinner/`:focus-visible`; `.pcr-report` (radius 14, padding clamp), outcome grid (≥640: 3 cols at 5318/5793), forms (≥760: 2 cols), meters 8px + `calc(var(--pcr-value)*1%)` + `.is-in` reveal 420 ms, form segments min 2px, `overflow-wrap:anywhere` ×25 per theme, `output.predictor-report-output` block/64rem | PASS |
| I15 | reduced-motion | `@media (prefers-reduced-motion: reduce)` present in both themes (2 blocks each incl. progress), report animations `none !important`, transitions disabled, meter widths final (`styles.css:5342–5361`, `styles2.css:5817–5836`) | PASS |
| I16 | focus visibility | `:focus-visible` rules ×8 per theme: `#input`, `.btn33`, `.pcr-example`, `.pcr-retry` all `outline: 2px solid var(--pcr-accent); outline-offset: 2px` | PASS |
| I17 | motion restraint | 4 finite `@keyframes` (`pcr-spin`, `pcr-shake`, `pcr-progress-in`, `pcr-reveal`); 0 `infinite` animations inside new blocks; reveal = 220 ms + 6 px stagger | PASS |
| I18 | token parity | exactly 17 `--pcr-*` tokens in each theme, identical names, no missing/extra. Dark intentionally lightened per Lead: bg `#171717` (DESIGN `#141414`), surface `#1e1e1e` (`#1a1a1a`), surface-2 `#262626` (`#202020`); light matches DESIGN exactly | PASS (DESIGN.md needs the dark values updated — see D4) |
| I19 | backend untouched | `App1.py` mtime 13:45:33 (untouched by redesign work) | PASS |
| I20 | integration harness | Lead ran `probe.ps1`: **ITEST PASS — 36/36 checks, 0 page errors**; independently re-running was explicitly out of scope | PASS (Lead evidence) |

## 4. Defect log (prioritised)

| ID | Sev | File:line / selector | Defect | Evidence | Suggested fix |
|---|---|---|---|---|---|
| D1 | P2 (a11y) | `Logged/css/styles.css:4659` `.container33 .pcr-eyebrow { color: var(--pcr-accent) }` + tokens `--pcr-accent:#007acc`, `--pcr-bg:#171717` | Eyebrow is 0.7rem (≈11.2 px) bold uppercase text; accent-on-bg contrast = **3.97:1**, below WCAG AA 4.5:1 for small text (light theme 4.51:1 passes). Also affects any small accent-on-report text. | token calc: luminance(#007acc)/luminance(#171717) = 3.97; `.pcr-eyebrow` font-size 0.7rem at styles.css:4659–4667 | In dark theme only: use a lighter accent for small text (e.g. `#4da3e0` ≈ 5.0:1) or `--pcr-muted` for `.pcr-eyebrow`, keeping `#007acc` for fills/large text; or add a dark `--pcr-accent-text` token |
| D2 | P3 (compat) | `Logged/js/main.js:620` `data.remaining ?? total - processed` | Nullish coalescing is ES2020; renderer task constraint said ES2017-compatible. Fine on Chrome 156 but fails to parse on older engines. | grep `\?\?` count 1 | Replace with `(data.remaining !== null && data.remaining !== undefined) ? data.remaining : (total - processed)` |
| D3 | P3 (contract) | `Logged/js/predictor-view.js` model returned by `parse()` | Internal model differs from DESIGN "Result model": `home: {name, form:{win,draw,loss}}` (nested) instead of `home:{name,winPct,drawPct,lossPct}`, no top-level `evidence`; `pick`/`outcomes`/`drawPct` match. No current consumer reads the model (main.js only checks `ok`; preview `ok`), so no functional impact. | grep `winPct`=0, `form: {`=2 in predictor-view.js 15:39:46 | Either align implementation to DESIGN or update DESIGN "Result model" to the emitted shape (prefer doc update; code works) |
| D4 | Info | `_preview/DESIGN.md` "Theme tokens" | DESIGN still lists old dark tokens (`#141414/#1a1a1a/#202020`); implementation intentionally lightened to `#171717/#1e1e1e/#262626` per Lead decision. Not a defect, but the authoritative doc is now stale. | token extraction §I18 | Update DESIGN dark token values |

No P0/P1 source-level defects found. Remaining risk is visual-only and is delegated to the
Lead's fresh screenshots.

## 5. Not independently verified (explicit gaps)

- **All visual checks** on post-fix build: hierarchy/readability, header lift-out fix,
  premium mode note/button, dark surface lightening, overflow at 320/390/768/1280,
  meter/bar widths, contrast as rendered, theme-token visual consistency, empty/error/loading
  visual states, reveal motion and reduced-motion *rendering*.
- `probe.ps1` integration re-run (Lead's ITEST 36/36 accepted as evidence; harness itself was
  validated in task-3).
- Keyboard focus ring *rendering* (static `:focus-visible` rules verified only).
- Backend response-variant handling beyond ITEST coverage (auth text, server-error body text)
  is code-reviewed, not end-to-end exercised against the Flask backend.

## 6. Verdict

**STATIC PASS** — renderer API/contract, main.js integration, both stylesheets (scoping,
token parity, required behaviours, reduced-motion, focus-visible), script ordering/cache
busters, XSS rule and "head element collision resolved" all verified from source. Lead's
integration harness: **ITEST PASS 36/36**. Two P3 notes (D2, D3) and one P2 accessibility
note (D1, dark small accent text 3.97:1) are actionable but non-blocking. Final visual PASS
requires the Lead's fresh post-fix screenshot matrix; this audit does not assert it.

## 11. Lead final pass (post-audit fixes + visual evidence)

Fixes applied after the static audit:
- **D1 (P2, contrast) fixed:** dark theme now defines `--pcr-accent-text: #4da3e0` and
  `.container33 .pcr-report:not(.pcr-report--error):not(.pcr-report--raw) .pcr-eyebrow`
  uses it (AA on `--pcr-bg: #171717`); light keeps `#007acc`.
- **Report head collision fixed:** `pcr-head` is a `div` (the dashboard's global
  `header { position: fixed }` rule was lifting it out of the card).
- **Premium mode cleaned up:** legacy `scale(2)` Initiate button removed; the card is
  centred with an explanatory mode note and a normal 44px action. Mode note element
  (`#predictor-mode-note`) added to both templates; M/T/E chips carry tooltips.
- **Dark surfaces** slightly lightened for card separation (#171717 / #1e1e1e / #262626).
- **Reveal robustness:** `is-in` is applied via double-rAF plus a 450ms fallback timer;
  screenshot mode (`?bare=1`) pins meter widths so captures show the settled state.

Final evidence (Lead inspected every image with read_image):
- `_preview/shots/win-dark-1280.png` — dark result report, header inside the card, meters filled.
- `_preview/shots/win-light-1280.png` — light result report parity.
- `_preview/shots/premium-empty-dark-1280.png` / `premium-empty-light-1280.png` — premium mode, normal-sized Initiate.
- `_preview/shots/win-dark-390css.png` — true 390px CSS viewport (780px @ DPR 2; raw 390 window is clamped by Windows Chrome).
- Integration: `probe.ps1` → **ITEST PASS, 36/36 checks, 0 page errors** after the final edits.

Verdict: PASS for the implemented scope (individual report, premium mode, progress/button
states, empty/error/loading/raw states). Real-backend payload variants remain untested
locally (no saved data/pkl in this checkout) — the parser is covered by format-faithful
fixtures, including multi-word teams, missing draw line and unpredictable picks.

## 12. Round 2 — tournament report + real-payload recovery (Lead)

User feedback after round 1: the T -> Initiate saved tournament report was still raw, and the dashboard
appeared to be missing report sections. Changes:

1. **Tournament report renderer** (`PredictorView.renderTournament`, main.js premium branch):
   `html.pkl`'s `<ydiv class="t-and-info">` blocks are parsed into a designed report: title/meta chips,
   filter box with live count, one expandable fixture row per saved block (time, teams, model pick,
   confidence; expanded = outcome probabilities + team form), notices for malformed entries, empty filter
   state, footnote. Falls back to the old raw view only when no block can be parsed.
2. **Missing form data fix:** the Flask `getinfo()` capability labels truncate multi-word team names, so
   "Manchester City" lines arrive as `Manchester's City's capability: 78%` without a result kind. The parser
   now recovers those untyped capability lines positionally (fixed payload order) and also handles two teams
   that share a first word. This is what made team-form sections disappear on real multi-word fixtures.
3. Screenshot rig: artifact moves are retry-safe (Chrome helper processes occasionally hold the file).

Evidence after these changes: `probe.ps1` -> **ITEST PASS** (renderer + tournament + filter + mangled
recovery checks), `_preview/shots/tournament-dark-1280.png`, `tournament-light-1280.png`,
`tournament-dark-390css.png`, `mangled-*.png`.
