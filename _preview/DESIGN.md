# Predicter tab redesign — shared design contract

Status: authoritative for the current task. Do not change files outside your assigned write scope.

## Goal

Redesign the **Predicter** tab of `Logged/index.html`:
the post-click experience (button states + progress panel) and the prediction **result report**.

Requirements from the user:
- readabler / more comprehensible result data than the current `comparison-*` card layout
- consistent with the site's existing theme (dark = `Logged/css/styles.css`, light = `Logged/css/styles2.css`)
- responsive at 320px, 375px, 768px, 1024px, 1440px
- clean, restrained motion only. No glassmorphism, no neon, no gradient text, no bouncing/looping decorations, no emoji, no "AI slop".

## Current architecture (read before editing)

- `Logged/index.html` loads `Logged/css/styles.css` (dark, default). If `localStorage["theme_+-----"] === "Light"` it swaps to `Logged/css/styles2.css`.
- `Logged/js/main.js` owns the Predicter tab: `predicter_innerhtml` template, `switchContent()`, `predict()`, and the old `enhanceTeamComparison()`.
- The Flask backend (`App1.py` / `getinfo()`) is **not changed**. It returns an HTML string such as:

```html
<div id='vs_info'>
<span class='info_line'>Liverpool's wining capability:  <span class='green'>74%</span></span>
<span class='info_line'>Chelsea's wining capability:  <span class='red'>42%</span></span>
<span class='info_line'>Liverpool's Losing capability:  <span class='green'>21%</span></span>
<span class='info_line'>Chelsea's Losing capability:  <span class='red'>21%</span></span>
<span class='info_line'>Liverpool's Drawing capability:  <span class='green'>5%</span></span>
<span class='info_line'>Chelsea's Drawing capability:  <span class='red'>37%</span></span>
<span class='info_line chance_w'><span class='green'>Liverpool</span> has a 54% probability of wining</span>
<span class='info_line chance_w'><span class='red'>Chelsea</span> has a 31% probability of wining</span>
<span class='info_line chance_w'> Probability of Draw:  <span class='red'>15% </span></span>
<span class='info_line chance_w POutcome'>Prediction: <span class='green'>Liverpool</span> <span class='green'>(win)</span></span>
</div>
```

Other server responses that must be handled by `main.js`:
- `"No results found."` wrapped in a red span
- `"Format is incorrect! use: A vs B"`
- auth failure text (existing `logout()` path)
- network / non-200 errors

## New files / scopes

| Owner | Write scope |
|---|---|
| renderer | `Logged/js/predictor-view.js` (new), `Logged/js/main.js`, `Logged/index.html` |
| stylist | `Logged/css/styles.css`, `Logged/css/styles2.css` |
| verifier | `_preview/**` (harness, audit), read-only on site files |

## Renderer contract (`window.PredictorView`)

New file `Logged/js/predictor-view.js` (classic script, no modules, ES2017+, no dependencies, IIFE):

```js
window.PredictorView = {
  parse(rawHtml, query) -> model | null,
  render(outputEl, rawHtml, query) -> { ok: true, model } | { ok: false },
  renderFallback(outputEl, rawHtml, query),      // parse failed: readable raw report
  renderEmpty(outputEl, opts),                   // opts: { mode: 'individual'|'premium' }
  renderError(outputEl, opts),                   // opts: { kind: 'no-results'|'format'|'network'|'server', query, message }
};
```

Rules:
- Build all report DOM with `document.createElement` and set `textContent`. Never put server text into `innerHTML`.
- `render()` must call `output.replaceChildren(...)`, add class `predictor-report-output` to `output`, and mark the report for the CSS reveal animation.
- All interactive elements produced by the renderer use **data attributes**, not listeners (main.js delegates clicks on `#contentArea`):
  - `data-pcr-action="retry"` on retry buttons
  - `data-pcr-action="example"` + `data-pcr-example="Liverpool vs Chelsea"` on example chips
  - `data-pcr-action="focus-input"` if needed
