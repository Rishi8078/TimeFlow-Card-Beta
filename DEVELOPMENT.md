# TimeFlow Card - Development Guide

## 🏗️ Modular Architecture

TimeFlow Card uses a modern modular architecture for better maintainability, testability, and performance.

### 📁 Project Structure

```
src/
├── index.js                    # Entry point and module exports
├── components/                 # UI Components
│   ├── TimeFlowCard.js        # Main card orchestrator
│   └── ProgressCircle.js      # Animated progress circle
├── services/                   # Business Logic
│   ├── TemplateService.js     # Template evaluation
│   └── CountdownService.js    # Time calculations
└── utils/                     # Utilities
    ├── DateParser.js          # Cross-platform date parsing
    ├── ConfigValidator.js     # Input validation
    ├── StyleManager.js        # Style processing
    └── AccessibilityManager.js # A11y features
```

### 🛠️ Build System

The project uses a custom ES6 module bundler (`build.js`) that:
- Resolves ES6 imports between modules
- Combines all modules into a single file
- Removes module exports for browser compatibility
- Preserves class structures and functionality
- Generates the final `timeflow-card-modular.js`

### 📦 Available Scripts

```bash
# Build the project
npm run build

# Build with file watching
npm run build:watch

# Run all tests
npm test

# Run specific test suites
npm run test:structure    # Structural tests
npm run test:integration  # Integration tests
npm run test:visual      # Visual browser tests

# Release workflow
npm run release
```

### 🧪 Testing

The project includes comprehensive testing:

1. **Structural Tests** (`test-modular.js`): File structure, module integrity, bundle content
2. **Integration Tests** (`test-integration.js`): Component loading, instantiation, configuration
3. **Visual Tests** (`test-modular-build.html`): Browser-based UI testing

### 🎯 Module Responsibilities

#### TimeFlowCard (Main Component)
- Orchestrates all other modules
- Manages DOM rendering and updates
- Handles Home Assistant integration
- Coordinates accessibility features

#### ProgressCircle (UI Component)
- Renders animated SVG progress circle
- Handles attribute changes and validation
- Provides keyboard navigation
- Maintains accessibility features

#### TemplateService (Business Logic)
- Evaluates Home Assistant templates
- Manages template caching
- Handles fallback values
- Provides XSS protection

#### CountdownService (Business Logic)
- Calculates time differences
- Handles unit cascading logic
- Manages countdown states
- Provides progress calculations

#### DateParser (Utility)
- Cross-platform date parsing
- Timezone handling
- Validation and error handling
- Fallback mechanisms

#### ConfigValidator (Utility)
- Input validation and sanitization
- XSS prevention
- Type checking
- Error reporting

#### StyleManager (Utility)
- CSS style processing
- Card-mod integration
- Dynamic sizing calculations
- Theme support

#### AccessibilityManager (Utility)
- Screen reader support
- Keyboard navigation
- ARIA attributes
- Live region announcements

### 🔄 Development Workflow

1. **Make Changes**: Edit modules in `src/` directory
2. **Build**: Run `npm run build` to generate the bundle
3. **Test**: Run `npm test` to verify functionality
4. **Visual Test**: Open `test-modular-build.html` in browser
5. **Commit**: Commit changes with descriptive messages

### 🐛 Debugging

- Use browser DevTools to inspect the bundled code
- Check console for validation warnings
- Test individual modules in isolation
- Use the visual test interface for UI debugging

### 📏 Code Standards

- ES6+ syntax with modern JavaScript features
- Single responsibility principle for modules
- Comprehensive error handling
- Performance optimizations (caching, RAF)
- Accessibility-first design
- Security considerations (XSS prevention)

### 🚀 Performance Features

- **Template Caching**: Reduces redundant API calls
- **DOM Caching**: Prevents unnecessary queries
- **RAF Scheduling**: Smooth animations and updates
- **Dependency Injection**: Efficient module loading
- **Lazy Evaluation**: On-demand calculations
