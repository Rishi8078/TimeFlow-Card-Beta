# Pace Card - Countdown Timer for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A beautiful and customizable countdown timer card for Home Assistant dashboards, designed to work seamlessly with HACS.

## Features

- ✨ **Modern Design**: Clean, responsive interface with smooth animations
- ⏰ **Flexible Display**: Show/hide days, hours, minutes, and seconds as needed
- 🎨 **Customizable Styling**: Configure colors, font sizes, and border radius
- 📱 **Mobile Responsive**: Optimized for all device sizes
- ⚡ **Real-time Updates**: Live countdown with second-by-second updates
- 🔧 **Easy Configuration**: Visual configuration editor in the UI
- 🎯 **Target Date Support**: Set any future date and time as your target

## Installation

### HACS (Recommended)

1. Open HACS in your Home Assistant instance
2. Click on "Frontend" 
3. Click the "+" button in the bottom right
4. Search for "Pace Card"
5. Click "Install"
6. Restart Home Assistant

### Manual Installation

1. Download `pacecard.js` from the [latest release](https://github.com/yourusername/pacecard/releases)
2. Copy it to `<config directory>/www/pacecard.js`
3. Add the following to your `configuration.yaml`:
   ```yaml
   lovelace:
     resources:
       - url: /local/pacecard.js
         type: module
   ```
4. Restart Home Assistant

## Configuration

### Basic Configuration

```yaml
type: custom:pace-card
title: "New Year Countdown"
target_date: "2024-12-31T23:59:59"
```

### Full Configuration Options

```yaml
type: custom:pace-card
title: "Custom Countdown"
target_date: "2024-12-31T23:59:59"
expired_text: "Happy New Year!"
show_days: true
show_hours: true
show_minutes: true
show_seconds: true
font_size: "2rem"
color: "#ffffff"
background_color: "#1976d2"
border_radius: "8px"
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `type` | string | **Required** | Must be `custom:pace-card` |
| `title` | string | `"Countdown Timer"` | Card title |
| `target_date` | string | **Required** | Target date in ISO format (YYYY-MM-DDTHH:mm:ss) |
| `expired_text` | string | `"Timer Expired!"` | Text shown when countdown reaches zero |
| `show_days` | boolean | `true` | Show days in countdown |
| `show_hours` | boolean | `true` | Show hours in countdown |
| `show_minutes` | boolean | `true` | Show minutes in countdown |
| `show_seconds` | boolean | `true` | Show seconds in countdown |
| `font_size` | string | `"2rem"` | Font size for countdown numbers |
| `color` | string | `"#ffffff"` | Text color (hex, rgb, or color name) |
| `background_color` | string | `"#1976d2"` | Background color of the card |
| `border_radius` | string | `"8px"` | Border radius for rounded corners |

## Usage Examples

### Event Countdown
```yaml
type: custom:pace-card
title: "Conference Starts In"
target_date: "2024-06-15T09:00:00"
background_color: "#4CAF50"
```

### Birthday Countdown
```yaml
type: custom:pace-card
title: "Birthday Countdown"
target_date: "2024-08-20T00:00:00"
show_seconds: false
background_color: "#E91E63"
expired_text: "Happy Birthday! 🎉"
```

### Work Timer
```yaml
type: custom:pace-card
title: "Weekend Countdown"
target_date: "2024-05-17T17:00:00"
show_days: false
background_color: "#FF9800"
font_size: "1.5rem"
```

## Visual Editor

The card includes a visual configuration editor that can be accessed through the Home Assistant UI:

1. Add a new card to your dashboard
2. Select "Custom: Pace Card" from the card types
3. Use the visual editor to configure all options
4. Preview your changes in real-time

## Styling

The card is designed to integrate seamlessly with Home Assistant themes. You can customize:

- **Colors**: Background and text colors with full hex/rgb support
- **Typography**: Adjustable font sizes with CSS units (rem, px, em)
- **Layout**: Configurable border radius and responsive design
- **Animations**: Smooth hover effects and blinking separators

## Browser Support

- Chrome/Chromium 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

### v1.0.0
- Initial release
- Basic countdown functionality
- Visual configuration editor
- Responsive design
- HACS integration

## Support

If you find this card useful, please consider:
- ⭐ Starring this repository
- 🐛 Reporting issues
- 💡 Suggesting new features
- 📖 Contributing to the documentation

---

Made with ❤️ for the Home Assistant community