- Progress polling stays in `main.js`; the progress panel markup/IDs stay unchanged.
- Keep the old function name `enhanceTeamComparison` **removed**; no dead code.

### Result model

```js
{
  query: 'Liverpool vs Chelsea',
  home: { name, form: { win: 74, draw: 5, loss: 21 } },   // nulls when unknown
  away: { name, form: { win: 42, draw: 37, loss: 21 } },
  drawPct: 15,                                 // match draw probability, null if unknown
  outcomes: [ {key:'home', label:'Liverpool', pct:54}, {key:'draw', label:'Draw', pct:15}, {key:'away', label:'Chelsea', pct:31} ],
  pick: { label:'Liverpool to win', tone:'win'|'draw'|'unpredictable', pct:54|null, note:'...' },
  hasForm: true
}
```

Parser notes:
- Use `new DOMParser().parseFromString(rawHtml, 'text/html')`, read `.info_line` elements' `textContent` only.
- capability regex: `/^(.+?)['’]?s?\s+(wining|winning|losing|drawing)\s+capability\s*:\s*([\d.]+)\s*%/i`
  (server writes `Liverpool's wining capability`; accept the `wining` typo and multi-word team names)
- win-probability regex: `/^(.+?)\s+has\s+a\s+([\d.]+)\s*%\s+(?:probability|chance)\s+of\s+winn?ing/i`
- draw: `/draw\s+probability\s*:\s*([\d.]+)\s*%/i` or `probability of draw`
- prediction: `/prediction\s*:/i`; text contains `unpredictable` => tone `unpredictable`
- team order: query `Team A vs Team B` (case-insensitive, optional dot after vs) => A = home, B = away.
  If the query has no `vs`, fall back to first/second win-probability line order.
  Match names case-insensitively, trim punctuation, tolerate `'s`.
- probabilities may not sum to 100 across the three outcomes (rounding). Never force them; meters are individual 0–100 scales.
- if no outcome probabilities and no form capabilities and no pick => `render()` returns `{ok:false}` and main.js calls `renderFallback()`.
- Clamp every pct to 0..100; round to integers for display.

## DOM + class contract (renderer emits, stylist styles)

Root inserted into `div.output`:

```html
<article class="pcr-report" data-tone="win|draw|unpredictable|neutral">
  <p class="pcr-sr">…one-sentence screen-reader summary…</p>

  <header class="pcr-head">
    <p class="pcr-eyebrow">Match prediction</p>
    <h2 class="pcr-match">
      <span class="pcr-team">Liverpool</span>
      <span class="pcr-vs">vs</span>
      <span class="pcr-team">Chelsea</span>
    </h2>
    <p class="pcr-source">Based on stored team form and match-history records.</p>
  </header>

  <section class="pcr-pick" data-tone="win|draw|unpredictable">
    <p class="pcr-pick-label">Model pick</p>
    <p class="pcr-pick-value">Liverpool to win</p>
    <p class="pcr-pick-note">54% outcome probability</p>
  </section>

  <section class="pcr-section pcr-section--outcomes">
    <div class="pcr-section-head">
      <h3 class="pcr-section-title">Match outcome probabilities</h3>
      <p class="pcr-section-hint">Estimated chance of each result, from 0% to 100%.</p>
    </div>
    <div class="pcr-outcomes">
      <div class="pcr-outcome" data-pick="true" style="--pcr-delay:0ms">
        <div class="pcr-outcome-top">
          <span class="pcr-outcome-name">Liverpool</span>
          <strong class="pcr-outcome-value">54%</strong>
        </div>
        <div class="pcr-meter" role="img" aria-label="Liverpool win: 54%">
          <span class="pcr-meter-fill" style="--pcr-value:54"></span>
        </div>
        <span class="pcr-outcome-tag">Most likely</span>
      </div>
      <!-- draw + away, same shape; tag only on the single highest outcome -->
    </div>
  </section>

  <section class="pcr-section pcr-section--form">
    <div class="pcr-section-head">
      <h3 class="pcr-section-title">Team form</h3>
      <p class="pcr-section-hint">Historical result split for each team — separate from the match probabilities above.</p>
    </div>
    <div class="pcr-forms">
      <article class="pcr-form">
        <h4 class="pcr-form-team">Liverpool</h4>
        <div class="pcr-form-bar" role="img" aria-label="Liverpool historical form: 74% wins, 5% draws, 21% losses">
          <span class="pcr-form-seg pcr-form-seg--win" style="--pcr-value:74"></span>
          <span class="pcr-form-seg pcr-form-seg--draw" style="--pcr-value:5"></span>
          <span class="pcr-form-seg pcr-form-seg--loss" style="--pcr-value:21"></span>
        </div>
        <dl class="pcr-form-legend">
          <div><dt>Win</dt><dd>74%</dd></div>
          <div><dt>Draw</dt><dd>5%</dd></div>
          <div><dt>Loss</dt><dd>21%</dd></div>
        </dl>
      </article>
      <!-- away team, same shape -->
    </div>
  </section>

  <p class="pcr-footnote">Predictions are estimates from saved match data, not guarantees.</p>
</article>
```

