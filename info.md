# TimeFlow Card

A beautiful countdown timer card for Home Assistant with animated progress circle, intelligent time formatting, and modern modular architecture.

## Features
- **🏗️ Modular Architecture**: Clean, maintainable code with focused components
- **🎨 Template Support**: Dynamic values for all configuration properties  
- **⚡ Performance Optimized**: Efficient rendering with caching and smart updates
- **🎯 Smart Time Display**: Natural language formatting with unit cascading
- **🔄 Animated Progress**: SVG progress circle with dynamic scaling
- **🎨 Customizable Styling**: Colors, sizes, time units, and Card-mod support
- **📱 Responsive Design**: Automatic sizing and mobile-friendly layouts
- **♿ Accessibility**: Screen reader support and keyboard navigation
- **🌐 Cross-Platform**: Robust date parsing across all browsers

## Quick Start
1. Install through HACS
2. Add to your dashboard with type: `custom:timeflow-card`
3. Set your target date in ISO format: `"2025-12-31T23:59:59"`
4. Use templates for dynamic values: `"{{ states.sensor.event_date.state }}"`
5. Customize time units and appearance
6. Optionally set creation_date for progress tracking

See the full README for detailed configuration options and examples.
