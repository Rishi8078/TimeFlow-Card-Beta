# TimeFlow Card

[![Home Assistant][ha_badge]][ha_link] [![HACS][hacs_badge]][hacs_link] [![GitHub Release][release_badge]][release] [![Buy Me A Coffee][bmac_badge]][bmac]

A beautiful countdown timer card for Home Assistant with animated progress circle, intelligent time formatting, and modern modular architecture.

![TimeFlow Card Preview](assets/preview.png)

## ✨ Features

- **🏗️ Modular Architecture**: Clean, maintainable code with focused components
- **🎨 Template Support**: Dynamic values for all configuration properties
- **⚡ Performance Optimized**: Efficient rendering with caching and smart updates
- **🎯 Smart Time Display**: Natural language formatting with unit cascading
- **🔄 Animated Progress**: SVG progress circle with dynamic scaling
- **🎨 Customizable Styling**: Colors, sizes, time units, and Card-mod support
- **📱 Responsive Design**: Automatic sizing and mobile-friendly layouts
- **♿ Accessibility**: Screen reader support and keyboard navigation
- **🌐 Cross-Platform**: Robust date parsing across all browsers

## 🚀 Installation

### HACS (Recommended)

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=rishi8078&repository=Timeflow-card)

**Or manually:**
1. Open HACS → Frontend → "⋮" (three dots menu) → Custom repositories
2. Add repository URL: `https://github.com/Rishi8078/TimeFlow-Card`
3. Select category: "Dashboard"
4. Click "Add" → Search for Timeflow-card → install

