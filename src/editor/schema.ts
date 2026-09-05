import { CardConfig } from '../types/index';
import {
  SourceType,
  StyleCapabilities,
  StyleName,
  getCapabilities,
  getSourceType,
  getStyle,
  usesDateFields,
} from './capabilities';

/**
 * The editor's ha-form schema, composed per style and per timer source.
 *
 * Sections are small fragments below; computeSchema() decides which ones apply
 * and stitches them together. Nothing here reaches into component state - it
 * takes a config and returns a schema, which is what makes the shape of the
 * form testable on its own.
 *
 * Each expandable carries a `name` plus `flatten: true`. The name is what lets
 * ha-form-expandable look up a description through computeHelper and render it
 * inside the panel; `flatten` is not optional next to it, because ha-form
 * otherwise scopes the whole section's data under that key and every field in
 * it silently loses its value.
 *
 * Template rule (see EDITOR-CONFIG-MATRIX.md step 3): every key that supports
 * Jinja stays `selector: { text: {} }`. Typed selectors are only used for keys
 * that are not template-enabled and are genuinely numeric. In particular there
 * are no colour pickers - all five colour keys accept templates and arbitrary
 * CSS.
 */

export type FormSchema = Record<string, any>;

/**
 * A field with a picker/template toggle, rendered by ha-form-tf_template.
 *
 * `plainSelector` rather than `selector`: ha-form checks for a top-level
 * `selector` before it looks at `type`, so an item carrying one would render as
 * an ordinary field and the toggle would never appear.
 */
/** A titled, tinted group of fields - see ha-form-tf-group.ts. */
function group(name: string, title: string, schema: FormSchema[]): FormSchema {
  return { type: 'tf_group', name: `group_${name}`, flatten: true, title, schema };
}

function templatable(
  name: string,
  plainSelector: Record<string, any>,
  plain?: { label: string; icon: string }
): FormSchema {
  return {
    type: 'tf_template',
    name,
    plainSelector,
    ...(plain ? { plainLabel: plain.label, plainIcon: plain.icon } : {}),
  };
}

const STYLE_OPTIONS = [
  { value: 'classic', label: 'Classic' },
  { value: 'eventy', label: 'Eventy' },
  { value: 'classic-compact', label: 'Classic Compact' },
  { value: 'gridy', label: 'Gridy' },
  { value: 'minimal-square', label: 'Minimal Square' },
  { value: 'listy', label: 'Listy (multiple timers)' },
];

const GRID_DOT_UNIT_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'minute', label: 'Minute' },
  { value: 'hour', label: 'Hour' },
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

const GRID_ROW_OPTIONS = [
  { value: 'auto', label: 'Auto (fit the width)' },
  ...[1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: String(n) })),
];

/**
 * The style picker, on its own.
 *
 * Rendered by the editor above everything else rather than composed into the
 * main form: the date pickers sit outside ha-form too, so leaving style in the
 * schema put it first for a timer card but third for a date one. It decides the
 * shape of the whole form, so it leads in every mode.
 */
export function styleSchema(): FormSchema[] {
  return [
    { name: 'style', selector: { select: { options: STYLE_OPTIONS, mode: 'dropdown' } } },
  ];
}

/**
 * The fields belonging to the chosen source, and only those. The picker that
 * chooses between sources is rendered by the editor component, outside the
 * form: it is a control ha-form has no selector for, and keeping it out means
 * no synthetic key can reach the config.
 */
