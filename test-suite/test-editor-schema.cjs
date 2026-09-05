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
const { computeSchema } = require(path.join(outDir, 'editor', 'schema.js'));
const { getSourceType, getStyle, STYLE_CAPABILITIES } = require(path.join(outDir, 'editor', 'capabilities.js'));
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

// ── Source fields stay reachable ────────────────────────────────────────────

{
  // Without these a user who set a timer entity could never get back to a date.
  for (const style of STYLES) {
    const names = fieldNames(computeSchema({ style, timer_entity: 'timer.x' }));
    const reachable = names.includes('timer_entity')
      && names.includes('auto_discover_alexa')
      && names.includes('auto_discover_google');
    check(`Source fields: always reachable on ${style}`, reachable);
  }
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
    const universal = ['style', 'background_color', 'text_color', 'expired_animation',
      'tap_action', 'hold_action', 'double_tap_action'];
    const missing = universal.filter((n) => !names.includes(n));
    check(`Universal fields: present on ${style}`, missing.length === 0, missing.join(', ') || 'all present');
  }
}

{
  const names = fieldNames(computeSchema({ style: 'classic' }));
  check('Style picker comes first', computeSchema({ style: 'classic' })[0].name === 'style');
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
