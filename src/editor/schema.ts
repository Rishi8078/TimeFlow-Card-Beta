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
 * Template rule (see EDITOR-CONFIG-MATRIX.md step 3): every key that supports
 * Jinja stays `selector: { text: {} }`. Typed selectors are only used for keys
 * that are not template-enabled and are genuinely numeric. In particular there
 * are no colour pickers - all five colour keys accept templates and arbitrary
 * CSS.
 */

export type FormSchema = Record<string, any>;

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

/** Style picker, always first: it decides the shape of everything below it. */
function styleSection(): FormSchema[] {
  return [
    { name: 'style', selector: { select: { options: STYLE_OPTIONS, mode: 'dropdown' } } },
  ];
}

/**
 * How the card finds its countdown. The entity and discovery toggles stay
 * visible whatever the current source, because clearing them is how a user
 * moves back to a date until the dedicated source picker lands.
 */
function sourceSection(source: SourceType): FormSchema[] {
  const schema: FormSchema[] = [];

  // Direction only means something for a date. A kitchen timer counts down.
  if (usesDateFields(source)) {
    schema.push({
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
    });
  }

  schema.push({ name: 'timer_entity', selector: { entity: { domain: ['timer', 'sensor', 'input_datetime'] } } });
  schema.push({
    type: 'grid',
    schema: [
      { name: 'auto_discover_alexa', selector: { boolean: {} } },
      { name: 'auto_discover_google', selector: { boolean: {} } },
    ],
  });

  return schema;
}

/**
 * The count-up cycle used to live under "Progress Circle", which is neither
 * where it belongs nor a section every style shows. It is a property of a
 * date-driven count-up and nothing else.
 */
function countUpCycleSection(config: CardConfig, source: SourceType): FormSchema[] {
  if (!usesDateFields(source) || config.mode !== 'count_up') return [];
  return [{ name: 'count_up_cycle', selector: { text: {} } }];
}

function textSection(caps: StyleCapabilities, source: SourceType): FormSchema[] {
  const schema: FormSchema[] = [];

  if (caps.title) schema.push({ name: 'title', selector: { text: {} } });
  if (caps.subtitle) schema.push({ name: 'subtitle', selector: { text: {} } });

  // Prefix and suffix are applied in getSubtitle()'s standard-countdown branch;
  // the timer branches return before reaching them.
  if (caps.subtitle && usesDateFields(source)) {
    schema.push({
      type: 'grid',
      schema: [
        { name: 'subtitle_prefix', selector: { text: {} } },
        { name: 'subtitle_suffix', selector: { text: {} } },
      ],
    });
  }

  if (caps.expiredText) schema.push({ name: 'expired_text', selector: { text: {} } });

  return schema;
}

function headerIconSection(caps: StyleCapabilities): FormSchema[] {
  if (!caps.headerIcon) return [];
  return [{
    type: 'expandable',
    title: 'Header Icon',
    icon: 'mdi:image-filter-vintage',
    schema: [
      { name: 'header_icon', selector: { icon: {} } },
      {
        type: 'grid',
        schema: [
          { name: 'header_icon_color', selector: { text: {} } },
          { name: 'header_icon_background', selector: { text: {} } },
        ],
      },
    ],
  }];
}

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
  if (caps.compactFormat) units.push({ name: 'compact_format', selector: { boolean: {} } });

  return units.length > 0 ? [{ type: 'grid', schema: units }] : [];
}

function timerListSection(caps: StyleCapabilities): FormSchema[] {
  if (!caps.timerList) return [];
  return [{
    type: 'expandable',
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
    ],
  }];
}

function appearanceSection(caps: StyleCapabilities): FormSchema[] {
  const schema: FormSchema[] = [];

  if (caps.progressColor) schema.push({ name: 'progress_color', selector: { text: {} } });
  schema.push(
    { name: 'background_color', selector: { text: {} } },
    { name: 'text_color', selector: { text: {} } },
    { name: 'expired_animation', selector: { boolean: {} } },
  );

  return [{ type: 'expandable', title: 'Appearance', icon: 'mdi:palette', schema }];
}

function layoutSection(caps: StyleCapabilities): FormSchema[] {
  const dimensions: FormSchema[] = [];
  if (caps.width) dimensions.push({ name: 'width', selector: { text: {} } });
  if (caps.height) dimensions.push({ name: 'height', selector: { text: {} } });

  const schema: FormSchema[] = [];
  if (dimensions.length === 2) {
    schema.push({ type: 'grid', schema: dimensions });
  } else {
    schema.push(...dimensions);
  }
  if (caps.aspectRatio) schema.push({ name: 'aspect_ratio', selector: { text: {} } });

  if (schema.length === 0) return [];
  return [{ type: 'expandable', title: 'Layout', icon: 'mdi:page-layout-body', schema }];
}

function progressSection(caps: StyleCapabilities): FormSchema[] {
  const schema: FormSchema[] = [];

  if (caps.ringGeometry) {
    schema.push({
      type: 'grid',
      schema: [
        { name: 'stroke_width', selector: { number: { min: 1, max: 50, step: 1 } } },
        { name: 'icon_size', selector: { number: { min: 10, max: 350, step: 5 } } },
      ],
    });
  }
  if (caps.progressTrack) {
    schema.push(
      { name: 'progress_bg_stroke', selector: { text: {} } },
      { name: 'progress_bg_opacity', selector: { number: { min: 0, max: 100, step: 5 } } },
    );
  }
  if (caps.invertProgress) schema.push({ name: 'invert_progress', selector: { boolean: {} } });

  if (schema.length === 0) return [];
  return [{ type: 'expandable', title: 'Progress Circle', icon: 'mdi:circle-slice-3', schema }];
}

function dotGridSection(caps: StyleCapabilities): FormSchema[] {
  if (!caps.dotGrid) return [];
  return [{
    type: 'expandable',
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
      { name: 'grid_dot_size', selector: { number: { min: 4, max: 40, step: 1, mode: 'box' } } },
    ],
  }];
}

/** Universal: every style forwards its action config to the same handler. */
function actionsSection(): FormSchema[] {
  return [{
    type: 'expandable',
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
 */
export function computeSchema(config: CardConfig): FormSchema[] {
  const caps = getCapabilities(config);
  const source = getSourceType(config);

  return [
    ...styleSection(),
    ...sourceSection(source),
    ...countUpCycleSection(config, source),
    ...textSection(caps, source),
    ...headerIconSection(caps),
    ...timeUnitsSection(caps),
    ...timerListSection(caps),
    ...appearanceSection(caps),
    ...layoutSection(caps),
    ...progressSection(caps),
    ...dotGridSection(caps),
    ...actionsSection(),
  ];
}

export { getStyle, getSourceType, usesDateFields };
export type { SourceType, StyleName };
