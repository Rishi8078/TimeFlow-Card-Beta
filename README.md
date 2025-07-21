# TimeFlow Card

![Modern Design Example](https://img.shields.io/badge/Style-Modern-blue) ![Home Assistant](https://img.shields.io/badge/Home%20Assistant-Compatible-green) ![HACS](https://img.shields.io/badge/HACS-Compatible-orange)

A beautiful countdown timer card for Home Assistant with an animated progress circle and intelligent time formatting.

![TimeFlow Card Preview](assets/asset.png)


## ✨ Features

- ⭕ **Animated Progress Circle**: Beautiful SVG-based circular progress indicator
- ⏰ **Smart Time Display**: Cascading time units with natural language formatting (e.g., "2 months and 5 days" or "3d 4h 12m")
- 🧠 **Intelligent Unit Management**: Disabled time units cascade into enabled ones for accurate display
- 🎛️ **Highly Customizable**: Control colors, sizes, time units, and display text
- 💅 **Modern UI**: Clean design with smooth animations and hover effects
- 🌐 **Cross-Platform Compatible**: Robust date parsing that works consistently across web and mobile devices
- 🏠 **Home Assistant Native**: Built specifically for Home Assistant dashboards with entity support

## 🚀 Installation

### Option 1: HACS (Recommended)
1. Open HACS in Home Assistant
2. Go to "Frontend" section
3. Click the "+" button
4. Search for "TimeFlow Card"
5. Install the card
6. Add to your Lovelace configuration

### Option 2: Manual Installation
1. Download `timeflow-card.js` from the [latest release](https://github.com/Rishi8078/TimeFlow-Card/releases)
2. Copy it to `config/www/` directory
3. Add to your Lovelace resources:

```yaml
resources:
  - url: /local/timeflow-card.js
    type: module
```

## 📝 Configuration

### Basic Configuration

```yaml
type: custom:timeflow-card
title: New Year
target_date: "2026-01-01T00:00:00"
show_seconds: false
show_minutes: false
show_hours: false
show_days: true
show_months: false
expired_text: happy New Year!
creation_date: "2025-01-01T00:00:00"

```

### Using Entities (Dynamic Values)

```yaml
type: custom:timeflow-card
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
expired_text: hi
creation_date: sensor.backup_last_successful_automatic_backup
```

### Full Configuration Example

```yaml
type: custom:timeflow-card
title: "Event Countdown"
target_date: "2025-12-31T23:59:59"
creation_date: "2025-01-01T00:00:00"  # Optional: for progress calculation
expired_text: "Event Started!"
show_months: false                     # Show months in countdown
show_days: true
show_hours: true  
show_minutes: true
show_seconds: true
color: "#ffffff"                       # Text color
background_color: "#1976d2"           # Card background color
progress_color: "#4CAF50"             # Progress circle color

# Dynamic Sizing Options (like button-card)
width: "300px"                        # Card width: '200px', '100%', etc.
height: "150px"                       # Card height: '100px', 'auto', etc.
aspect_ratio: "2/1"                   # Aspect ratio: '1/1', '2/1', '3/1', '1/1.5'
icon_size: "100px"                    # Progress circle size: '80px', '120px'
stroke_width: 15                      # Progress circle thickness: 10, 20, etc.

# Styles Configuration (like button-card)
styles:
  card:
    - height: 150px
    - border-radius: 25px
  title:
    - color: yellow
    - font-size: 1.8rem
    - text-transform: uppercase
  subtitle:
    - color: orange
    - font-size: 1.2rem
  progress_circle:
    - transform: scale(1.1)
```

### Dynamic Sizing Options

The TimeFlow Card now supports flexible sizing similar to the button-card with **intelligent progress circle scaling**:

- **`width`**: Set card width (`'200px'`, `'100%'`, etc.)
- **`height`**: Set card height (`'150px'`, `'auto'`, etc.)
- **`aspect_ratio`**: Set aspect ratio when height not specified (`'1/1'`, `'2/1'`, `'3/1'`, `'1/1.5'`)
- **`icon_size`**: Set base progress circle size (`'80px'`, `'120px'`, `'150px'`)
- **`stroke_width`**: Set base progress circle thickness (`10`, `15`, `20`)

### Automatic Size Scaling

The progress circle automatically scales based on the card size to maintain perfect proportions:

- **Smart Scaling**: Progress circle resizes to roughly 40-45% of the smallest card dimension
- **Proportional Stroke**: Stroke width adjusts proportionally to the circle size
- **Responsive Design**: Typography and spacing adapt to card size
- **Minimum Constraints**: Circle never goes below 40px for usability

This ensures the card always looks balanced regardless of size, from tiny mobile widgets to large desktop displays.

### Styles Configuration

Like button-card, you can customize individual elements using the `styles` configuration:

- **`card`**: Style the main card container
- **`title`**: Style the title text
- **`subtitle`**: Style the subtitle/countdown text
- **`progress_circle`**: Style the progress circle element

### Sizing Examples

```yaml
# Tiny mobile widget - circle automatically scales down
type: custom:timeflow-card
title: "Timer"
target_date: "2025-12-31T23:59:59"
width: "120px"
height: "80px"
# Progress circle: ~36px, stroke: ~5px (automatically calculated)

# Square card - perfect proportions
type: custom:timeflow-card
title: "Square Timer"
target_date: "2025-12-31T23:59:59"
aspect_ratio: "1/1"
width: "200px"
# Progress circle: ~90px, stroke: ~14px (automatically calculated)

# Wide card - large and prominent
type: custom:timeflow-card
title: "Wide Timer"
target_date: "2025-12-31T23:59:59"
aspect_ratio: "3/1"
width: "400px"
# Progress circle: ~60px, stroke: ~9px (automatically calculated)

# Large display card
type: custom:timeflow-card
title: "Big Event"
target_date: "2025-12-31T23:59:59"
width: "500px"
height: "300px"
# Progress circle: ~135px, stroke: ~20px (automatically calculated)

# Override automatic scaling if needed
type: custom:timeflow-card
title: "Custom Override"
target_date: "2025-12-31T23:59:59"
width: "300px"
height: "200px"
icon_size: "160px"    # Force larger circle
stroke_width: 25      # Force thicker stroke
```

## ⚙️ Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `type` | string | **Required** | `custom:timeflow-card` |
| `title` | string | `"Countdown Timer"` | Card title text |
| `target_date` | string | **Required** | Target date in ISO format (`YYYY-MM-DDTHH:mm:ss`) or entity ID (e.g., `sensor.target_date`) |
| `creation_date` | string | `null` | Start date for progress calculation (optional) - can be date string or entity ID |
| `expired_text` | string | `"Completed! 🎉"` | Text shown when countdown ends |
| `show_months` | boolean | `false` | Show months in countdown |
| `show_days` | boolean | `true` | Show days in countdown |
| `show_hours` | boolean | `true` | Show hours in countdown |
| `show_minutes` | boolean | `true` | Show minutes in countdown |
| `show_seconds` | boolean | `true` | Show seconds in countdown |
| `color` | string | `"#ffffff"` | Text color (hex format) |
| `background_color` | string | `"#1976d2"` | Card background color |
| `progress_color` | string | `"#4CAF50"` | Progress circle color |

### Dynamic Sizing Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `width` | string | `null` | Card width (e.g., `"200px"`, `"100%"`) |
| `height` | string | `null` | Card height (e.g., `"150px"`, `"auto"`) |
| `aspect_ratio` | string | `"2/1"` | Aspect ratio when height not specified (e.g., `"1/1"`, `"2/1"`, `"3/1"`) |
| `icon_size` | string | `"100px"` | Progress circle size (e.g., `"80px"`, `"120px"`) |
| `stroke_width` | number | `15` | Progress circle thickness (e.g., `10`, `20`) |

### Styles Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `styles.card` | array | `[]` | CSS styles for the card container (e.g., `['height: 150px', 'border-radius: 25px']`) |
| `styles.title` | array | `[]` | CSS styles for the title text (e.g., `['color: yellow', 'font-size: 1.8rem']`) |
| `styles.subtitle` | array | `[]` | CSS styles for the subtitle/countdown text (e.g., `['color: orange']`) |
| `styles.progress_circle` | array | `[]` | CSS styles for the progress circle (e.g., `['transform: scale(1.1)']`) |

## 🔗 Using Home Assistant Entities

The card supports reading values from Home Assistant entities for dynamic countdowns:

### Supported Entity Types
- **Date/Time Sensors**: `sensor.target_date`, `sensor.end_time`
- **Input DateTime**: `input_datetime.event_date`, `input_datetime.start_time`
- **Any entity with datetime state**: Must be in ISO format or parseable date

### Example with Entities
```yaml
type: custom:timeflow-card
title: "Washing Machine"
target_date: sensor.washing_machine_end_time
creation_date: input_datetime.wash_start
show_hours: true
show_minutes: true
show_seconds: false
show_days: false
background_color: "#2196F3"
progress_color: "#4CAF50"
expired_text: "Wash Complete!"
```

### Entity Requirements
- Entity state must contain a valid datetime string
- Supported formats: ISO 8601 (`2025-12-31T23:59:59`), most standard date formats
- Cross-platform compatible date parsing ensures consistent behavior on all devices
- If entity is unavailable, card will show an error state

## 🧠 Smart Time Display Features

### Natural Language Formatting
The card intelligently formats time displays based on the number of enabled units:

- **1-2 enabled units**: Natural language (e.g., "2 months and 5 days", "1 hour and 30 minutes")
- **3+ enabled units**: Compact format (e.g., "2mo 5d 3h", "1d 12h 30m 45s")

### Cascading Time Units
When time units are disabled, their values cascade into enabled units:

```yaml
# Only show days - months cascade into days
show_months: false
show_days: true
show_hours: false
# Result: Shows total days including month values
```

### Examples of Time Display Logic
- **All units enabled**: "2mo 5d 3h 30m 45s"
- **Days and hours only**: "65 days and 3 hours" 
- **Minutes and seconds only**: "1,830 minutes and 45 seconds"
- **Days only**: "65 days"

## 📱 Card Sizes and Layout

### Size Options
Configure the card size to fit your dashboard layout:

```yaml
size: "small"    # Min height: 100px, Max height: 150px
size: "medium"   # Min height: 120px, Max height: 200px (default)
size: "large"    # Min height: 140px, Max height: 250px
```

### Layout Behavior
- **Aspect Ratio**: Fixed 2:1 ratio for consistent appearance
- **Progress Circle**: Always shown on the right side with animated progress
- **Title & Subtitle**: Clean header section with natural time formatting
- **Responsive**: Adapts to different screen sizes with appropriate font scaling

### Single Unit Display
When only one time unit is shown, it uses natural language:
```yaml
type: custom:timeflow-card
title: "Days Remaining"
target_date: "2025-12-31T23:59:59"
show_months: false
show_days: true
show_hours: false
show_minutes: false
show_seconds: false
# Result: "165 days" in subtitle
```

### Multiple Units Display
Shows progress circle and detailed countdown:
```yaml
type: custom:timeflow-card
title: "Complete Countdown" 
target_date: "2025-12-31T23:59:59"
show_months: true
show_days: true
show_hours: true
show_minutes: true
show_seconds: true
# Result: "5mo 4d 12h 30m 45s" in subtitle
```

## 🎯 Use Cases

- **Event Countdowns**: Weddings, birthdays, holidays
- **Project Deadlines**: Work milestones, release dates
- **Holiday Timers**: Christmas, New Year, vacation countdowns
- **Personal Goals**: Fitness challenges, habit tracking
- **Home Automation**: Maintenance reminders, scheduled events

## 🔧 Advanced Examples

### Wedding Countdown
```yaml
type: custom:timeflow-card
title: "Days Until Wedding"
target_date: "2025-06-15T14:30:00"
creation_date: "2024-12-01T00:00:00"
background_color: "#E91E63"
progress_color: "#FFC107"
color: "#ffffff"
show_months: true
show_days: true
show_hours: false
show_minutes: false
show_seconds: false
size: "large"
```

### Dynamic Laundry Timer (Using Entities)
```yaml
type: custom:timeflow-card
title: "Laundry Timer"
target_date: sensor.washing_machine_end_time
creation_date: input_datetime.wash_start
background_color: "#1a1a1a"
color: "#f3ecec"
show_months: false
show_days: false
show_hours: true
show_minutes: true
show_seconds: false
progress_color: "#62ea64"
expired_text: "Laundry Done!"
```

### Automation-Triggered Timer
```yaml
type: custom:timeflow-card
title: "Backup Complete In"
target_date: sensor.next_backup_time
creation_date: sensor.last_backup_time
show_months: false
show_days: false
show_hours: true
show_minutes: true
show_seconds: true
background_color: "#37474F"
progress_color: "#00BCD4"
expired_text: "Backup Running..."
```

### New Year Countdown
```yaml
type: custom:timeflow-card
title: "New Year 2026"
target_date: "2026-01-01T00:00:00"
expired_text: "Happy New Year! 🎉"
background_color: "#673AB7"
progress_color: "#FFD700"
color: "#ffffff"
show_months: true
show_days: true
show_hours: true
show_minutes: true
show_seconds: true
```

### Project Deadline
```yaml
type: custom:timeflow-card
title: "Project Deadline"
target_date: "2025-03-15T17:00:00"
creation_date: "2025-01-01T09:00:00"
expired_text: "Deadline Reached!"
background_color: "#FF5722"
progress_color: "#4CAF50"
show_months: false
show_days: true
show_hours: true
show_minutes: false
show_seconds: false
size: "medium"
```

## 🐛 Troubleshooting

### Card Not Showing
1. Ensure the resource is properly added to Lovelace
2. Check browser console for JavaScript errors
3. Verify the `target_date` format is correct
4. Clear browser cache and refresh

### Date Format Issues
- Use ISO 8601 format: `YYYY-MM-DDTHH:mm:ss`
- Example: `"2025-12-31T23:59:59"`
- The card uses cross-platform compatible date parsing for iOS/Android devices
- Avoid spaces or ambiguous date formats

### Time Display Issues
- If time units seem incorrect, check which units are enabled/disabled
- Remember that disabled units cascade into enabled ones
- For debugging, enable all units temporarily to see the full breakdown

### Mobile Device Compatibility
- The card uses robust date parsing specifically designed for cross-platform compatibility
- Tested on iOS, Android, and web browsers
- If you experience "Timer has expired" issues on mobile, ensure your date strings are in ISO format

### Custom Colors Not Working
- Use hex format: `"#FF5733"`
- Ensure quotes around color values
- Check for typos in color property names

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues, feature requests, or pull requests.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## ⭐ Support

If you find this card useful, please consider giving it a star on GitHub!

---

**Made with ❤️ for the Home Assistant community**
