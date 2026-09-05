/**
 * Editor schema composition tests.
 *
 * computeSchema() is a pure function of the config, which is the point of
 * pulling it out of the component: the shape of the form can be checked without
 * a browser, Home Assistant, or ha-form.
 *
 * These assert the rules in EDITOR-CONFIG-MATRIX.md - a style never gets a
 * field its renderer does not read, and the date group only appears for a
 * date-driven card.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-schema-'));
const repoRoot = path.join(__dirname, '..');
execFileSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['tsc', 'src/editor/schema.ts', 'src/editor/capabilities.ts', 'src/editor/labels.ts',
   '--outDir', outDir, '--module', 'commonjs', '--target', 'es2020', '--skipLibCheck'],
  { cwd: repoRoot, stdio: 'pipe' }
);
const { computeSchema, styleSchema } = require(path.join(outDir, 'editor', 'schema.js'));
const { getSourceType, getStyle, STYLE_CAPABILITIES, availableSources, applySource, resolveSource } =
  require(path.join(outDir, 'editor', 'capabilities.js'));
const { computeLabel, computeHelper } = require(path.join(outDir, 'editor', 'labels.js'));

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
}

/** Every field name in a schema, flattened through grids and expandables. */
function fieldNames(schema) {
  const names = [];
  const walk = (items) => {
    for (const item of items || []) {
      if (item.name) names.push(item.name);
      if (Array.isArray(item.schema)) walk(item.schema);
    }
  };
  walk(schema);
  return names;
}

function sectionTitles(schema) {
  return schema.filter((i) => i.type === 'expandable').map((i) => i.title);
}

const STYLES = Object.keys(STYLE_CAPABILITIES);
const dateCfg = (extra = {}) => ({ type: 'custom:timeflow-card-beta', target_date: '2026-12-31T00:00:00', ...extra });

// ── Source inference ────────────────────────────────────────────────────────

{
  check('Source: a bare date config reads as date', getSourceType(dateCfg()) === 'date');
  check('Source: timer_entity wins over a leftover date',
    getSourceType(dateCfg({ timer_entity: 'timer.x' })) === 'timer');
  check('Source: auto-discovery is detected',
    getSourceType(dateCfg({ auto_discover_alexa: true })) === 'auto');
  check('Source: an explicit entity outranks discovery',
    getSourceType(dateCfg({ timer_entity: 'timer.x', auto_discover_google: true })) === 'timer');
  check('Source: pinned countdowns win on listy',
    getSourceType({ style: 'listy', countdowns: [{ target_date: 'x' }] }) === 'countdowns');
  check('Source: countdowns are ignored off listy',
    getSourceType({ style: 'classic', countdowns: [{ target_date: 'x' }] }) === 'date');
  check('Source: an empty countdowns list is not a source',
    getSourceType({ style: 'listy', countdowns: [] }) === 'date');
  check('Style: an unknown style falls back to classic', getStyle({ style: 'nonsense' }) === 'classic');
}

// ── The date group is date-only ─────────────────────────────────────────────

{
  const dateOnly = ['mode', 'subtitle_prefix', 'subtitle_suffix'];
  for (const source of [
    { label: 'timer entity', cfg: dateCfg({ timer_entity: 'timer.x' }) },
    { label: 'auto-discovery', cfg: dateCfg({ auto_discover_alexa: true }) },
  ]) {
    const names = fieldNames(computeSchema(source.cfg));
    const leaked = dateOnly.filter((n) => names.includes(n));
    check(`Date group: hidden for ${source.label}`, leaked.length === 0, leaked.join(', ') || 'none leaked');
  }

  const names = fieldNames(computeSchema(dateCfg()));
  check('Date group: mode is offered for a date card', names.includes('mode'));
  check('Date group: prefix/suffix are offered for a date card',
    names.includes('subtitle_prefix') && names.includes('subtitle_suffix'));
}

{
  const countUp = fieldNames(computeSchema(dateCfg({ mode: 'count_up' })));
  check('Count-up: the cycle field appears', countUp.includes('count_up_cycle'));
  const countDown = fieldNames(computeSchema(dateCfg({ mode: 'count_down' })));
  check('Count-up: the cycle field is hidden when counting down', !countDown.includes('count_up_cycle'));
  const timer = fieldNames(computeSchema(dateCfg({ mode: 'count_up', timer_entity: 'timer.x' })));
  check('Count-up: the cycle field is hidden for a timer entity', !timer.includes('count_up_cycle'));
}

// ── Only the chosen source's fields are shown ───────────────────────────────