### Manual
1. Download `timeflow-card-modular.js` from [releases](https://github.com/Rishi8078/TimeFlow-Card-Beta/releases)
2. Copy to `config/www/` directory
3. Add to resources:
```yaml
resources:
  - url: /local/timeflow-card-modular.js
    type: module
```
## ⚙️ Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `target_date` | string | **Required** | ISO date or entity ID |
| `title` | string | `"Countdown Timer"` | Card title |
| `creation_date` | string | `null` | Start date for progress |
| `expired_text` | string | `"Completed! 🎉"` | Text when expired |
| `show_*` | boolean | `true` | Show time units (months/days/hours/minutes/seconds) |
| `width/height` | string | `null` | Card dimensions |
| `aspect_ratio` | string | `"2/1"` | Card proportions |
| `color` | string | `"#ffffff"` | Text color |
| `background_color` | string | `"#1976d2"` | Card background |
| `progress_color` | string | `"#4CAF50"` | Progress circle color |
| `stroke_width` | number | `15` | Progress circle stroke thickness |
| `icon_size` | number | `100` | Base progress circle size (auto-adjusted) |
| `card_mod` | object | `null` | [Card-mod](https://github.com/thomasloven/lovelace-card-mod) styling configuration |

## 🎯 Progress Circle Behavior

The progress circle is **automatically positioned at the bottom-right** of the card and **dynamically sized** to fit within the card dimensions:

**Positioning:**
- Always anchored to bottom-right corner
- Stays within card boundaries
- Overlays content with proper z-index

**Dynamic Sizing:**
- Automatically calculates optimal size based on card dimensions
- Prevents overflow when card width/height is small
- Maintains proportional stroke width
- Respects minimum (40px) and maximum (120px) size limits

**Responsive Behavior:**
- Adapts to percentage-based card widths
- Scales proportionally with aspect ratios
- Maintains consistent positioning across different screen sizes

## 🎨 Template Support

The following properties support Home Assistant templates:

| Property | Template Example | Description |
|----------|-----------------|-------------|
| `target_date` | `"{{ states.input_datetime.timer.state }}"` | Dynamic target date from entities |
| `title` | `"{{ states.sensor.event_name.state }}"` | Dynamic title from entity |
| `color` | `"{{ 'red' if states.binary_sensor.alert.state == 'on' else 'white' }}"` | Conditional text color |
| `background_color` | `"{{ '#ff0000' if is_state('binary_sensor.urgent', 'on') else '#1976d2' }}"` | Dynamic background |
| `progress_color` | `"{{ states.input_text.theme_color.state }}"` | Color from entity state |

**Template Syntax:**
- Use double curly braces: `{{ template_here }}`
- Access entity states: `states.sensor.name.state`
- Use conditional logic: `{{ 'value1' if condition else 'value2' }}`
- Date functions: `as_timestamp()`, `timestamp_custom()`, `now()`

## �📝 Configuration Examples

### Basic Countdown
```yaml
type: custom:timeflow-card-beta
title: "New Year 2026"
target_date: "2026-01-01T00:00:00"
creation_date: "2025-01-01T00:00:00"
show_days: true
show_hours: true
show_minutes: false
show_seconds: false
```

### Dynamic Entity Timer
```yaml
type: custom:timeflow-card-beta
title: Next backup
target_date: sensor.backup_next_scheduled_automatic_backup
background_color: "#676F9D"
color: "#000000"
progress_color: "#2D3250"
show_seconds: false
show_minutes: false
show_hours: true
show_days: false
show_months: false
creation_date: sensor.backup_last_successful_automatic_backup
```

### Customized Styling
```yaml
type: custom:timeflow-card-beta
title: "Project Deadline"
target_date: "2025-03-15T17:00:00"
width: "300px"
height: "200px"
styles:
  title:
    - color: "#FF5722"
    - font-size: 1.8rem
  card:
    - border-radius: 15px
```

### Card-mod Styling
```yaml
type: custom:timeflow-card-beta
title: "Project Deadline"
target_date: "2025-03-15T17:00:00"
card_mod:
  style: |
    ha-card {
      background: linear-gradient(45deg, #1976d2, #42a5f5);
      border: 2px solid #0d47a1;
      border-radius: 20px;
      box-shadow: 0 4px 20px rgba(25, 118, 210, 0.3);
    }
    .title {
      color: white !important;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
    }
```

### Compact Mobile Widget
```yaml
type: grid
columns: 2
square: false
cards:
  - type: custom:timeflow-card-beta
    title: Bali Trip
    target_date: "2025-09-12T13:43:50"
    background_color: "#617065"
    color: "#0F1118"
    progress_color: "#889F89"
    show_seconds: false
    show_minutes: false
    show_hours: false
    show_days: true
    show_months: false
    expired_text: hi
    creation_date: "2025-07-12T13:43:50"
    aspect_ratio: 2/1
    width: 155px
    height: 120px
    styles:
      title:
        - font-size: 1.5rem
        - text-transform: uppercase
      subtitle:
        - font-size: 1.2rem
      progress_circle:
        - transform: scale(1.0)
  - type: custom:timeflow-card-beta
    title: Next backup
    target_date: sensor.backup_next_scheduled_automatic_backup
    background_color: "#676F9D"
    color: "#000000"
    progress_color: "#2D3250"
    show_seconds: false
    show_minutes: false
    show_hours: true
    show_days: false
    show_months: false
    creation_date: sensor.backup_last_successful_automatic_backup
    aspect_ratio: 2/1
    width: 155px
    height: 120px
    styles:
      title:
        - font-size: 1.5rem
        - text-transform: uppercase
      subtitle:
        - font-size: 1.2rem
      progress_circle:
        - transform: scale(1.0)
```

### Dimension Configuration
```yaml
# Fixed dimensions
type: custom:timeflow-card-beta
title: "Fixed Size Card"
target_date: "2025-12-31T23:59:59"
width: "400px"
height: "200px"
```

```yaml
# Width with aspect ratio
type: custom:timeflow-card-beta
title: "Proportional Card"
target_date: "2025-12-31T23:59:59"
width: "300px"
aspect_ratio: "2/1"  # Will be 300px × 150px
```

```yaml
# Responsive percentage width
type: custom:timeflow-card-beta
title: "Responsive Card"
target_date: "2025-12-31T23:59:59"
width: "50%"
height: "150px"
```

```yaml
# Aspect ratio only (uses default width)
type: custom:timeflow-card-beta
title: "Aspect Ratio Card"
target_date: "2025-12-31T23:59:59"
aspect_ratio: "16/9"  # Widescreen format
```

**Dimension Options:**
- `width`: CSS width value (e.g., "300px", "50%", "20em")
- `height`: CSS height value (e.g., "200px", "150px", "10em")  
- `aspect_ratio`: Width-to-height ratio (e.g., "16/9", "4/3", "2/1")

**Priority Order:**
1. If both `width` and `height` are specified, both are used
2. If `width` + `aspect_ratio`, height is calculated from ratio
3. If `height` + `aspect_ratio`, width is calculated from ratio
4. If only `aspect_ratio`, default width is used with calculated height
