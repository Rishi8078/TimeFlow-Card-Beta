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

## 🧾 Listy: several timers in one card

Every other style shows one timer. `style: listy` shows one pill per running
timer, across as many Alexa and Google Home devices as auto-discovery finds — so
a kitchen with pizza, eggs and the oven going shows all three instead of
whichever finishes first.

```yaml
type: custom:timeflow-card-beta
style: listy
title: Smart Timers
auto_discover_alexa: true
auto_discover_google: true
max_timers: 5
```

Rows are ordered the way you need to read them: anything finished sits at the
top, then running timers soonest-first, then paused ones. Each row shows where
the timer lives, what it is counting, and a progress ring.

### Pinning your own countdowns

Set `cards` to pin countdowns into the same list. With auto-discovery on, the
discovered smart timers are pulled in alongside them; with it off, the card is
just your list.

```yaml
type: custom:timeflow-card-beta
style: listy
title: Smart Timers
auto_discover_alexa: true
cards:
  - title: Trip To Poland
    target_date: '2026-11-01'
    header_icon: mdi:bag-suitcase
    background_color: '#3d2e38'
    text_color: '#ffffff'
    header_icon_background: '#594452'
    header_icon_color: '#d6c7b2'
    progress_color: '#94809a'
```

Each entry takes `target_date`, `creation_date`, `count_up_goal_date`,
`count_up_cycle`, `mode`, `title`, `subtitle`, `expired_text`, `header_icon`,
`header_icon_color`, `header_icon_background`, `background_color`, `text_color`
and `progress_color`. Pinned entries always render; `max_timers` caps only the
discovered timers.

### Options

| Option                 | Type    | Default   | Description                                                            |
|------------------------|---------|-----------|------------------------------------------------------------------------|
| `max_timers`           | number  | `5`       | Timer rows before the list is truncated (1–20)                          |
| `cards`                | list    | `[]`      | Countdowns pinned into the list                                         |
| `alexa_icon`           | string  | `mdi:amazon-alexa` | Icon for Alexa rows                                            |
| `google_icon`          | string  | `mdi:google-home`  | Icon for Google Home rows                                      |
| `timer_icon`           | string  | `mdi:timer-outline` | Icon for standard `timer.*` rows                              |

**Row titles.** With one device in the list, rows are titled by integration
("Alexa Timer", "Google Home"). Once the list spans more than one device they
switch to device names ("Kitchen", "Office"), which is the only thing telling
two Alexa rows apart.

**Icons.** The defaults are `mdi:` so the card works on a stock install. If you
run one of the community icon packs, point the icon options at them —
`alexa_icon: phu:alexa-logo`, `google_icon: m3of:android-google-home`.

Pointing `timer_entity` at a single device instead of using auto-discovery lists
just that device's timers.

## ⚙️ Configuration Options

| Option             | Type    | Default                 | Description                          |
|--------------------|---------|-------------------------|--------------------------------------|
| `target_date`      | string  | **Required**            | ISO date or entity ID                |
| `title`            | string  | `"Countdown Timer"`     | Card title                           |
| `creation_date`    | string  | `null`                  | Start date for progress              |
| `expired_text`     | string  | `"Completed!"`       | Text when expired                    |
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