{
  // Before the picker existed these had to stay visible so a user could get
  // back to a date. The picker owns that job now, so each source shows only
  // its own fields.
  const dateNames = fieldNames(computeSchema(dateCfg()));
  check('Source fields: a date card offers no entity or discovery fields',
    !dateNames.includes('timer_entity')
    && !dateNames.includes('auto_discover_alexa')
    && !dateNames.includes('auto_discover_google'));

  const timerNames = fieldNames(computeSchema(dateCfg({ timer_entity: 'timer.x' })));
  check('Source fields: a timer card offers the entity picker', timerNames.includes('timer_entity'));
  check('Source fields: a timer card hides the discovery toggles',
    !timerNames.includes('auto_discover_alexa') && !timerNames.includes('auto_discover_google'));

  const autoNames = fieldNames(computeSchema(dateCfg({ auto_discover_alexa: true })));
  check('Source fields: a discovery card offers both toggles',
    autoNames.includes('auto_discover_alexa') && autoNames.includes('auto_discover_google'));
  check('Source fields: a discovery card hides the entity picker', !autoNames.includes('timer_entity'));
}

// ── Switching source ────────────────────────────────────────────────────────

{
  const start = dateCfg({ timer_entity: 'timer.x', creation_date: '2026-01-01', title: 'Keep me' });

  const toDate = applySource(start, 'date');
  check('Switch: choosing Date clears the entity selector', toDate.timer_entity === undefined);
  check('Switch: choosing Date keeps the dates the user typed',
    toDate.target_date === start.target_date && toDate.creation_date === '2026-01-01');
  check('Switch: choosing Date keeps unrelated config', toDate.title === 'Keep me');
  check('Switch: the picker agrees with the result', getSourceType(toDate) === 'date');

  const toAuto = applySource(start, 'auto');
  check('Switch: choosing Discover clears the entity', toAuto.timer_entity === undefined);
  check('Switch: choosing Discover turns both integrations on',
    toAuto.auto_discover_alexa === true && toAuto.auto_discover_google === true);
  check('Switch: Discover resolves to the auto source', getSourceType(toAuto) === 'auto');
  check('Switch: Discover still keeps the typed date', toAuto.target_date === start.target_date);

  const bothOn = applySource(dateCfg({ auto_discover_google: true }), 'auto');
  check('Switch: an existing discovery choice is not overwritten',
    bothOn.auto_discover_google === true && bothOn.auto_discover_alexa === undefined);

  const toTimer = applySource(dateCfg({ auto_discover_alexa: true }), 'timer');
  check('Switch: choosing Entity clears the discovery toggles',
    toTimer.auto_discover_alexa === undefined && toTimer.auto_discover_google === undefined);

  const pinned = { style: 'listy', countdowns: [{ target_date: 'x' }], timer_entity: 'timer.y' };
  const toPinned = applySource(pinned, 'countdowns');
  check('Switch: choosing Pinned clears the entity but keeps the list',
    toPinned.timer_entity === undefined && toPinned.countdowns.length === 1);
  const offPinned = applySource(pinned, 'date');
  check('Switch: leaving Pinned drops the list selector', offPinned.countdowns === undefined);

  // Round trip: nothing the user typed should be lost either way.
  const roundTrip = applySource(applySource(start, 'auto'), 'date');
  check('Switch: a round trip preserves typed data',
    roundTrip.target_date === start.target_date && roundTrip.creation_date === '2026-01-01');
}

// ── A choice the config cannot express yet ──────────────────────────────────

{
  // Regression: choosing Entity clears the discovery flags but cannot invent an
  // entity id, so inference still reads 'date'. Without the pending choice the
  // picker snapped back to Date the moment it was clicked and the entity field
  // never appeared.
  const start = dateCfg({ auto_discover_alexa: true });
  const afterClick = applySource(start, 'timer');

  check('Pending: the config alone still reads as date', getSourceType(afterClick) === 'date');
  check('Pending: the picker honours the choice anyway',
    resolveSource(afterClick, 'timer') === 'timer');
  // The schema has to be built from the resolved source, not the config's own,
  // or the picker says Entity while the form still shows the date group.
  const pendingNames = fieldNames(computeSchema(afterClick, resolveSource(afterClick, 'timer')));
  check('Pending: the entity field is shown', pendingNames.includes('timer_entity'));
  check('Pending: the date group is hidden', !pendingNames.includes('mode'));
  check('Pending: the discovery toggles are gone', !pendingNames.includes('auto_discover_alexa'));

  // Without the resolved source threaded through, the form contradicts the picker.
  const unthreaded = fieldNames(computeSchema(afterClick));
  check('Pending: inferring inside computeSchema would contradict the picker',
    !unthreaded.includes('timer_entity') && unthreaded.includes('mode'));

  // Once an entity is chosen, config and picker agree without help.
  const chosen = { ...afterClick, timer_entity: 'timer.pasta' };
  check('Pending: a chosen entity makes the choice real', getSourceType(chosen) === 'timer');
  check('Pending: it is then ignored', resolveSource(chosen, 'timer') === 'timer');

  // A config that names its own source always wins over a stale pending value.
  check('Pending: a real source overrides a stale choice',
    resolveSource(dateCfg({ auto_discover_google: true }), 'timer') === 'auto');
  check('Pending: no choice means plain inference',
    resolveSource(dateCfg({ timer_entity: 'timer.x' }), null) === 'timer');

  // Sources that prime themselves need no pending value at all.
  check('Pending: Discover needs no remembering',
    getSourceType(applySource(dateCfg(), 'auto')) === 'auto');
  check('Pending: Date needs no remembering',
    getSourceType(applySource(dateCfg({ timer_entity: 'timer.x' }), 'date')) === 'date');
}

