# Pace Card

A beautiful countdown timer card for Home Assistant with an animated progress circle, inspired by modern design principles.

![Modern Design Example](https://img.shields.io/badge/Style-Modern-blue) ![Home Assistant](https://img.shields.io/badge/Home%20Assistant-Compatible-green) ![HACS](https://img.shields.io/badge/HACS-Compatible-orange)

## ✨ Features

- 🎨 **Three Modern Card Styles**: Modern (gradient), Classic (solid), and Minimal (clean)
- ⭕ **Animated Progress Circle**: Beautiful SVG-based circular progress indicator
- ⏰ **Flexible Time Display**: Show/hide days, hours, minutes, seconds as needed
- 📱 **Responsive Design**: Adapts beautifully to different screen sizes
- 🎛️ **Customizable Colors**: Full control over text, background, and progress colors
- 💅 **Modern UI**: Gradient backgrounds, smooth animations, and hover effects
- 🏠 **Home Assistant Native**: Built specifically for Home Assistant dashboards

## 🚀 Installation

### Option 1: HACS (Recommended)
1. Open HACS in Home Assistant
2. Go to "Frontend" section
3. Click the "+" button
4. Search for "Pace Card"
5. Install the card
6. Add to your Lovelace configuration

### Option 2: Manual Installation
1. Download `pacecard.js` from the [latest release](https://github.com/Rishi8078/Pacecard/releases)
2. Copy it to `config/www/` directory
3. Add to your Lovelace resources:

```yaml
resources:
  - url: /local/pacecard.js
    type: module
```

## 📝 Configuration

### Basic Configuration

```yaml
type: custom:pace-card
title: "New Year Countdown"
target_date: "2024-12-31T23:59:59"
```

### Full Configuration Example

```yaml
type: custom:pace-card
title: "Event Countdown"
target_date: "2024-12-31T23:59:59"
creation_date: "2024-01-01T00:00:00"  # Optional: for progress calculation
expired_text: "Event Started!"
card_style: modern                     # modern, classic, or minimal
show_days: true
show_hours: true  
show_minutes: true
show_seconds: true
color: "#ffffff"                       # Text color
background_color: "#1976d2"            # Card background
progress_color: "#4CAF50"              # Progress circle color
```

## ⚙️ Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `type` | string | **Required** | `custom:pace-card` |
| `title` | string | `"Countdown Timer"` | Card title text |
| `target_date` | string | **Required** | Target date in ISO format (`YYYY-MM-DDTHH:mm:ss`) |
| `creation_date` | string | `null` | Start date for progress calculation (optional) |
| `expired_text` | string | `"Timer Expired!"` | Text shown when countdown ends |
| `card_style` | string | `"modern"` | Card style: `modern`, `classic`, or `minimal` |
| `show_days` | boolean | `true` | Show days in countdown |
| `show_hours` | boolean | `true` | Show hours in countdown |
| `show_minutes` | boolean | `true` | Show minutes in countdown |
| `show_seconds` | boolean | `true` | Show seconds in countdown |
| `color` | string | `"#ffffff"` | Text color (hex format) |
| `background_color` | string | `"#1976d2"` | Card background color |
| `progress_color` | string | `"#4CAF50"` | Progress circle color |

## 🎨 Card Styles

### Modern Style (Default)
Beautiful gradient background with smooth color transitions:
```yaml
card_style: modern
background_color: "#1976d2"  # Creates gradient from this color
```

### Classic Style  
Clean solid background color:
```yaml
card_style: classic
background_color: "#1976d2"  # Solid color background
```

### Minimal Style
Clean design with subtle border:
```yaml
card_style: minimal
background_color: "#1976d2"  # Minimal styling with border
```

## 📱 Layout Examples

### Single Unit Display
When only one time unit is shown, the layout automatically centers:
```yaml
type: custom:pace-card
title: "Days Remaining"
target_date: "2024-12-31T23:59:59"
show_days: true
show_hours: false
show_minutes: false
show_seconds: false
```

### Multiple Units Display
Shows progress circle and detailed countdown side by side:
```yaml
type: custom:pace-card
title: "Complete Countdown" 
target_date: "2024-12-31T23:59:59"
show_days: true
show_hours: true
show_minutes: true
show_seconds: true
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
type: custom:pace-card
title: "Days Until Wedding"
target_date: "2024-06-15T14:30:00"
creation_date: "2023-12-01T00:00:00"
card_style: modern
background_color: "#E91E63"
progress_color: "#FFC107"
color: "#ffffff"
show_days: true
show_hours: false
show_minutes: false
show_seconds: false
```

### New Year Countdown
```yaml
type: custom:pace-card
title: "New Year 2025"
target_date: "2025-01-01T00:00:00"
expired_text: "Happy New Year! 🎉"
card_style: classic
background_color: "#673AB7"
progress_color: "#FFD700"
color: "#ffffff"
```

### Project Deadline
```yaml
type: custom:pace-card
title: "Project Deadline"
target_date: "2024-03-15T17:00:00"
creation_date: "2024-01-01T09:00:00"
expired_text: "Deadline Reached!"
card_style: minimal
background_color: "#FF5722"
progress_color: "#4CAF50"
show_seconds: false
```

## 🐛 Troubleshooting

### Card Not Showing
1. Ensure the resource is properly added to Lovelace
2. Check browser console for JavaScript errors
3. Verify the `target_date` format is correct
4. Clear browser cache and refresh

### Date Format Issues
- Use ISO 8601 format: `YYYY-MM-DDTHH:mm:ss`
- Example: `"2024-12-31T23:59:59"`
- Avoid spaces or different date formats

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