Empty state (same `output.predictor-report-output` wrapper):

```html
<article class="pcr-report pcr-report--empty">
  <p class="pcr-eyebrow">Match prediction</p>
  <h2 class="pcr-empty-title">Ready when you are</h2>
  <p class="pcr-empty-text">Enter a fixture as <strong>Team A vs Team B</strong>, then select Predict. Results use saved team form and match-history records.</p>
  <div class="pcr-examples">
    <button type="button" class="pcr-example" data-pcr-action="example" data-pcr-example="Liverpool vs Chelsea">Liverpool vs Chelsea</button>
    <button type="button" class="pcr-example" data-pcr-action="example" data-pcr-example="Arsenal vs Tottenham">Arsenal vs Tottenham</button>
  </div>
</article>
```

Premium mode empty state: same root, title "Saved tournament report", text "Select Initiate to open the prepared tournament report.", no examples.

Error state: `article.pcr-report.pcr-report--error` with `p.pcr-eyebrow`, `h2.pcr-error-title`, `p.pcr-error-text`, and a `button.pcr-retry` (`data-pcr-action="retry"`) labelled "Try again". `renderError` variants:
- `no-results`: title "No saved data for this fixture"; text includes the query and asks to check spelling / try another fixture. Retry = run predict again.
- `format`: title "Check the match format"; text "Use Team A vs Team B, for example Liverpool vs Chelsea."
- `network`: title "Could not reach the prediction service"; text "Check the connection and try again."
- `server`: title "Prediction could not be completed"; text from server (sanitised textContent) or generic.

Fallback state: `article.pcr-report.pcr-report--raw` with `p.pcr-error-title` "Report format not recognised", `p.pcr-error-text` "The saved report was shown in its original form.", then `div.pcr-raw` containing the raw server HTML (the only `innerHTML` sink, same trust level as before). Style `.pcr-raw` readable (`.pcr-raw .info_line { display:block; }` etc.).

## main.js integration contract

1. Remove `enhanceTeamComparison()` entirely.
2. `predict()`:
   - read `#predictor-input-hint`, `#input`, `.btn33`, `.output`, `#predictor-progress` as today
   - empty query (non-premium): show hint "Enter two teams, for example Liverpool vs Chelsea."; add `.is-invalid` to the input; `input.focus()`; return without network call.
   - on input event: clear `.is-invalid` + hide hint.
   - while busy: `button.classList.add('is-loading')`, `button.textContent='Analysing…'`, `button.disabled=true`, output `aria-busy="true"` and `replaceChildren()` (clear stale result). Keep existing progress panel logic untouched.
   - response classification (check before render):
     - auth text => `logout()`, return
     - `/no results found/i` => `renderError({kind:'no-results', query})`
     - `/format is incorrect/i` => `renderError({kind:'format', query})`
     - otherwise `render()`; if `ok === false` => `renderFallback()`
   - on success: `button.classList.add('is-success')`, `button.textContent = 'Predicted'`, then after 1200 ms remove class / restore `'Predict'`.
   - `finally`: dismiss progress, `output.setAttribute('aria-busy','false')`, restore `button.disabled=false` and, when not in the success window, label `'Predict'`.
   - keep `scrollDown100px()` call after a successful render.