{
  // Regression: pick an entity, then clear it. The config reads as 'date' again,
  // but the user is still in Entity mode and expects the picker to stay put.
  const cleared = dateCfg();
  check('Pending: clearing the entity keeps you in Entity mode',
    resolveSource(cleared, 'timer') === 'timer');
  check('Pending: and the entity field stays on screen',
    fieldNames(computeSchema(cleared, resolveSource(cleared, 'timer'))).includes('timer_entity'));
}

// ── Which sources the picker offers ─────────────────────────────────────────

{
  for (const style of STYLES) {
    const offered = availableSources({ style });
    check(`Sources offered: ${style} lists the three real sources`,
      offered.join(',') === 'date,timer,auto', offered.join(','));
  }
  const withPinned = availableSources({ style: 'listy', countdowns: [{ target_date: 'x' }] });
  check('Sources offered: listy adds Pinned once entries exist',
    withPinned.includes('countdowns'), withPinned.join(','));
  check('Sources offered: an empty list does not offer Pinned',
    !availableSources({ style: 'listy', countdowns: [] }).includes('countdowns'));

  // Whatever getSourceType infers must be selectable, or the picker shows a
  // value none of its options carry.
  const configs = [
    dateCfg(), dateCfg({ timer_entity: 'timer.x' }), dateCfg({ auto_discover_alexa: true }),
    { style: 'listy', countdowns: [{ target_date: 'x' }] },
  ];
  const unrepresentable = configs.filter((c) => !availableSources(c).includes(getSourceType(c)));
  check('Sources offered: every inferred source is selectable', unrepresentable.length === 0);
}

// ── Style gating matches the capability table ───────────────────────────────

{
  // Field -> the capability flag that must be true for it to appear.
  const gated = {
    title: 'title',
    subtitle: 'subtitle',
    expired_text: 'expiredText',
    compact_format: 'compactFormat',
    show_years: 'timeUnits',
    show_minutes: 'timeUnits',
    show_seconds: 'showSeconds',
    header_icon: 'headerIcon',
    header_icon_color: 'headerIcon',
    progress_color: 'progressColor',
    stroke_width: 'ringGeometry',
    icon_size: 'ringGeometry',
    invert_progress: 'invertProgress',
    progress_bg_stroke: 'progressTrack',
    progress_bg_opacity: 'progressTrack',
    grid_dots: 'dotGrid',
    grid_dot_size: 'dotGrid',
    max_timers: 'timerList',
    alexa_icon: 'timerList',
    width: 'width',
    height: 'height',
    aspect_ratio: 'aspectRatio',
  };

  for (const style of STYLES) {
    const caps = STYLE_CAPABILITIES[style];
    const names = fieldNames(computeSchema({ style, target_date: 'x' }));
    const wrong = [];
    for (const [field, cap] of Object.entries(gated)) {
      const shown = names.includes(field);
      if (shown !== caps[cap]) wrong.push(`${field} ${shown ? 'shown' : 'hidden'} but ${cap}=${caps[cap]}`);
    }
    check(`Style gating: ${style} matches its capabilities`, wrong.length === 0, wrong.join('; '));
  }
}

// ── Universals ──────────────────────────────────────────────────────────────

{
  for (const style of STYLES) {
    const names = fieldNames(computeSchema({ style }));
    const universal = ['background_color', 'text_color', 'expired_animation',
      'tap_action', 'hold_action', 'double_tap_action'];
    const missing = universal.filter((n) => !names.includes(n));
    check(`Universal fields: present on ${style}`, missing.length === 0, missing.join(', ') || 'all present');
  }
}

