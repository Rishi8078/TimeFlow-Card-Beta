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
  'creation_date': 'Start Date (for progress)',
  'count_up_goal_date': 'Goal Date',
  'count_up_cycle': 'Count-up Cycle',
  'auto_discover_alexa': 'Auto-discover Alexa Timers',
  'auto_discover_google': 'Auto-discover Google Timers',
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
  'stroke_width': 'Stroke Width',
  'icon_size': 'Circle Size',
  'grid_dots': 'Dots',
  'grid_dot_unit': 'Dot Unit',
  'grid_rows': 'Rows',
  'grid_dot_size': 'Dot Size',
  'progress_bg_stroke': 'Background Stroke Color',
  'progress_bg_opacity': 'Background Opacity',
  'invert_progress': 'Invert Progress',
  'aspect_ratio': 'Aspect Ratio',
  'header_icon': 'Header Icon',
  'header_icon_color': 'Icon Color',
  'header_icon_background': 'Icon Background',
  'style': 'Card Style',
};

export const FIELD_HELPERS: Record<string, string> = {
  // Timer Source
  'timer_entity': 'Select a timer, sensor, or input_datetime entity',
  'mode': 'Choose whether the card counts down to a date or counts up from a date',
  'target_date': 'ISO date, entity, or template: "2024-12-31T23:59:59", "{{ states(\'input_datetime.deadline\') }}"',
  'creation_date': 'Start date for countdown progress calculation (optional)',
  'count_up_goal_date': 'Optional goal/end date for count-up circle progress',
  'count_up_cycle': 'Optional cycle length for count-up progress: "30d", "12h", "90m", "24:00:00", or seconds',
  'auto_discover_alexa': 'Automatically find active Alexa timers',
  'auto_discover_google': 'Automatically find active Google Home timers',

  // Display
  'title': 'Card title - supports templates: "{{ states(\'sensor.event_name\') }}"',
  'subtitle': 'Shows time remaining by default; only set for custom text',
  'subtitle_prefix': 'Text before countdown (e.g., "in", "Only")',
  'subtitle_suffix': 'Text after countdown (e.g., "left", "remaining")',
  'expired_text': 'Text shown when countdown completes',
  'compact_format': '"2d 5h 30m" vs "2 days 5 hours 30 minutes"',

  // Colors
  'progress_color': 'Progress circle color (hex, name, rgb, or template)',
  'background_color': 'Card background color',
  'text_color': 'Text color for title and countdown',

  // Layout
  'width': 'Card width (e.g., "300px", "100%", "20em")',
  'height': 'Card height (e.g., "200px", "auto")',
  'aspect_ratio': 'Width:height ratio (e.g., "16/9", "4/3", "1/1")',

  // Progress Circle
  'stroke_width': 'Thickness of the progress circle ring',
  'icon_size': 'Size of the progress circle',
  'progress_bg_stroke': 'Background circle stroke color (e.g., "#515751", "rgba(81, 87, 81, 0.2)")',
  'progress_bg_opacity': 'Background circle opacity as percentage (0-100)',
  'invert_progress': 'Start the progress circle full and subtract from it instead of filling it up',

  // Header Icon
  'header_icon': 'Material Design icon name (e.g., "mdi:cake-variant")',
  'header_icon_color': 'Icon color (hex, name, or template)',
  'header_icon_background': 'Icon background (e.g., "rgba(59, 130, 246, 0.2)")',

  // Dot grid (gridy)
  'grid_dots': 'Number of dots, or "auto" to use one dot per unit of the timeframe. Leave empty for the fixed 5 x 20 grid',
  'grid_dot_unit': 'What one dot represents when dots is "auto". Auto picks the unit that keeps the grid readable',
  'grid_rows': 'Rows to wrap the dots into. Auto fits as many per row as the card width allows',
  'grid_dot_size': 'Preferred dot diameter in pixels. Dots still grow past this to fill the card width',
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
