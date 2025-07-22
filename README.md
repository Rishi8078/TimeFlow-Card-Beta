# ⚠️ TimeFlow Card (Beta)

**This is the BETA version** of TimeFlow Card for testing new features.

**For stable version, use:** [TimeFlow Card](https://github.com/Rishi8078/TimeFlow-Card)

## 🧪 Current Beta Features
- **🔥 NEW:** Template support for dynamic values (target_date, colors, titles)
- Template-based timezone handling and calculations
- Dynamic styling based on entity states
- Advanced templating for all configuration properties

## 🔗 Template Examples

### Dynamic Target Date (Timezone Handling)
```yaml
type: custom:timeflow-card-beta
target_date: "{{ (states.input_datetime.timer.state | as_timestamp) | timestamp_custom('%Y-%m-%d %H:%M:%S') }}"
title: "Event Countdown"
```

### Dynamic Colors Based on State
```yaml
type: custom:timeflow-card-beta
target_date: "2024-12-31T23:59:59"
primary_color: "{{ 'red' if (as_timestamp(states.input_datetime.deadline.state) - now().timestamp()) < 3600 else 'blue' }}"
background_color: "{{ 'darkred' if states.binary_sensor.alert.state == 'on' else '#1976d2' }}"
```

### Dynamic Content
```yaml
type: custom:timeflow-card-beta
target_date: "{{ states.sensor.next_event_date.state }}"
title: "{{ 'URGENT' if states.binary_sensor.alert.state == 'on' else states.sensor.event_name.state }}"
```

## Installation
Add as custom repository in HACS:
- URL: `https://github.com/Rishi8078/TimeFlow-Card-Beta`
- Category: Dashboard

# TimeFlow Card

[![Home Assistant][ha_badge]][ha_link] [![HACS][hacs_badge]][hacs_link] [![GitHub Release][release_badge]][release] [![Buy Me A Coffee][bmac_badge]][bmac]

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

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=rishi8078&repository=Timeflow-card)

**Or manually:**
1. Open HACS → Frontend → "⋮" (three dots menu) → Custom repositories
2. Add repository URL: `https://github.com/Rishi8078/TimeFlow-Card`
3. Select category: "Dashboard"
4. Click "Add" → Search for Timeflow-card → install

### Manual
1. Download `timeflow-card.js` from [releases](https://github.com/Rishi8078/TimeFlow-Card/releases)
2. Copy to `config/www/` directory
3. Add to resources:
```yaml
resources:
  - url: /local/timeflow-card.js
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
| `card_mod` | object | `null` | [Card-mod](https://github.com/thomasloven/lovelace-card-mod) styling configuration |

## � Template Support (Beta Feature)

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

## 🐛 Troubleshooting

**Card not showing?**
- Check Lovelace resources are added correctly
- Verify `target_date` format: `"YYYY-MM-DDTHH:mm:ss"`
- Clear browser cache (Ctrl+F5 or Cmd+Shift+R)
- Restart Home Assistant if needed

**Entity issues?**
- Ensure entity exists and has valid datetime state
- Use ISO format in entity states
- Check entity availability in Developer Tools


## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## ☕ Support Development

If you find TimeFlow Card useful, consider buying me a coffee! Your support helps maintain and improve this project.

<a href="https://coff.ee/rishi8078" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

---

**Made with ❤️ for the Home Assistant community**
<!-- Link references -->
[ha_badge]: https://img.shields.io/badge/Home%20Assistant-Compatible-green
[ha_link]: https://www.home-assistant.io/
[hacs_badge]: https://img.shields.io/badge/HACS-Compatible-orange
[hacs_link]: https://hacs.xyz/
[release_badge]: https://img.shields.io/github/v/release/Rishi8078/TimeFlow-Card
[release]: https://github.com/Rishi8078/TimeFlow-Card/releases
[bmac_badge]: https://img.shields.io/badge/buy_me_a-coffee-yellow
[bmac]: https://coff.ee/rishi8078
