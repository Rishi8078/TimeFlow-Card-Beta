## TimeFlow Card Example Configurations

Here are some example configurations for different use cases:

### Basic New Year Countdown
```yaml
type: custom:timeflow-card
title: "New Year Countdown"
target_date: "2025-01-01T00:00:00"
```

### Event Countdown (Conference/Meeting)
```yaml
type: custom:timeflow-card
title: "Conference Starts In"
target_date: "2025-06-15T09:00:00"
background_color: "#4CAF50"
color: "#ffffff"
show_seconds: false
```

### Birthday Countdown
```yaml
type: custom:timeflow-card
title: "Sarah's Birthday 🎂"
target_date: "2025-08-20T00:00:00"
background_color: "#E91E63"
expired_text: "Happy Birthday! 🎉"
```

### Work/Weekend Countdown
```yaml
type: custom:timeflow-card
title: "Weekend Countdown"
target_date: "2025-07-25T17:00:00"
show_days: false
background_color: "#FF9800"
```

### Project Deadline
```yaml
type: custom:timeflow-card
title: "Project Due In"
target_date: "2025-09-30T23:59:59"
background_color: "#f44336"
expired_text: "OVERDUE!"
```

### Dynamic Sizing Examples

#### Square Card
```yaml
type: custom:timeflow-card
title: "Square Timer"
target_date: "2025-12-31T23:59:59"
aspect_ratio: "1/1"
icon_size: "80px"
background_color: "#673AB7"
```

#### Wide Card
```yaml
type: custom:timeflow-card
title: "Wide Dashboard Card"
target_date: "2025-12-31T23:59:59"
aspect_ratio: "3/1"
icon_size: "120px"
stroke_width: 20
background_color: "#009688"
```

#### Tall Card
```yaml
type: custom:timeflow-card
title: "Tall Card"
target_date: "2025-12-31T23:59:59"
aspect_ratio: "1/1.5"
icon_size: "100px"
background_color: "#FF5722"
```

#### Fixed Dimensions
```yaml
type: custom:timeflow-card
title: "Custom Size"
target_date: "2025-12-31T23:59:59"
width: "250px"
height: "200px"
icon_size: "90px"
stroke_width: 18
background_color: "#795548"
```

#### Large Progress Circle
```yaml
type: custom:timeflow-card
title: "Big Circle"
target_date: "2025-12-31T23:59:59"
icon_size: "150px"
stroke_width: 25
aspect_ratio: "1/1"
background_color: "#607D8B"
```

### Styles Configuration Examples

#### Custom Styled Card (like button-card)
```yaml
type: custom:timeflow-card
title: "Styled Timer"
target_date: "2025-12-31T23:59:59"
background_color: "#2196F3"
styles:
  card:
    - height: 180px
    - border-radius: 25px
    - box-shadow: 0 4px 20px rgba(33, 150, 243, 0.3)
  title:
    - color: yellow
    - font-size: 1.8rem
    - text-transform: uppercase
    - letter-spacing: 2px
  subtitle:
    - color: orange
    - font-size: 1.2rem
    - font-weight: bold
  progress_circle:
    - transform: scale(1.1)
    - filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))
```

#### Compact Mobile Style
```yaml
type: custom:timeflow-card
title: "Mobile Timer"
target_date: "2025-12-31T23:59:59"
aspect_ratio: "3/1"
icon_size: "60px"
stroke_width: 8
styles:
  card:
    - padding: 12px
  title:
    - font-size: 1.2rem
  subtitle:
    - font-size: 0.9rem
```

#### Dark Theme with Custom Fonts
```yaml
type: custom:timeflow-card
title: "Dark Timer"
target_date: "2025-12-31T23:59:59"
background_color: "#1a1a1a"
color: "#ffffff"
progress_color: "#00ff88"
styles:
  card:
    - border: 2px solid #333
  title:
    - font-family: 'Courier New, monospace'
    - color: #00ff88
    - text-shadow: 0 0 10px rgba(0, 255, 136, 0.5)
  subtitle:
    - font-family: 'Courier New, monospace'
    - color: #888
```

### Holiday Countdown (Christmas)
```yaml
type: custom:timeflow-card
title: "Christmas Countdown 🎄"
target_date: "2025-12-25T00:00:00"
background_color: "#2E7D32"
color: "#ffffff"
border_radius: "12px"
```

### Vacation Countdown
```yaml
type: custom:timeflow-card
title: "Vacation Starts In ✈️"
target_date: "2025-07-01T06:00:00"
background_color: "#1976D2"
show_seconds: false
font_size: "2.2rem"
```

### Compact Timer (Minutes Only)
```yaml
type: custom:timeflow-card
title: "Break Time"
target_date: "2025-07-18T15:30:00"
show_days: false
show_hours: false
background_color: "#9C27B0"
font_size: "3rem"
```

### Retirement Countdown
```yaml
type: custom:timeflow-card
title: "Retirement Countdown 🏖️"
target_date: "2030-12-31T17:00:00"
background_color: "#795548"
expired_text: "Time to Retire!"
```

### Custom Styled Dark Theme
```yaml
type: custom:timeflow-card
title: "Custom Event"
target_date: "2025-10-31T00:00:00"
background_color: "#212121"
color: "#FF6B35"
border_radius: "20px"
font_size: "1.5rem"
```
