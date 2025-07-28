# TimeFlow Card **(Beta Version)**

A beautiful countdown timer card for Home Assistant with animated progress circle, intelligent time formatting, and modern modular architecture.

![TimeFlow Card Preview](assets/assets.png)
> - For the stable release, see: [TimeFlow-Card](https://github.com/Rishi8078/TimeFlow-Card)
> - This beta may include new features, experimental changes, and breaking updates.

## ✨ Features

- 🏗️ Modular Architecture: Clean, maintainable components
- 🎨 Template Support: Dynamic values for all config properties
- ⚡ Performance Optimized: Smart updates, efficient rendering
- 🎯 Smart Time Display: Natural language formatting with unit cascading
- 🔄 Animated Progress: SVG progress circle with dynamic scaling
- 🎨 Customizable Styling: Colors, sizes, time units, Card-mod support
- 📱 Responsive Design: Automatic sizing, mobile-friendly
- ♿ Accessibility: Screen reader and keyboard support
- 🌐 Cross-Platform: Robust date parsing on all browsers

## 🚀 Installation

### HACS (Recommended)

1. Open HACS → Frontend → "⋮" (three dots menu) → Custom repositories
2. Add repository URL: `https://github.com/Rishi8078/TimeFlow-Card-Beta`
3. Select category: "Dashboard"
4. Add and then search/install Timeflow-card-beta

### Manual
1. Download `timeflow-card-beta.js` from the [releases](https://github.com/Rishi8078/TimeFlow-Card-Beta/releases)
2. Copy it to your `config/www/` directory
3. Add to resources:
   ```yaml
   resources:
     - url: /local/timeflow-card-beta.js
       type: module
   ```

## ⚙️ Configuration Options

| Option             | Type    | Default                 | Description                          |
|--------------------|---------|-------------------------|--------------------------------------|
| `target_date`      | string  | **Required**            | ISO date or entity ID                |
| `title`            | string  | `"Countdown Timer"`     | Card title                           |
| `creation_date`    | string  | `null`                  | Start date for progress              |
| `expired_text`     | string  | `"Completed! 🎉"`       | Text when expired                    |
| `show_*`           | boolean | `true`                  | Show time units                      |
| `width/height`     | string  | `null`                  | Card dimensions                      |
| `aspect_ratio`     | string  | `"2/1"`                 | Card proportions                     |
| `color`            | string  | `"#ffffff"`             | Text color                           |
| `background_color` | string  | `"#1976d2"`             | Card background                      |
| `progress_color`   | string  | `"#4CAF50"`             | Progress circle color                |
| `stroke_width`     | number  | `15`                    | Progress circle stroke thickness     |
| `icon_size`        | number  | `100`                   | Progress circle size (auto)          |
| `card_mod`         | object  | `null`                  | Card-mod styling config              |

- For complete YAML and advanced templates, see the main project or documentation.
- For feedback or issues, please open a GitHub issue in the main repo.