function sourceSection(source: SourceType): FormSchema[] {
  if (source === 'timer') {
    return [templatable('timer_entity', { entity: { domain: ['timer', 'sensor', 'input_datetime'] } },
      { label: 'Entity', icon: 'mdi:shape-outline' })];
  }

  if (source === 'auto') {
    // Just the pair. The editor puts the "Auto Discover" heading above them,
    // the same way it heads Style and Countdown Source - these are the only
    // fields this source has, so burying them in a collapsible panel would be
    // wrong.
    return [{
      type: 'grid',
      schema: [
        { name: 'auto_discover_alexa', selector: { boolean: {} } },
        { name: 'auto_discover_google', selector: { boolean: {} } },
      ],
    }];
  }

  if (source === 'countdowns') {
    // The list itself is edited by its own control; nothing to add here yet.
    return [];
  }

  // Direction only means something for a date. A kitchen timer counts down.
  return [{
    name: 'mode',
    selector: {
      select: {
        options: [
          { value: 'count_down', label: 'Count Down' },
          { value: 'count_up', label: 'Count Up' },
        ],
        mode: 'dropdown',
      },
    },
  }];
}

/**
 * The count-up cycle used to live under "Progress Circle", which is neither
 * where it belongs nor a section every style shows. It is a property of a
 * date-driven count-up and nothing else.
 */
function countUpCycleSection(config: CardConfig, source: SourceType): FormSchema[] {
  if (!usesDateFields(source) || config.mode !== 'count_up') return [];
  return [templatable('count_up_cycle', { text: {} })];
}

/**
 * The only text fields left in the form: the subtitle prefix and suffix.
 *
 * Title, subtitle and expired text are rendered by the editor instead, so they
 * can carry the picker/template toggle - all three are template-enabled, and
 * these two are not.
 */
function textSection(caps: StyleCapabilities, source: SourceType): FormSchema[] {
  // Prefix and suffix are applied in getSubtitle()'s standard-countdown branch;
  // the timer branches return before reaching them.
  if (!caps.subtitle || !usesDateFields(source)) return [];

  return [{
    type: 'grid',
    schema: [
      { name: 'subtitle_prefix', selector: { text: {} } },
      { name: 'subtitle_suffix', selector: { text: {} } },
    ],
  }];
}

function headerIconSection(caps: StyleCapabilities): FormSchema[] {
  if (!caps.headerIcon) return [];
  return [{
    type: 'expandable',
    name: 'section_header_icon',
    flatten: true,
    title: 'Icon',
    icon: 'mdi:image-filter-vintage',
    schema: [
      templatable('header_icon', { icon: {} }, { label: 'Icon', icon: 'mdi:emoticon-outline' }),
      templatable('header_icon_color', { text: {} }),
      templatable('header_icon_background', { text: {} }),
    ],
  }];
}

/**
 * The unit toggles, plus the compact-format switch below them.
 *
 * compact_format sits outside the grid on purpose: it is not a unit, and its
 * helper text is the only one here, so inside a two-column grid it made its own
 * row taller than the rest and threw the toggles out of alignment.
 */
function timeUnitsSection(caps: StyleCapabilities): FormSchema[] {
  const units: FormSchema[] = [];

  if (caps.timeUnits) {
    units.push(
      { name: 'show_years', selector: { boolean: {} } },
      { name: 'show_months', selector: { boolean: {} } },
      { name: 'show_weeks', selector: { boolean: {} } },
      { name: 'show_days', selector: { boolean: {} } },
      { name: 'show_hours', selector: { boolean: {} } },
      { name: 'show_minutes', selector: { boolean: {} } },
    );
  }
  if (caps.showSeconds) units.push({ name: 'show_seconds', selector: { boolean: {} } });

  const schema: FormSchema[] = [];
  if (units.length > 0) schema.push({ type: 'grid', schema: units });
  if (caps.compactFormat) schema.push({ name: 'compact_format', selector: { boolean: {} } });

  return schema;
}

function timerListSection(caps: StyleCapabilities): FormSchema[] {
  if (!caps.timerList) return [];
  return [{
    type: 'expandable',
    name: 'section_timer_list',
    flatten: true,
    title: 'Timer List',
    icon: 'mdi:format-list-bulleted',
    schema: [
      { name: 'max_timers', selector: { number: { min: 1, max: 20, step: 1, mode: 'box' } } },
      {
        type: 'grid',
        schema: [
          { name: 'alexa_icon', selector: { icon: {} } },
          { name: 'google_icon', selector: { icon: {} } },
        ],
      },
      { name: 'timer_icon', selector: { icon: {} } },
      // Not flattened: ha-form then scopes the value to data.countdowns and
      // wraps what comes back as { countdowns: [...] }, which is the shape an
      // array field needs.
      { type: 'tf_countdowns', name: 'countdowns' },
    ],
  }];
}