{
  // The style picker is rendered above the form, not composed into it: with the
  // date pickers also living outside ha-form, leaving it in the schema put it
  // first for a timer card and third for a date one.
  check('Style: the picker is its own schema', styleSchema()[0].name === 'style');
  check('Style: it is not duplicated inside the form',
    !fieldNames(computeSchema({ style: 'classic' })).includes('style'));

  for (const style of STYLES) {
    for (const cfg of [
      { style, target_date: 'x' },
      { style, timer_entity: 'timer.x' },
      { style, auto_discover_alexa: true },
    ]) {
      const ok = styleSchema().length === 1 && !fieldNames(computeSchema(cfg)).includes('style');
      if (!ok) check(`Style: leads the form on ${style}`, false, JSON.stringify(cfg));
    }
  }
  check('Style: leads the form in every mode, every style', true);

  const names = fieldNames(computeSchema({ style: 'classic' }));
  check('No duplicate fields', new Set(names).size === names.length,
    `${names.length} fields, ${new Set(names).size} unique`);
}

// ── Empty sections must not render as empty panels ──────────────────────────

{
  const eventy = computeSchema({ style: 'eventy' });
  const titles = sectionTitles(eventy);
  check('Eventy: no Progress Circle panel', !titles.includes('Progress Circle'), titles.join(', '));
  check('Eventy: no Layout panel (it sizes itself)', !titles.includes('Layout'), titles.join(', '));

  const listy = sectionTitles(computeSchema({ style: 'listy' }));
  check('Listy: no Progress Circle panel', !listy.includes('Progress Circle'), listy.join(', '));
  check('Listy: has the Timer List panel', listy.includes('Timer List'));

  const minimal = computeSchema({ style: 'minimal-square' });
  check('Minimal square: no time unit grid',
    !fieldNames(minimal).some((n) => n.startsWith('show_')));
  check('Minimal square: no Header Icon panel', !sectionTitles(minimal).includes('Header Icon'));

  // An expandable with an empty schema renders as a panel that opens onto nothing.
  for (const style of STYLES) {
    const empties = computeSchema({ style })
      .filter((i) => i.type === 'expandable' && (!i.schema || i.schema.length === 0))
      .map((i) => i.title);
    check(`No empty panels on ${style}`, empties.length === 0, empties.join(', ') || 'none');
  }
}

// ── The template rule ───────────────────────────────────────────────────────

{
  // Every template-enabled key must stay a free-text input: a typed selector
  // makes {{ ... }} impossible to enter. See EDITOR-CONFIG-MATRIX.md step 3.
  const templateKeys = [
    'title', 'subtitle', 'expired_text', 'text_color', 'background_color',
    'progress_color', 'header_icon_color', 'header_icon_background', 'count_up_cycle',
  ];

  const collect = (schema, acc = {}) => {
    for (const item of schema || []) {
      if (item.name && item.selector) acc[item.name] = Object.keys(item.selector)[0];
      if (Array.isArray(item.schema)) collect(item.schema, acc);
    }
    return acc;
  };

  const wrong = [];
  for (const style of STYLES) {
    const selectors = collect(computeSchema({ style, target_date: 'x', mode: 'count_up' }));
    for (const key of templateKeys) {
      if (selectors[key] && selectors[key] !== 'text') {
        wrong.push(`${style}.${key} uses ${selectors[key]}`);
      }
    }
  }
  check('Template rule: every template-enabled key is a text input',
    wrong.length === 0, wrong.join('; ') || 'all text');

  const allSelectors = {};
  for (const style of STYLES) Object.assign(allSelectors, collect(computeSchema({ style })));
  const colourPickers = Object.entries(allSelectors)
    .filter(([, sel]) => sel === 'color_rgb' || sel === 'ui_color')
    .map(([name]) => name);
  check('Template rule: no colour pickers anywhere', colourPickers.length === 0, colourPickers.join(', ') || 'none');
}

// ── Labels ──────────────────────────────────────────────────────────────────

{
  check('Labels: known key uses its table entry', computeLabel({ name: 'timer_entity' }) === 'Timer Entity');
  check('Labels: explicit label wins', computeLabel({ name: 'timer_entity', label: 'Custom' }) === 'Custom');
  check('Labels: unknown key is title-cased', computeLabel({ name: 'some_new_key' }) === 'Some New Key');
  check('Helpers: missing helper is empty, not undefined', computeHelper({ name: 'nope' }) === '');

  // A field with no label at all shows as a bare key in the UI.
  const unlabelled = new Set();
  for (const style of STYLES) {
    for (const name of fieldNames(computeSchema({ style, target_date: 'x', mode: 'count_up' }))) {
      if (!computeLabel({ name })) unlabelled.add(name);
    }
  }
  check('Labels: every field in every schema resolves a label',
    unlabelled.size === 0, [...unlabelled].join(', ') || 'all labelled');
}

// ── Summary ─────────────────────────────────────────────────────────────────

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length > 0) {
  console.log('Failures:');
  failed.forEach((r) => console.log(`  - ${r.name}`));
  process.exit(1);
}
