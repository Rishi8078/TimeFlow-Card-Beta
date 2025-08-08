# TimeFlow Card Action Configuration

The TimeFlow Card now supports interactive actions similar to other Home Assistant cards. You can configure tap, hold, and double-tap actions to trigger various Home Assistant actions.

## Action Types

### Supported Actions

- **tap_action**: Action performed on single tap/click
- **hold_action**: Action performed on long press (500ms)
- **double_tap_action**: Action performed on double tap

### Action Configurations

Each action supports the following action types:

#### `more-info`
Shows the more-info dialog for an entity.
```yaml
tap_action:
  action: more-info
  entity: timer.my_timer
```

#### `toggle`
Toggles an entity's state.
```yaml
tap_action:
  action: toggle
  entity: switch.my_switch
```

#### `call-service`
Calls a Home Assistant service.
```yaml
tap_action:
  action: call-service
  service: timer.start
  target:
    entity_id: timer.my_timer
  data:
    duration: '00:10:00'
```

#### `navigate`
Navigates to a different view or dashboard.
```yaml
tap_action:
  action: navigate
  navigation_path: /lovelace/timers
```

#### `url`
Opens a URL in a new tab.
```yaml
tap_action:
  action: url
  url_path: https://example.com
```

#### `none`
Disables the action (default if not specified).
```yaml
tap_action:
  action: none
```

## Configuration Examples

### Basic Timer Control
```yaml
type: custom:timeflow-card-beta
target_date: '2025-12-31T23:59:59'
title: 'New Year Countdown'
tap_action:
  action: more-info
  entity: timer.countdown_timer
hold_action:
  action: call-service
  service: timer.start
  target:
    entity_id: timer.countdown_timer
  data:
    duration: '01:00:00'
```

### Navigation Actions
```yaml
type: custom:timeflow-card-beta
timer_entity: timer.cooking_timer
title: 'Cooking Timer'
tap_action:
  action: navigate
  navigation_path: /lovelace/kitchen
double_tap_action:
  action: call-service
  service: timer.cancel
  target:
    entity_id: timer.cooking_timer
```

### Multiple Entity Control
```yaml
type: custom:timeflow-card-beta
auto_discover_alexa: true
title: 'Alexa Timers'
tap_action:
  action: more-info
  entity: sensor.alexa_timers
hold_action:
  action: call-service
  service: media_player.volume_set
  target:
    entity_id: media_player.kitchen_echo
  data:
    volume_level: 0.5
```

### Advanced Service Call with Confirmation
```yaml
type: custom:timeflow-card-beta
target_date: '{{ states("input_datetime.event_time") }}'
title: 'Event Countdown'
tap_action:
  action: call-service
  service: script.start_event_sequence
  confirmation:
    text: 'Are you sure you want to start the event sequence?'
  haptic: light
```

## Additional Options

### Haptic Feedback
Add haptic feedback on mobile devices:
```yaml
tap_action:
  action: toggle
  entity: switch.example
  haptic: light  # success, warning, failure, light, medium, heavy, selection
```

### Confirmation Dialog
Require user confirmation before executing action:
```yaml
hold_action:
  action: call-service
  service: script.dangerous_action
  confirmation: true
  # Or with custom text:
  confirmation:
    text: 'This will reset all timers. Continue?'
```

### Service Data vs Target
Use `data` for backward compatibility or `target` for modern service calls:
```yaml
# Modern approach (recommended)
tap_action:
  action: call-service
  service: light.turn_on
  target:
    entity_id: light.living_room
  data:
    brightness: 255
    color_name: blue

# Legacy approach (still supported)
tap_action:
  action: call-service
  service: light.turn_on
  service_data:
    entity_id: light.living_room
    brightness: 255
```

## Visual Feedback

When actions are configured, the card will automatically:
- Show a pointer cursor on hover
- Add subtle hover effects (slight elevation and shadow)
- Provide smooth press feedback
- Support proper touch interactions on mobile devices

## Notes

- Actions are only processed when Home Assistant (`hass`) is available
- Invalid action configurations are silently ignored
- The card maintains the same visual appearance whether actions are configured or not
- All actions are handled by Home Assistant's built-in action system for consistency and security