function appearanceSection(caps: StyleCapabilities): FormSchema[] {
  const schema: FormSchema[] = [];

  if (caps.progressColor) schema.push(templatable('progress_color', { text: {} }));
  schema.push(
    templatable('background_color', { text: {} }),
    templatable('text_color', { text: {} }),
  );

  return [{
    type: 'expandable',
    name: 'section_appearance',
    flatten: true,
    title: 'Appearance',
    icon: 'mdi:palette',
    schema,
  }];
}

function layoutSection(caps: StyleCapabilities): FormSchema[] {
  // The examples live in the placeholder rather than a helper line: they are
  // only useful while the field is empty, which is exactly when a placeholder
  // shows. ha-selector-text reads `placeholder` straight off the selector.
  const dimensions: FormSchema[] = [];
  if (caps.width) dimensions.push({ name: 'width', selector: { text: { placeholder: '300px, 100%, 20em' } } });
  if (caps.height) dimensions.push({ name: 'height', selector: { text: { placeholder: '200px, auto' } } });

  const schema: FormSchema[] = [];
  if (dimensions.length === 2) {
    schema.push({ type: 'grid', schema: dimensions });
  } else {
    schema.push(...dimensions);
  }
  if (caps.aspectRatio) schema.push({ name: 'aspect_ratio', selector: { text: { placeholder: '16/9, 4/3, 1/1' } } });

  if (schema.length === 0) return [];
  return [{
    type: 'expandable',
    name: 'section_layout',
    flatten: true,
    title: 'Layout',
    icon: 'mdi:page-layout-body',
    schema,
  }];
}

/**
 * Two groups and a switch, rather than five fields in a row: the ring's own
 * dimensions, then the track behind it. The units show inside the fields, so
 * the helpers that used to say "in pixels" and "as a percentage" are gone.
 *
 * progress_bg_stroke stays a plain text field on purpose - it is not in the
 * card's templateKeys, so a template typed into it would render literally.
 */
function progressSection(caps: StyleCapabilities): FormSchema[] {
  const schema: FormSchema[] = [];

  if (caps.ringGeometry) {
    // Full width, not a two-column grid. ha-selector-number gives the slider
    // `flex: 1` beside a fixed-width box, so halving the row halves only the
    // slider: the 3:1 ratio that reads as "control plus readout" collapses to
    // about 1:1 and the two stop looking like one control.
    schema.push(group('ring', 'Ring', [
      { name: 'stroke_width', selector: { number: { min: 1, max: 50, step: 1, unit_of_measurement: 'px' } } },
      { name: 'icon_size', selector: { number: { min: 10, max: 350, step: 5, unit_of_measurement: 'px' } } },
    ]));
  }

  if (caps.progressTrack) {
    schema.push(group('track', 'Track', [
      { name: 'progress_bg_stroke', selector: { text: { placeholder: '#515751, rgba(81, 87, 81, 0.2)' } } },
      { name: 'progress_bg_opacity', selector: { number: { min: 0, max: 100, step: 5, unit_of_measurement: '%' } } },
    ]));
  }

  if (caps.invertProgress) schema.push({ name: 'invert_progress', selector: { boolean: {} } });

  if (schema.length === 0) return [];
  return [{
    type: 'expandable',
    name: 'section_progress',
    flatten: true,
    title: 'Progress Circle',
    icon: 'mdi:circle-slice-3',
    schema,
  }];
}

