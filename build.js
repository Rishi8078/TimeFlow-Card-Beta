#!/usr/bin/env node

/**
 * Build script for TimeFlow Card - Self-Contained Bundle with Lit 3.x
 * Bundles all modules including Lit into a single self-contained file
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const distFile = path.join(__dirname, 'timeflow-card-modular.js');

/**
 * Minimal Lit 3.x implementation for bundling
 * Based on essential Lit functionality needed for TimeFlow Card
 */
function getLitBundle() {
  return `
/**
 * Minimal Lit 3.x Bundle - Essential functionality for TimeFlow Card
 * Based on lit-element 3.x but simplified for Home Assistant custom cards
 */

// Lit Template Result and HTML template implementation
class TemplateResult {
  constructor(strings, values, type, processor) {
    this.strings = strings;
    this.values = values;
    this.type = type;
    this.processor = processor;
  }
}

// Simple template processor
const defaultTemplateProcessor = {
  handleAttributeExpressions: (element, name, strings, values) => values,
  handleTextExpression: (options) => options
};

// HTML template tag function
const html = (strings, ...values) => new TemplateResult(strings, values, 'html', defaultTemplateProcessor);

// CSS template tag function  
const css = (strings, ...values) => {
  const cssText = strings.reduce((acc, str, i) => {
    return acc + str + (values[i] || '');
  }, '');
  return { cssText, toString: () => cssText };
};

// Nothing placeholder
const nothing = '';

// Simple reactive property system
const updateProperty = (instance, key, oldValue, newValue) => {
  if (oldValue !== newValue) {
    instance.requestUpdate(key, oldValue);
  }
};

// Property decorator
const property = (options = {}) => {
  return (target, propertyKey) => {
    const privateKey = \`_\${propertyKey}\`;
    
    if (delete target[propertyKey]) {
      Object.defineProperty(target, propertyKey, {
        get() { return this[privateKey]; },
        set(value) {
          const oldValue = this[privateKey];
          this[privateKey] = value;
          updateProperty(this, propertyKey, oldValue, value);
        },
        enumerable: true,
        configurable: true
      });
    }
  };
};

// State decorator (same as property but internal)
const state = () => property();

// Base LitElement class
class LitElement extends HTMLElement {
  constructor() {
    super();
    this._updateScheduled = false;
    this._changedProperties = new Map();
    this.attachShadow({ mode: 'open' });
  }

  static get styles() {
    return \`\`;
  }

  connectedCallback() {
    this.requestUpdate();
  }

  requestUpdate(name, oldValue) {
    if (name) {
      this._changedProperties.set(name, oldValue);
    }
    
    if (!this._updateScheduled) {
      this._updateScheduled = true;
      Promise.resolve().then(() => {
        this._updateScheduled = false;
        this.performUpdate();
      });
    }
  }

  performUpdate() {
    const styles = this.constructor.styles;
    if (styles && typeof styles === 'object' && styles.cssText) {
      if (!this.shadowRoot.querySelector('style')) {
        const styleEl = document.createElement('style');
        styleEl.textContent = styles.cssText;
        this.shadowRoot.appendChild(styleEl);
      }
    }

    const result = this.render();
    if (result) {
      this.shadowRoot.innerHTML = this.shadowRoot.querySelector('style') ? 
        this.shadowRoot.querySelector('style').outerHTML + this._renderTemplate(result) :
        this._renderTemplate(result);
    }
    
    this.updated(this._changedProperties);
    this._changedProperties.clear();
  }

  _renderTemplate(result) {
    if (result instanceof TemplateResult) {
      return result.strings.reduce((acc, str, i) => {
        const value = result.values[i];
        if (value === nothing || value === undefined || value === null) {
          return acc + str;
        }
        return acc + str + this._renderValue(value);
      }, '');
    }
    return String(result || '');
  }

  _renderValue(value) {
    if (value instanceof TemplateResult) {
      return this._renderTemplate(value);
    }
    if (typeof value === 'function') {
      return this._renderValue(value());
    }
    if (value === nothing || value === undefined || value === null) {
      return '';
    }
    return String(value);
  }

  render() {
    return html\`\`;
  }

  updated(changedProperties) {
    // Override in subclasses
  }

  firstUpdated(changedProperties) {
    // Override in subclasses
  }
}

// Export the Lit functionality
window.LitElement = LitElement;
window.html = html;
window.css = css;
window.property = property;
window.state = state;
window.nothing = nothing;

`;
}