3. `switchContent('predicter')`: keep the M/T/E mode logic; in the 3 mode click handlers change `btn33.textContent = 'Submit'` => `'Predict'`. When `out_.innerHTML === ''`, render the empty state: individual mode => examples, premium => premium empty variant.
4. Add one delegated click listener on `#contentArea` (top-level, once):
   - `[data-pcr-action="retry"]` => `predict()`
   - `[data-pcr-action="example"]` => set `#input.value = data-pcr-example`, focus, clear invalid/hint; do not auto-submit
5. Add `<script src="js/predictor-view.js?v=20261028-predictor-report-v1"></script>` immediately **before** `js/main.js` in `Logged/index.html`.
6. Bump cache-buster query params in `Logged/index.html` from `20261028-manual-predictor-layout-v3` to `20261028-predictor-report-v1` (stylesheet link, light-theme swap, `main.js`).
7. In **both** predictor templates (`predicter_innerhtml` and `contentMap.predicter`) add under the input label:
   `<p id="predictor-input-hint" class="predictor-input-hint" hidden></p>`
   and keep the initial button text `Predict`.

## Theme tokens (stylist writes these; both files must look like the same product)

Dark — `Logged/css/styles.css` (default theme, black page, #333 borders, #007ACC accent):

```
--pcr-bg: #171717;          /* report surface */
--pcr-surface: #1e1e1e;     /* nested cards */
--pcr-surface-2: #262626;
--pcr-border: #3a3a3a;
--pcr-border-strong: #4d4d4d;
--pcr-text: #e6e6e6;
--pcr-muted: #9aa5b1;
--pcr-accent: #007acc;      /* fills / large text only */
--pcr-accent-hover: #1a8fd9;
--pcr-accent-text: #4da3e0; /* small accent text, AA on #171717 */
--pcr-accent-soft: rgba(0, 122, 204, 0.16);
--pcr-success: #2ecc71;
--pcr-success-soft: rgba(46, 204, 113, 0.14);
--pcr-warning: #f0a020;
--pcr-warning-soft: rgba(240, 160, 32, 0.14);
--pcr-danger: #ef5350;
--pcr-danger-soft: rgba(239, 83, 80, 0.14);
--pcr-track: #303030;
```

Light — `Logged/css/styles2.css` (white page, slate borders, #007ACC accent):

```
--pcr-bg: #ffffff;
--pcr-surface: #f7f9fc;
--pcr-surface-2: #eef3f8;
--pcr-border: #dbe4ef;
--pcr-border-strong: #c5d2e2;
--pcr-text: #1f2937;
--pcr-muted: #5b6b7f;
--pcr-accent: #007acc;
--pcr-accent-hover: #00659f;
--pcr-accent-soft: #e6f2fa;
--pcr-success: #15803d;
--pcr-success-soft: #e7f6ec;
--pcr-warning: #b45309;
--pcr-warning-soft: #fdf1e2;
--pcr-danger: #b91c1c;
--pcr-danger-soft: #fdecec;
--pcr-track: #e5edf5;
```

Shared: font `"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`; tabular numbers for values
(`font-variant-numeric: tabular-nums`); report radius 14px, nested cards 10px; report padding
`clamp(16px, 2.4vw, 28px)`; section gap `clamp(16px, 2vw, 24px)`; 1px borders; no box-shadows heavier than
`0 6px 18px rgba(0,0,0,.12)` dark / `0 6px 18px rgba(15,23,42,.06)` light.

## Required CSS behaviours (stylist)

1. Replace the existing blocks:
   - dark: `styles.css` `/* Manual predictor results ... */` block (approx lines 4221–4329, includes all `.comparison-*` rules)
   - light: `styles2.css` `/* Manual predictor results follow ... */` block (approx lines 4696–4735)
   with a complete new section for: form/input/button/hint states, progress panel overrides, report, empty, error, raw fallback, responsive, reduced motion.
2. Do not restyle other tabs. Scope selectors under `.container33`, `.predictor-progress`, `.predictor-input-hint`.
3. Form panel: `.container33 .container-bts` becomes `width: min(100%, 34rem)`, `height:auto`, `padding: clamp(16px,2.4vw,24px)`, 1px border, 14px radius, report background. Keep existing DOM (`.cap`, `#label33`, `#input`, `.btn33`, `#M/#T/#E`).
   `.container33 .cap img { width: 34px !important; height: 34px !important; }` (current template uses inline 50px).
   Input+button: on ≥560px they may sit in one row (input grows, button fixed min 8rem); below 560px stack, input `width:100%`.
4. Override the old mobile rules that force `#input { width:50% }` and `.container-bts` fixed 300px height.
5. `.container33 #input` 46px height, 1px border, 10px radius, surface background, text colour, accent focus ring
   (`box-shadow: 0 0 0 3px var(--pcr-accent-soft)`), `.is-invalid` danger ring + one 320 ms shake animation.
   `.predictor-input-hint`: small danger text, `margin-top: 4px`, no icon.
6. `.btn33` = accent background, white text, 44px height, 10px radius, `inline-flex` centred, weight 650,
   transitions for background/transform; `:hover` accent-hover, `:active` `scale(.985)`, `:focus-visible` 2px outline,
   `:disabled` opacity .65 + cursor progress. `.btn33.is-loading::before` = 14px spinner
   (`border:2px solid rgba(255,255,255,.35); border-top-color:#fff; animation: pcr-spin .8s linear infinite`).
   `.btn33.is-success` = success background. Never use transform scale on the whole button beyond states above
   (premium mode's inline `scale(2)` must keep working).
7. Progress panel: theme-aware surface, title + detail + percent + 6px track with accent fill + meta row,
   `aria` untouched. Keep the existing IDs/classes exactly.
8. Report typography/hierarchy per contract; match title `clamp(1.3rem, 1.1rem + 1.2vw, 1.9rem)`, weight 700;
   eyebrow 0.7rem uppercase letter-spacing .12em accent; pick value `clamp(1.15rem, 2vw, 1.45rem)`;
   outcome value 1.35rem with tabular nums; form legend 0.72–0.82rem.
9. Outcome grid: 3 columns ≥640px, 1 column below; form grid: 2 columns ≥760px, 1 below.
   Pick row: horizontal on ≥640px (label left, note right), stacked below.
10. Meters: `.pcr-meter` 8px track; `.pcr-meter-fill` width `calc(var(--pcr-value) * 1%)` starting at 0 and
    transitioning to the value after `.pcr-report.is-in` is present (renderer adds `is-in` on rAF).
    Form segments are a flex row with widths `calc(var(--pcr-value) * 1%)`, minimum 2px for non-zero values,
    `overflow:hidden`, first/last child round the outer corners only.
11. Reveal animation: `.pcr-report` children (head, pick, sections) fade/translate 6px over 220ms with
    `--pcr-delay` stagger (+40ms each) only when `.is-in`; no infinite animations anywhere.
12. `@media (prefers-reduced-motion: reduce)`: no transforms/transitions/animations; bars at final width immediately.
13. Make sure report text is always left aligned (old `.output` is `text-align:center` and flex), and
    `output.predictor-report-output { display:block; width:min(100%, 64rem); margin-inline:auto; overflow:visible; }`.
14. No horizontal overflow at 320px; long team names wrap with `overflow-wrap:anywhere`.
15. Never rely on colour alone: "Most likely" tag, labels, and aria-labels carry meaning.

## Testing / verification

- `_preview/preview.html` renders real `Logged/js/predictor-view.js` with `_preview/fixtures.js`.
  Query params: `?theme=dark|light`, `?case=win|draw|away|unpredictable|partial|empty|error|loading`, `?bare=1`.
- Verifier runs headless Chrome (isolated profile, no proxy) only in one batched command per pass, screenshots into
  `_preview/shots/`, and reports concrete defects with file/line references.
- Acceptance: both themes at 1280px and 390px, all states, no console errors, no overflow, keyboard focus visible,
  reduced-motion path works, parsing resilient to multi-word teams / "wining" typo / missing draw line.

## Tournament report renderer (T -> Initiate) — added after user feedback

`App1.py /premium` returns `html.pkl`, a sequence of saved blocks:

```html
<ydiv class="t-and-info"><span class="time">14:30</span>
  <div id="vs_info">…same info_line payload as one fixture…</div>
</ydiv>
```

`window.PredictorView` additionally exposes:

```js
PredictorView.parseTournament(rawHtml) -> { entries: [{time, model, reason}], notices: [] }
PredictorView.renderTournament(outputEl, rawHtml) -> true | false   // false => caller keeps raw fallback
```

Rendered DOM contract (classes are styled in both themes):

```html
<article class="pcr-report pcr-report--tournament">
  <p class="pcr-sr">…summary…</p>
  <div class="pcr-head">
    <p class="pcr-eyebrow">Saved tournament report</p>
    <h2 class="pcr-match">Tournament predictions</h2>
    <p class="pcr-source">…</p>
    <div class="pcr-tournament-meta"><span class="pcr-tournament-chip">N fixtures</span>…</div>
  </div>
  <div class="pcr-tournament-notice">…optional malformed-entry note…</div>
  <div class="pcr-tournament-toolbar">
    <label class="pcr-tournament-search-wrap"><input class="pcr-tournament-search"></label>
    <span class="pcr-tournament-count">N fixtures</span>
  </div>
  <div class="pcr-tournament-list">
    <div class="pcr-fixtures">
      <details class="pcr-fixture" data-search="…">
        <summary class="pcr-fixture-summary">
          <span class="pcr-fixture-time">14:30</span>
          <span class="pcr-fixture-teams">Liverpool vs Chelsea</span>
          <span class="pcr-fixture-pick" data-tone="win|draw|unpredictable">Liverpool to win</span>
          <span class="pcr-fixture-max">54%</span>
        </summary>
        <div class="pcr-fixture-body">
          <h4 class="pcr-fixture-section-title">Outcome probabilities</h4>
          <div class="pcr-fixture-outcomes">…compact outcome rows…</div>
          <h4 class="pcr-fixture-section-title">Team form</h4>
          <div class="pcr-fixture-forms">…team form cards…</div>
        </div>
      </details>
    </div>
    <p class="pcr-fixtures-empty" hidden>No saved fixtures match that filter.</p>
  </div>
  <p class="pcr-footnote">…</p>
</article>
```

Behaviour: one expandable row per saved fixture (time, teams, pick, confidence, full probabilities/form on open),
live text filter over teams/picks/time, count chips, graceful rows for blocks whose data could not be read,
malformed top-level entries surfaced once as a report note. If no fixture can be parsed, `renderTournament`
returns false and `main.js` keeps the previous raw fallback.

### Multi-word team form recovery

`App1.getinfo` builds capability labels from the first word only, so a team such as "Manchester City"
arrives as `Manchester's City's capability: 78%` — the result kind is lost in the text. The parser now
recovers untyped capability lines by their fixed payload position (home win, away win, home loss, away
loss, home draw, away draw) instead of dropping the entire team-form block.