function dotGridSection(caps: StyleCapabilities): FormSchema[] {
  if (!caps.dotGrid) return [];
  return [{
    type: 'expandable',
    name: 'section_dot_grid',
    flatten: true,
    title: 'Dot Grid',
    icon: 'mdi:dots-grid',
    schema: [
      {
        name: 'grid_dots',
        selector: {
          select: {
            custom_value: true,
            options: [{ value: 'auto', label: 'Auto (match the timeframe)' }],
            mode: 'dropdown',
          },
        },
      },
      { name: 'grid_dot_unit', selector: { select: { options: GRID_DOT_UNIT_OPTIONS, mode: 'dropdown' } } },
      { name: 'grid_rows', selector: { select: { custom_value: true, options: GRID_ROW_OPTIONS, mode: 'dropdown' } } },
      // Boxed like Track: it is the one slider among three dropdowns, and the
      // tint keeps it from reading as a fourth row of the same kind.
      group('dot_size', 'Size', [
        { name: 'grid_dot_size', selector: { number: { min: 4, max: 40, step: 1, unit_of_measurement: 'px' } } },
      ]),
    ],
  }];
}

/** Universal: every style forwards its action config to the same handler. */
function actionsSection(): FormSchema[] {
  return [{
    type: 'expandable',
    name: 'section_actions',
    flatten: true,
    title: 'Tap Actions',
    icon: 'mdi:gesture-tap',
    schema: [
      { name: 'tap_action', selector: { ui_action: {} } },
      { name: 'hold_action', selector: { ui_action: {} } },
      { name: 'double_tap_action', selector: { ui_action: {} } },
    ],
  }];
}

/**
 * Assembles the form for one config: style first, then source, then only the
 * sections the chosen style actually renders.
 *
 * `source` is passed in rather than inferred because the editor may be showing
 * a choice the config cannot express yet - picking "Entity" before picking an
 * entity. Inferring it here would leave the form describing a date-driven card
 * while the picker above it said otherwise. Omit it and it falls back to what
 * the config says.
 */
export function computeSchema(config: CardConfig, source?: SourceType): FormSchema[] {
  return [
    ...computeSourceSchema(config, source),
    ...computeTextSchema(config, source),
    ...computeExpiredSchema(config),
    ...computeUnitsSchema(config),
    ...computePanelsSchema(config),
  ];
}

/**
 * The part of the form above the title: how the countdown is sourced.
 *
 * Split out because the editor renders the title itself, between the two
 * halves. Concatenating these two gives computeSchema() exactly.
 */
export function computeSourceSchema(config: CardConfig, source?: SourceType): FormSchema[] {
  const activeSource = source ?? getSourceType(config);

  return [
    ...sourceSection(activeSource),
    ...countUpCycleSection(config, activeSource),
  ];
}

/** The text fields the editor does not render itself. */
export function computeTextSchema(config: CardConfig, source?: SourceType): FormSchema[] {
  return textSection(getCapabilities(config), source ?? getSourceType(config));
}

/**
 * The expired-animation switch, which sits directly under the expired text the
 * editor renders rather than off in Appearance - the two describe the same
 * moment, and separating them made the pair hard to find.
 */
export function computeExpiredSchema(_config: CardConfig): FormSchema[] {
  return [{ name: 'expired_animation', selector: { boolean: {} } }];
}

/** The time-unit toggles, which the editor puts in a section of their own. */
export function computeUnitsSchema(config: CardConfig): FormSchema[] {
  return timeUnitsSection(getCapabilities(config));
}

/** The collapsible panels at the foot of the form. */
export function computePanelsSchema(config: CardConfig): FormSchema[] {
  const caps = getCapabilities(config);

  return [
    ...timerListSection(caps),
    // Icon sits with the styling panels rather than the text fields: it
    // is chrome, not content, and it reads as the first of the appearance group.
    ...headerIconSection(caps),
    ...appearanceSection(caps),
    ...layoutSection(caps),
    ...progressSection(caps),
    ...dotGridSection(caps),
    ...actionsSection(),
  ];
}

export { getStyle, getSourceType, usesDateFields };
export type { SourceType, StyleName };
