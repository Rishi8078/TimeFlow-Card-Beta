# TimeFlow Card

![Home Assistant](https://img.shields.io/badge/Home%20Assistant-Compatible-green) ![HACS](https://img.shields.io/badge/HACS-Compatible-orange)

A beautiful countdown timer card for Home Assistant with animated progress circle and intelligent time formatting.

![TimeFlow Card Preview](assets/preview.png)

## ✨ Features

- Animated SVG progress circle with dynamic scaling
- Smart time display with natural language formatting
- Customizable colors, sizes, and time units
- Entity support for dynamic countdowns
- Cross-platform date parsing
- **Card-mod compatibility** for advanced styling

## 🚀 Installation

### HACS (Recommended)
1. Open HACS → Frontend → "+" button
2. Search for "TimeFlow Card" and install
3. Add to your Lovelace configuration

### Manual
1. Download `timeflow-card.js` from [releases](https://github.com/Rishi8078/TimeFlow-Card/releases)
2. Copy to `config/www/` directory
3. Add to resources:
```yaml
resources:
  - url: /local/timeflow-card.js
    type: module
```

## 📝 Configuration Examples

### Basic Countdown
```yaml
type: custom:timeflow-card
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
creation_date: sensor.backup_last_successful_automatic_backup
```

### Customized Styling
```yaml
type: custom:timeflow-card
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
type: custom:timeflow-card
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
  - type: custom:timeflow-card
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
  - type: custom:timeflow-card
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
| `card_mod` | object | `null` | [Card-mod](https://github.com/thomasloven/lovelace-card-mod) styling configuration |

## 🐛 Troubleshooting

**Card not showing?**
- Check Lovelace resources are added correctly
- Verify `target_date` format: `"YYYY-MM-DDTHH:mm:ss"`
- Clear browser cache

**Entity issues?**
- Ensure entity exists and has valid datetime state
- Use ISO format in entity states
- Check entity availability in Developer Tools

**Mobile problems?**
- Use ISO 8601 format for cross-platform compatibility
- Avoid spaces in date strings

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Made with ❤️ for the Home Assistant community**
