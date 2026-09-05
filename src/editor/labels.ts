/**
 * Field labels and helper text for the editor form.
 *
 * Plain data, kept out of the component so the schema modules and the editor
 * can share one source of truth. Keys not listed fall back to a title-cased
 * version of the config key.
 */

export const FIELD_LABELS: Record<string, string> = {
  'timer_entity': 'Timer Entity',
  'mode': 'Mode',
  'target_date': 'Target Date/Time',
  'creation_date': 'Start Date',
  'count_up_goal_date': 'Goal Date',
  'count_up_cycle': 'Count-up Cycle',
  'auto_discover_alexa': 'Alexa Timers',
  'auto_discover_google': 'Google Home Timers',
  'max_timers': 'Maximum Timers Shown',
  'alexa_icon': 'Alexa Row Icon',
  'google_icon': 'Google Row Icon',
  'timer_icon': 'Timer Row Icon',
  'show_days': 'Days',
  'show_hours': 'Hours',
  'show_minutes': 'Minutes',
  'show_seconds': 'Seconds',
  'show_months': 'Months',
  'show_years': 'Years',
  'show_weeks': 'Weeks',
  'compact_format': 'Compact Format',
  'subtitle_prefix': 'Subtitle Prefix',
  'subtitle_suffix': 'Subtitle Suffix',
  'expired_animation': 'Expired Animation',
  'expired_text': 'Expired Text',
  'progress_color': 'Progress Color',
  'background_color': 'Background Color',
  'text_color': 'Text Color',
  'stroke_width': 'Thickness',
  'icon_size': 'Size',
  'grid_dots': 'Dots',
  'grid_dot_unit': 'Dot Unit',
  'grid_rows': 'Rows',
  'grid_dot_size': 'Dot Size',
  'progress_bg_stroke': 'Colour',
  'progress_bg_opacity': 'Opacity',
  'invert_progress': 'Invert Progress',
  'aspect_ratio': 'Aspect Ratio',
  'header_icon': 'Icon',
  'header_icon_color': 'Icon Color',
  'header_icon_background': 'Icon Background',
  'style': 'Card Style',
};

export const FIELD_HELPERS: Record<string, string> = {
  // Section descriptions. ha-form-expandable renders these inside the panel,
  // so they cost nothing while it is collapsed.
  'section_header_icon': 'Shown beside the card title.',
  'section_appearance': 'Colours accept #4caf50, rgb(), a CSS name, var(--…), or an entity id.',
  'section_layout': 'Leave a field empty to let the card size itself.',
  'section_progress': 'The ring drawn around the countdown.',
  'section_dot_grid': 'Leave Dots empty for the fixed 5 × 20 grid. Auto picks a unit and row count that keep it readable, and dots grow past Size to fill the width.',
  'section_timer_list': 'How many timer rows to draw, and the icon for each source. The defaults are mdi: icons so they work on a stock install.',
  'section_actions': 'What happens when the card is tapped, held, or double-tapped.',

  // Timer Source
  'timer_entity': 'Select a timer, sensor, or input_datetime entity',
  'target_date': 'ISO date, entity, or template: "2024-12-31T23:59:59", "{{ states(\'input_datetime.deadline\') }}"',
  'creation_date': 'Where the progress ring starts filling from.',
  'count_up_goal_date': 'Optional goal/end date for count-up circle progress',
  'count_up_cycle': 'Optional cycle length for count-up progress: "30d", "12h", "90m", "24:00:00", or seconds',

  // Display
  'title': 'Card title - supports templates: "{{ states(\'sensor.event_name\') }}"',
  'subtitle': 'Shows time remaining by default; only set for custom text',
  'compact_format': 'Short form: "2d 5h 30m"',

  // Colors

  // Layout

  // Progress Circle
  'invert_progress': 'Start full and empty out, instead of filling up.',

  // Header Icon

  // Dot grid (gridy)
};

/** ha-form's computeLabel: an explicit schema label wins, then the table. */
export function computeLabel(schema: any): string {
  if (schema?.label) return schema.label;
  if (FIELD_LABELS[schema?.name]) return FIELD_LABELS[schema.name];

  const key = (schema?.name ?? '').toString();
  if (!key) return '';
  return key
    .split('_')
    .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function computeHelper(schema: any): string {
  return FIELD_HELPERS[schema?.name] || '';
}