/**
 * Resolves ES6 imports and bundles files with embedded Lit
 */
function bundleFiles() {
  const processedFiles = new Set();
  const processedContent = new Map();
  
  function processFile(filePath) {
    if (processedFiles.has(filePath)) {
      return processedContent.get(filePath) || '';
    }
    
    processedFiles.add(filePath);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`Warning: File not found: ${filePath}`);
      processedContent.set(filePath, '');
      return '';
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // First, process all imports recursively to get dependencies
    const importRegex = /import\s+(\{[^}]+\}|\w+|\*\s+as\s+\w+)\s+from\s+['"]([^'"]+)['"];?\s*/g;
    let match;
    let dependencyContent = '';
    
    while ((match = importRegex.exec(originalContent)) !== null) {
      const importPath = match[2];
      
      // Skip external imports like 'lit'
      if (!importPath.startsWith('./') && !importPath.startsWith('../')) {
        continue;
      }
      
      // Handle relative imports (internal modules)
      let resolvedPath;
      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        resolvedPath = path.resolve(path.dirname(filePath), importPath);
        if (!resolvedPath.endsWith('.js')) {
          resolvedPath += '.js';
        }
      }
      
      // Process the imported file recursively
      const importedContent = processFile(resolvedPath);
      dependencyContent += importedContent + '\n';
    }
    
    // Remove all import statements since we're bundling everything
    content = content.replace(/import\s+(\{[^}]+\}|\w+|\*\s+as\s+\w+)\s+from\s+['"][^'"]+['"];?\s*/g, '');
    
    // Remove export statements and convert to regular declarations
    content = content.replace(/export\s+class\s+/g, 'class ');
    content = content.replace(/export\s+\{[^}]+\};\s*$/gm, '');
    content = content.replace(/export\s+default\s+/g, '');
    
    const finalContent = dependencyContent + content;
    processedContent.set(filePath, finalContent);
    return finalContent;
  }
  
  // Start with the entry point
  const entryPoint = path.join(srcDir, 'index.js');
  const bundledContent = processFile(entryPoint);
  
  // Prepend the Lit bundle
  const litBundle = getLitBundle();
  
  return litBundle + '\n' + bundledContent;
}

/**
 * Main build function
 */
function build() {
  console.log('🏗️  Building TimeFlow Card with embedded Lit 3.x...');
  
  try {
    const bundledContent = bundleFiles();
    
    // Add header comment
    const header = `/**
 * TimeFlow Card - Self-Contained Bundle with Lit 3.x
 * Generated: ${new Date().toISOString()}
 * 
 * This bundle includes all components and dependencies:
 * - TimeFlowCardBeta (Main card component using LitElement) 
 * - ProgressCircleBeta (Progress circle component using LitElement)
 * - TemplateService (Template evaluation)
 * - CountdownService (Countdown logic)
 * - DateParser (Date parsing utilities)
 * - ConfigValidator (Configuration validation)
 * - StyleManager (Style management)
 * - Lit 3.x framework (embedded minimal implementation)
 * 
 * No external dependencies required.
 */

`;
    
    const finalContent = header + bundledContent;
    
    fs.writeFileSync(distFile, finalContent, 'utf8');
    console.log('✅ Bundle created:', distFile);
    console.log('📦 Size:', (fs.statSync(distFile).size / 1024).toFixed(2), 'KB');
    console.log('🔗 Self-contained - no external dependencies required');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

/**
 * Watches for changes during development
 */
function watchFiles() {
  console.log('👀 Watching for changes...');
  
  function watchDir(dir) {
    fs.watch(dir, { recursive: true }, (eventType, filename) => {
      if (filename && filename.endsWith('.js')) {
        const filePath = path.join(dir, filename);
        if (fs.existsSync(filePath)) {
          console.log('📝 Changed:', filename);
          setTimeout(build, 100); // Debounce
        }
      }
    });
  }
  
  watchDir(srcDir);
  build(); // Initial build
}

// Main execution
if (require.main === module) {
  const isWatchMode = process.argv.includes('--watch');
  
  if (isWatchMode) {
    watchFiles();
  } else {
    build();
  }
}

module.exports = { bundleFiles, build };
