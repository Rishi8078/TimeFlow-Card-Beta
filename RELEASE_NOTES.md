# TimeFlow Card v3.2

## New Features

### Two New Card Styles: Eventy & Classic Compact
<img width="2541" height="977" alt="new" src="https://github.com/user-attachments/assets/f025b881-65d1-4306-8714-a1ea907f091a" />
TimeFlow now offers three distinct visual styles to match your dashboard aesthetic:

#### Eventy Style (`style: eventy`)
A sleek, compact horizontal layout that puts the focus on a single prominent countdown unit. Perfect for event countdowns and minimal dashboards.

> 💡 *Inspired by [u/musicjock's dashboard](https://www.reddit.com/user/musicjock/) on Reddit*

```yaml
type: custom:timeflow-card
title: "Summer Vacation"
subtitle: "Tue, Jul 15"
target_date: "2026-07-15T00:00:00"
style: eventy
header_icon: mdi:beach
header_icon_color: "#3b82f6"
header_icon_background: "rgba(59, 130, 246, 0.2)"
```

#### Classic Compact Style (`style: classic-compact`)
A horizontal layout that combines the best of both worlds—compact size with a progress circle indicator.

```yaml
type: custom:timeflow-card
title: "Project Deadline"
target_date: "2026-02-28T17:00:00"
style: classic-compact
header_icon: mdi:briefcase
progress_color: "#ef4444"
```

#### Classic Style (`style: classic`) - Default
The original vertical layout with full progress circle. No configuration needed—this remains the default.

---

### Header Icons: Add Visual Identity to Your Cards

All card styles now support customizable header icons with full color control:

* **header_icon:** MDI icon name (e.g., `mdi:cake-variant`, `mdi:airplane-takeoff`)
* **header_icon_color:** Icon color (hex, rgb, or CSS variable)
* **header_icon_background:** Background color for the icon container

Example with icon styling:

```yaml
type: custom:timeflow-card
title: "Birthday Party"
target_date: "2026-03-15T18:00:00"
header_icon: mdi:cake-variant
header_icon_color: "#ec4899"
header_icon_background: "rgba(236, 72, 153, 0.15)"
```

> **Tip:** For a cohesive look, use a semi-transparent version of your icon color as the background (e.g., `rgba(236, 72, 153, 0.15)`).

---

## Bug Fixes

### Fixed: "Starting..." Display Issue (#33)

Previously, when a countdown had just begun or when all time units were disabled except one that hadn't started counting, the card would display "Starting..." instead of useful information.

**Now fixed:** The card automatically falls back to the highest available time unit instead of showing "Starting...". This ensures you always see meaningful countdown information.


---

## Notes

* **Breaking Changes:** None
* **Browser Cache:** Clear your browser cache after updating to ensure new styles load correctly
* **Compatibility:** All existing configurations continue to work unchanged

---


