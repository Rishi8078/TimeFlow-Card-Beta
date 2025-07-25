/**
 * TimeFlow Card - Self-Contained Bundle with Lit 3.x
 * Generated: 2025-07-25T21:07:13.225Z
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
    const privateKey = `_${propertyKey}`;
    
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
    return ``;
  }

  connectedCallback() {
    this.requestUpdate();
  }

  disconnectedCallback() {
    // Override in subclasses for cleanup
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // Convert kebab-case to camelCase
    const propName = name.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
    if (this[propName] !== undefined) {
      // Try to parse the value appropriately
      let parsedValue = newValue;
      if (newValue === 'true') parsedValue = true;
      else if (newValue === 'false') parsedValue = false;
      else if (!isNaN(newValue) && newValue !== '') parsedValue = Number(newValue);
      
      this[propName] = parsedValue;
    }
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
    return html``;
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


/**
 * DateParser - Enhanced date parsing utility with three-tier fallback system
 * Handles cross-browser compatibility and edge cases for date string parsing
 */
class DateParser {
  /**
   * Main entry point for date parsing with hybrid approach
   * @param {string} dateString - ISO date string to parse
   * @returns {number} - Unix timestamp in milliseconds
   */
  static parseISODate(dateString) {
    try {
      // Fast path: Use native parsing for most cases
      const nativeResult = new Date(dateString);
      if (!isNaN(nativeResult.getTime()) && this.isValidDateResult(nativeResult, dateString)) {
        return nativeResult.getTime();
      }
      
      // Enhanced path: Use robust parsing for edge cases
      return this.parseISODateRobust(dateString);
    } catch (e) {
      console.warn('TimeFlow Card: Date parsing error, using fallback:', e);
      return this.parseISODateFallback(dateString);
    }
  }

  /**
   * Validates that a parsed date result is reasonable
   * @param {Date} dateObj - Parsed date object
   * @param {string} originalString - Original date string
   * @returns {boolean} - Whether the date is valid
   */
  static isValidDateResult(dateObj, originalString) {
    const timestamp = dateObj.getTime();
    
    // Check for reasonable date range (1970-2100)
    const minTimestamp = new Date('1970-01-01').getTime();
    const maxTimestamp = new Date('2100-12-31').getTime();
    
    if (timestamp < minTimestamp || timestamp > maxTimestamp) {
      return false;
    }
    
    // Check for February 29th in non-leap years
    if (typeof originalString === 'string' && originalString.includes('02-29')) {
      const year = dateObj.getFullYear();
      if (!this.isLeapYear(year)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Check if a year is a leap year
   * @param {number} year - Year to check
   * @returns {boolean} - Whether the year is a leap year
   */
  static isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  /**
   * Robust date parsing using Intl.DateTimeFormat for edge cases
   * @param {string} dateString - Date string to parse
   * @returns {number} - Unix timestamp
   */
  static parseISODateRobust(dateString) {
    try {
      // Check for Intl support
      if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
        return this.parseWithIntl(dateString);
      }
      
      // Fallback to enhanced manual parsing
      return this.parseISODateManual(dateString);
    } catch (error) {
      console.warn('TimeFlow Card: Robust parsing failed, using manual fallback:', error);
      return this.parseISODateManual(dateString);
    }
  }

  /**
   * Parse date using Intl.DateTimeFormat for maximum compatibility
   * @param {string} dateString - Date string to parse
   * @returns {number} - Unix timestamp
   */
  static parseWithIntl(dateString) {
    try {
      // First try to parse normally to get a base date
      const baseDate = new Date(dateString);
      if (isNaN(baseDate.getTime())) {
        throw new Error('Base date parsing failed');
      }
      
      // Use Intl to format and re-parse for consistency
      const formatter = new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'UTC'
      });
      
      const parts = formatter.formatToParts(baseDate);
      const partsObj = {};
      parts.forEach(part => {
        if (part.type !== 'literal') {
          partsObj[part.type] = part.value;
        }
      });
      
      // Construct date from parsed parts for consistency
      const reconstructed = new Date(
        partsObj.year || 1970,
        (partsObj.month || 1) - 1,
        partsObj.day || 1,
        partsObj.hour || 0,
        partsObj.minute || 0,
        partsObj.second || 0
      );
      
      return reconstructed.getTime();
    } catch (error) {
      // If Intl parsing fails, fall back to manual parsing
      throw error;
    }
  }

  /**
   * Enhanced manual parsing with better error handling
   * @param {string} dateString - Date string to parse
   * @returns {number} - Unix timestamp
   */
  static parseISODateManual(dateString) {
    if (typeof dateString === 'string' && dateString.includes('T')) {
      // Check if the string contains timezone information (Z, +XX:XX, -XX:XX)
      const hasTimezone = /[+-]\d{2}:\d{2}$|Z$/.test(dateString);
      
      if (hasTimezone) {
        // For ISO strings with timezone info, use native Date parsing to preserve timezone
        return new Date(dateString).getTime();
      } else {
        // For timezone-less ISO strings, use manual parsing for cross-platform consistency
        const [datePart, timePart] = dateString.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        
        // Validate date components
        if (!this.isValidDateComponents(year, month, day)) {
          throw new Error('Invalid date components');
        }
        
        if (timePart && timePart.includes(':')) {
          const [hour, minute, second] = timePart.split(':').map(parseFloat);
          
          // Validate time components
          if (!this.isValidTimeComponents(hour, minute, second)) {
            throw new Error('Invalid time components');
          }
          
          return new Date(year, month - 1, day, hour, minute, second || 0).getTime();
        } else {
          return new Date(year, month - 1, day).getTime();
        }
      }
    } else {
      // Fallback to regular parsing for other formats
      return new Date(dateString).getTime();
    }
  }

  /**
   * Validates date components
   * @param {number} year - Year component
   * @param {number} month - Month component (1-12)
   * @param {number} day - Day component
   * @returns {boolean} - Whether components are valid
   */
  static isValidDateComponents(year, month, day) {
    if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
    if (year < 1970 || year > 2100) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    
    // Check days in month
    const daysInMonth = [31, this.isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (day > daysInMonth[month - 1]) return false;
    
    return true;
  }

  /**
   * Validates time components
   * @param {number} hour - Hour component
   * @param {number} minute - Minute component
   * @param {number} second - Second component
   * @returns {boolean} - Whether components are valid
   */
  static isValidTimeComponents(hour, minute, second) {
    const h = parseInt(hour);
    const m = parseInt(minute);
    const s = parseInt(second);
    
    if (isNaN(h) || isNaN(m) || isNaN(s)) return false;
    if (h < 0 || h > 23) return false;
    if (m < 0 || m > 59) return false;
    if (s < 0 || s > 59) return false;
    
    return true;
  }

  /**
   * Final fallback parsing method
   * @param {string} dateString - Date string to parse
   * @returns {number} - Unix timestamp
   */
  static parseISODateFallback(dateString) {
    try {
      const timestamp = Date.parse(dateString);
      if (!isNaN(timestamp)) {
        return timestamp;
      }
      
      // Last resort: return current time with warning
      console.warn('TimeFlow Card: Could not parse date, using current time as fallback:', dateString);
      return Date.now();
    } catch (error) {
      console.error('TimeFlow Card: All date parsing methods failed:', error);
      return Date.now();
    }
  }
}

/**
 * ConfigValidator - Comprehensive input validation for TimeFlow Card configuration
 * Ensures security, type safety, and data integrity
 */
class ConfigValidator {
  /**
   * Comprehensive input validation for configuration
   * @param {Object} config - Configuration object to validate
   * @throws {Error} - If validation fails
   */
  static validateConfig(config) {
    const errors = [];
    
    // Validate target_date
    if (config.target_date) {
      if (!this.isValidDateInput(config.target_date)) {
        errors.push('Invalid target_date format. Use ISO date string, entity ID, or template.');
      }
    }
    
    // Validate creation_date if provided
    if (config.creation_date && !this.isValidDateInput(config.creation_date)) {
      errors.push('Invalid creation_date format. Use ISO date string, entity ID, or template.');
    }
    
    // Validate colors
    const colorFields = ['color', 'background_color', 'progress_color'];
    colorFields.forEach(field => {
      if (config[field] && !this.isValidColorInput(config[field])) {
        errors.push(`Invalid ${field} format. Use hex, rgb, hsl, CSS color name, entity ID, or template.`);
      }
    });
    
    // Validate dimensions
    const dimensionFields = ['width', 'height', 'icon_size'];
    dimensionFields.forEach(field => {
      if (config[field] && !this.isValidDimensionInput(config[field])) {
        errors.push(`Invalid ${field} format. Use pixel values, percentages, or CSS units.`);
      }
    });
    
    // Validate aspect_ratio
    if (config.aspect_ratio && !this.isValidAspectRatioInput(config.aspect_ratio)) {
      errors.push('Invalid aspect_ratio format. Use format like "16/9" or "4/3".');
    }
    
    // Validate stroke_width
    if (config.stroke_width !== undefined && !this.isValidNumberInput(config.stroke_width, 1, 50)) {
      errors.push('Invalid stroke_width. Must be a number between 1 and 50.');
    }
    
    // Validate boolean fields
    const booleanFields = ['show_months', 'show_days', 'show_hours', 'show_minutes', 'show_seconds', 'expired_animation'];
    booleanFields.forEach(field => {
      if (config[field] !== undefined && !this.isValidBooleanInput(config[field])) {
        errors.push(`Invalid ${field}. Must be true or false.`);
      }
    });
    
    // Validate text fields for XSS prevention
    const textFields = ['title', 'subtitle', 'expired_text'];
    textFields.forEach(field => {
      if (config[field] && !this.isValidTextInput(config[field])) {
        errors.push(`Invalid ${field}. Contains potentially unsafe content.`);
      }
    });
    
    // Validate styles object
    if (config.styles && !this.isValidStylesInput(config.styles)) {
      errors.push('Invalid styles object. Must contain valid style arrays for card, title, subtitle, or progress_circle.');
    }
    
    // Throw error if validation fails
    if (errors.length > 0) {
      throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }
  }
  
  /**
   * Validates date input (string, entity, or template)
   * @param {*} value - Value to validate
   * @returns {boolean} - Whether the value is valid
   */
  static isValidDateInput(value) {
    if (!value) return false;
    
    // Allow templates
    if (this.isTemplate(value)) return true;
    
    // Allow entity IDs
    if (typeof value === 'string' && value.includes('.')) return true;
    
    // Validate date string format
    if (typeof value === 'string') {
      try {
        const date = new Date(value);
        return !isNaN(date.getTime());
      } catch (e) {
        return false;
      }
    }
    
    return false;
  }
  
  /**
   * Validates color input (color value, entity, or template)
   * @param {*} value - Value to validate
   * @returns {boolean} - Whether the value is valid
   */
  static isValidColorInput(value) {
    if (!value) return false;
    
    // Allow templates and entities
    if (this.isTemplate(value) || (typeof value === 'string' && value.includes('.'))) return true;
    
    if (typeof value !== 'string') return false;
    
    // Check hex colors
    if (/^#([0-9A-F]{3}){1,2}$/i.test(value)) return true;
    
    // Check rgb/rgba
    if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/i.test(value)) return true;
    
    // Check hsl/hsla
    if (/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+\s*)?\)$/i.test(value)) return true;
    
    // Check CSS color names (expanded list)
    const cssColors = [
      'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'gray', 'grey',
      'cyan', 'magenta', 'lime', 'maroon', 'navy', 'olive', 'teal', 'silver', 'gold', 'indigo', 'violet',
      'transparent', 'currentColor', 'inherit', 'initial', 'unset'
    ];
    
    return cssColors.includes(value.toLowerCase());
  }
  
  /**
   * Validates dimension input (dimension value, entity, or template)
   * @param {*} value - Value to validate
   * @returns {boolean} - Whether the value is valid
   */
  static isValidDimensionInput(value) {
    if (!value) return false;
    
    // Allow templates and entities
    if (this.isTemplate(value) || (typeof value === 'string' && value.includes('.'))) return true;
    
    // Allow numbers
    if (typeof value === 'number') return true;
    
    if (typeof value !== 'string') return false;
    
    // Check pixel values (0-10000px)
    const pxMatch = value.match(/^(\d+(?:\.\d+)?)px$/i);
    if (pxMatch) {
      const px = parseFloat(pxMatch[1]);
      return px >= 0 && px <= 10000;
    }
    
    // Check percentage values (0-1000%)
    const percentMatch = value.match(/^(\d+(?:\.\d+)?)%$/i);
    if (percentMatch) {
      const percent = parseFloat(percentMatch[1]);
      return percent >= 0 && percent <= 1000;
    }
    
    // Check other valid CSS units
    const validUnits = ['em', 'rem', 'vh', 'vw', 'vmin', 'vmax', 'ch', 'ex'];
    for (const unit of validUnits) {
      const regex = new RegExp(`^(\\d+(?:\\.\\d+)?)${unit}$`, 'i');
      const match = value.match(regex);
      if (match) {
        const unitValue = parseFloat(match[1]);
        return unitValue >= 0 && unitValue <= 1000; // Reasonable bounds
      }
    }
    
    // Check for 'auto', 'fit-content', etc.
    const validKeywords = ['auto', 'fit-content', 'min-content', 'max-content'];
    return validKeywords.includes(value.toLowerCase());
  }
  
  /**
   * Validates aspect ratio input
   * @param {*} value - Value to validate
   * @returns {boolean} - Whether the value is valid
   */
  static isValidAspectRatioInput(value) {
    if (!value) return false;
    
    // Allow templates and entities
    if (this.isTemplate(value) || (typeof value === 'string' && value.includes('.'))) return true;
    
    if (typeof value !== 'string') return false;
    
    // Check aspect ratio format: number/number
    const aspectMatch = value.match(/^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
    if (aspectMatch) {
      const width = parseFloat(aspectMatch[1]);
      const height = parseFloat(aspectMatch[2]);
      return width > 0 && height > 0 && width <= 20 && height <= 20; // Reasonable bounds
    }
    
    return false;
  }
  
  /**
   * Validates number input with optional bounds
   * @param {*} value - Value to validate
   * @param {number} min - Minimum allowed value
   * @param {number} max - Maximum allowed value
   * @returns {boolean} - Whether the value is valid
   */
  static isValidNumberInput(value, min = -Infinity, max = Infinity) {
    if (value === undefined || value === null) return false;
    
    // Allow templates and entities
    if (typeof value === 'string') {
      if (this.isTemplate(value) || value.includes('.')) return true;
      // Try to parse string numbers
      const parsed = parseFloat(value);
      return !isNaN(parsed) && parsed >= min && parsed <= max;
    }
    
    return typeof value === 'number' && !isNaN(value) && value >= min && value <= max;
  }
  
  /**
   * Validates boolean input
   * @param {*} value - Value to validate
   * @returns {boolean} - Whether the value is valid
   */
  static isValidBooleanInput(value) {
    return typeof value === 'boolean';
  }
  
  /**
   * Validates text input for XSS prevention
   * @param {*} value - Value to validate
   * @returns {boolean} - Whether the value is valid
   */
  static isValidTextInput(value) {
    if (!value) return true;
    
    // Allow templates and entities
    if (this.isTemplate(value) || (typeof value === 'string' && value.includes('.'))) return true;
    
    if (typeof value !== 'string') return false;
    
    // Check for potentially dangerous content
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /on\w+\s*=/i, // Event handlers like onclick=
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /<form/i
    ];
    
    return !dangerousPatterns.some(pattern => pattern.test(value));
  }
  
  /**
   * Validates styles object structure
   * @param {*} styles - Styles object to validate
   * @returns {boolean} - Whether the styles are valid
   */
  static isValidStylesInput(styles) {
    if (!styles || typeof styles !== 'object') return false;
    
    const validStyleKeys = ['card', 'title', 'subtitle', 'progress_circle'];
    
    // Check that all keys are valid
    const styleKeys = Object.keys(styles);
    if (!styleKeys.every(key => validStyleKeys.includes(key))) return false;
    
    // Check that all values are arrays
    return styleKeys.every(key => Array.isArray(styles[key]));
  }

  /**
   * Detects if a value contains Home Assistant templates
   * @param {*} value - Value to check
   * @returns {boolean} - Whether the value is a template
   */
  static isTemplate(value) {
    return typeof value === 'string' && 
           value.includes('{{') && 
           value.includes('}}');
  }
}

/**
 * TemplateService - Handles Home Assistant template evaluation and caching
 * Provides efficient template processing with intelligent caching
 */
class TemplateService {
  constructor() {
    this.templateResults = new Map();
    this.templateCacheLimit = 100;
  }

  /**
   * Evaluates a Home Assistant template using the correct API
   * @param {string} template - Template string to evaluate
   * @param {Object} hass - Home Assistant object
   * @returns {Promise<*>} - Evaluated template result
   */
  async evaluateTemplate(template, hass) {
    if (!hass || !template) {
      return template;
    }

    // Check cache first
    const cacheKey = template;
    if (this.templateResults.has(cacheKey)) {
      const cached = this.templateResults.get(cacheKey);
      // Check if cache is still valid (within 5 seconds)
      if (Date.now() - cached.timestamp < 5000) {
        return cached.result;
      }
    }

    try {
      // Validate template format before making API call
      if (!this.isValidTemplate(template)) {
        throw new Error('Invalid template format');
      }

      // Use callApi method like card-tools and button-card for HA templates
      const result = await hass.callApi('POST', 'template', { 
        template: template 
      });
      
      // Check if the template evaluation succeeded but returned 'unknown'
      if (result === 'unknown' || result === 'unavailable' || result === '' || result === null) {
        // Try to extract fallback from the template itself
        const fallback = this.extractFallbackFromTemplate(template);
        if (fallback && fallback !== template) {
          // Cache the fallback result
          this.templateResults.set(cacheKey, {
            result: fallback,
            timestamp: Date.now()
          });
          
          // Enforce cache size limits
          this.enforceTemplateCacheLimit();
          
          return fallback;
        }
      }
      
      // Cache the result
      this.templateResults.set(cacheKey, {
        result: result,
        timestamp: Date.now()
      });
      
      // Enforce cache size limits
      this.enforceTemplateCacheLimit();
      
      return result;
    } catch (error) {
      console.warn('TimeFlow Card: Template evaluation failed, using fallback:', error.message);
      
      // Immediately return fallback instead of trying callWS
      const fallback = this.extractFallbackFromTemplate(template);
      
      // Cache the fallback to prevent repeated failed calls
      this.templateResults.set(cacheKey, {
        result: fallback,
        timestamp: Date.now()
      });
      
      this.enforceTemplateCacheLimit();
      return fallback;
    }
  }

  /**
   * Extracts fallback value from template expressions with 'or' operator
   * @param {string} template - Template string
   * @returns {string} - Extracted fallback value
   */
  extractFallbackFromTemplate(template) {
    if (!template || typeof template !== 'string') {
      return template;
    }

    try {
      // Remove the outer {{ }} to work with the inner expression
      const innerTemplate = template.replace(/^\{\{\s*/, '').replace(/\s*\}\}$/, '').trim();
      
      // Look for patterns like "states('entity') or 'fallback'"
      const simpleOrPattern = /^(.+?)\s+or\s+['"`]([^'"`]+)['"`]$/;
      const simpleOrMatch = innerTemplate.match(simpleOrPattern);
      
      if (simpleOrMatch && simpleOrMatch[2]) {
        return simpleOrMatch[2];
      }

      // Look for chained or patterns like "states('entity1') or states('entity2') or 'fallback'"
      const chainedOrPattern = /^(.+?)\s+or\s+(.+?)\s+or\s+['"`]([^'"`]+)['"`]$/;
      const chainedMatch = innerTemplate.match(chainedOrPattern);
      
      if (chainedMatch && chainedMatch[3]) {
        return chainedMatch[3];
      }

      // Look for conditional patterns like "'value' if condition else 'fallback'"
      const conditionalPattern = /^['"`]([^'"`]+)['"`]\s+if\s+(.+?)\s+else\s+['"`]([^'"`]+)['"`]$/;
      const conditionalMatch = innerTemplate.match(conditionalPattern);
      
      if (conditionalMatch && conditionalMatch[3]) {
        return conditionalMatch[3];
      }

      // Look for reverse conditional patterns like "condition if test else 'fallback'"
      const reverseConditionalPattern = /^(.+?)\s+if\s+(.+?)\s+else\s+['"`]([^'"`]+)['"`]$/;
      const reverseMatch = innerTemplate.match(reverseConditionalPattern);
      
      if (reverseMatch && reverseMatch[3]) {
        return reverseMatch[3];
      }

      // If no fallback pattern found, return a helpful message
      return 'Unavailable';
    } catch (error) {
      console.warn('TimeFlow Card: Error extracting fallback from template:', error);
      return 'Template Error';
    }
  }

  /**
   * Detects if a value contains Home Assistant templates
   * @param {*} value - Value to check
   * @returns {boolean} - Whether the value is a template
   */
  isTemplate(value) {
    return typeof value === 'string' && 
           value.includes('{{') && 
           value.includes('}}');
  }

  /**
   * Validates template format to prevent bad API calls
   * @param {string} template - Template string to validate
   * @returns {boolean} - Whether template is valid
   */
  isValidTemplate(template) {
    if (!template || typeof template !== 'string') return false;
    
    // Check for basic template format
    if (!template.includes('{{') || !template.includes('}}')) return false;
    
    // Check for balanced braces
    const openBraces = (template.match(/\{\{/g) || []).length;
    const closeBraces = (template.match(/\}\}/g) || []).length;
    if (openBraces !== closeBraces) return false;
    
    // Check for empty template
    const content = template.replace(/\{\{\s*/, '').replace(/\s*\}\}/, '').trim();
    if (!content) return false;
    
    return true;
  }

  /**
   * Enhanced value resolver that handles entities, templates, and plain strings
   * @param {*} value - Value to resolve
   * @param {Object} hass - Home Assistant object
   * @returns {Promise<*>} - Resolved value
   */
  async resolveValue(value, hass) {
    if (!value) return null;
    
    // Handle templates first
    if (this.isTemplate(value)) {
      const result = await this.evaluateTemplate(value, hass);
      return result;
    }
    
    // Handle entity references
    if (typeof value === 'string' && value.includes('.') && hass && hass.states[value]) {
      const entity = hass.states[value];
      // Check if entity state is unknown/unavailable
      if (entity.state === 'unknown' || entity.state === 'unavailable') {
        return null;
      }
      
      // For entity timestamps, strip timezone info to treat as local time
      // This provides more intuitive behavior for users
      let entityValue = entity.state;
      if (typeof entityValue === 'string' && entityValue.includes('T')) {
        // Remove timezone information (+XX:XX, -XX:XX, Z) from entity values
        // This ensures entity timestamps are always treated as local time
        entityValue = entityValue.replace(/([+-]\d{2}:\d{2}|Z)$/, '');
      }
      
      return entityValue;
    }
    
    // Return plain string/value
    return value;
  }

  /**
   * Clears template cache when entities change
   */
  clearTemplateCache() {
    this.templateResults.clear();
  }

  /**
   * Enforces template cache size limits to prevent memory growth
   */
  enforceTemplateCacheLimit() {
    if (this.templateResults.size <= this.templateCacheLimit) {
      return;
    }

    // Convert to array and sort by timestamp (oldest first)
    const cacheEntries = Array.from(this.templateResults.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Remove oldest entries until we're under the limit
    const entriesToRemove = cacheEntries.length - this.templateCacheLimit;
    for (let i = 0; i < entriesToRemove; i++) {
      this.templateResults.delete(cacheEntries[i][0]);
    }
  }

  /**
   * Checks if the current config contains any templates
   * @param {Object} config - Configuration object
   * @returns {boolean} - Whether config contains templates
   */
  hasTemplatesInConfig(config) {
    if (!config) return false;
    
    // Check common template-enabled properties
    const templateProperties = [
      'target_date', 'creation_date', 'title', 'subtitle',
      'color', 'background_color', 'progress_color', 'primary_color', 'secondary_color'
    ];
    
    return templateProperties.some(prop => 
      config[prop] && this.isTemplate(config[prop])
    );
  }

  /**
   * Escapes HTML special characters to prevent XSS and ensure proper display
   * @param {*} text - Text to escape
   * @returns {string} - Escaped text
   */
  escapeHtml(text) {
    if (text == null || text === undefined) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

/**
 * CountdownService - Handles countdown calculations and time unit management
 * Provides clean separation of countdown logic from presentation
 */
class CountdownService {
  constructor(templateService, dateParser) {
    this.templateService = templateService;
    this.dateParser = dateParser;
    this.timeRemaining = { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    this.expired = false;
  }

  /**
   * Updates the countdown based on current configuration
   * @param {Object} config - Card configuration
   * @param {Object} hass - Home Assistant object
   * @returns {Promise<Object>} - Time remaining object
   */
  async updateCountdown(config, hass) {
    try {
      if (!config.target_date) return this.timeRemaining;
      
      const now = new Date().getTime();
      const targetDateValue = await this.templateService.resolveValue(config.target_date, hass);
      
      if (!targetDateValue) {
        console.warn('TimeFlow Card: Target date could not be resolved. Check your entity or date format.');
        return this.timeRemaining;
      }
      
      // Use the helper method for consistent date parsing
      const targetDate = this.dateParser.parseISODate(targetDateValue);
      
      if (isNaN(targetDate)) {
        console.warn('TimeFlow Card: Invalid target date format:', targetDateValue);
        return this.timeRemaining;
      }
      
      const difference = targetDate - now;

      if (difference > 0) {
        // Calculate time units based on what's enabled - cascade disabled units into enabled ones
        const { show_months, show_days, show_hours, show_minutes, show_seconds } = config;
        
        let totalMilliseconds = difference;
        let months = 0, days = 0, hours = 0, minutes = 0, seconds = 0;
        
        // Find the largest enabled unit and calculate everything from there
        if (show_months) {
          months = Math.floor(totalMilliseconds / (1000 * 60 * 60 * 24 * 30.44)); // Average month length
          totalMilliseconds %= (1000 * 60 * 60 * 24 * 30.44);
        }
        
        if (show_days) {
          days = Math.floor(totalMilliseconds / (1000 * 60 * 60 * 24));
          totalMilliseconds %= (1000 * 60 * 60 * 24);
        } else if (show_months && !show_days) {
          // If days are disabled but months are enabled, add days to months
          const extraDays = Math.floor(totalMilliseconds / (1000 * 60 * 60 * 24));
          months += Math.floor(extraDays / 30.44);
          totalMilliseconds %= (1000 * 60 * 60 * 24);
        }
        
        if (show_hours) {
          hours = Math.floor(totalMilliseconds / (1000 * 60 * 60));
          totalMilliseconds %= (1000 * 60 * 60);
        } else if ((show_months || show_days) && !show_hours) {
          // If hours are disabled but larger units are enabled, add hours to the largest enabled unit
          const extraHours = Math.floor(totalMilliseconds / (1000 * 60 * 60));
          if (show_days) {
            days += Math.floor(extraHours / 24);
          } else if (show_months) {
            months += Math.floor(extraHours / (24 * 30.44));
          }
          totalMilliseconds %= (1000 * 60 * 60);
        }
        
        if (show_minutes) {
          minutes = Math.floor(totalMilliseconds / (1000 * 60));
          totalMilliseconds %= (1000 * 60);
        } else if ((show_months || show_days || show_hours) && !show_minutes) {
          // If minutes are disabled but larger units are enabled, add minutes to the largest enabled unit
          const extraMinutes = Math.floor(totalMilliseconds / (1000 * 60));
          if (show_hours) {
            hours += Math.floor(extraMinutes / 60);
          } else if (show_days) {
            days += Math.floor(extraMinutes / (60 * 24));
          } else if (show_months) {
            months += Math.floor(extraMinutes / (60 * 24 * 30.44));
          }
          totalMilliseconds %= (1000 * 60);
        }
        
        if (show_seconds) {
          seconds = Math.floor(totalMilliseconds / 1000);
        } else if ((show_months || show_days || show_hours || show_minutes) && !show_seconds) {
          // If seconds are disabled but larger units are enabled, add seconds to the largest enabled unit
          const extraSeconds = Math.floor(totalMilliseconds / 1000);
          if (show_minutes) {
            minutes += Math.floor(extraSeconds / 60);
          } else if (show_hours) {
            hours += Math.floor(extraSeconds / (60 * 60));
          } else if (show_days) {
            days += Math.floor(extraSeconds / (60 * 60 * 24));
          } else if (show_months) {
            months += Math.floor(extraSeconds / (60 * 60 * 24 * 30.44));
          }
        }

        this.timeRemaining = { months, days, hours, minutes, seconds, total: difference };
        this.expired = false;
      } else {
        this.timeRemaining = { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
        this.expired = true;
      }
      
      return this.timeRemaining;
    } catch (error) {
      console.error('TimeFlow Card: Error in updateCountdown:', error);
      return this.timeRemaining;
    }
  }

  /**
   * Calculates progress percentage
   * @param {Object} config - Card configuration
   * @param {Object} hass - Home Assistant object
   * @returns {Promise<number>} - Progress percentage (0-100)
   */
  async calculateProgress(config, hass) {
    const targetDateValue = await this.templateService.resolveValue(config.target_date, hass);
    if (!targetDateValue) return 0;
    
    // Use the helper method for consistent date parsing
    const targetDate = this.dateParser.parseISODate(targetDateValue);
    const now = Date.now();
    
    let creationDate;
    if (config.creation_date) {
      const creationDateValue = await this.templateService.resolveValue(config.creation_date, hass);
      
      if (creationDateValue) {
        // Use the helper method for consistent date parsing
        creationDate = this.dateParser.parseISODate(creationDateValue);
      } else {
        creationDate = now;
      }
    } else {
      creationDate = now; // Fallback to now if somehow no creation date
    }
    
    const totalDuration = targetDate - creationDate;
    if (totalDuration <= 0) return 100;
    
    const elapsed = now - creationDate;
    const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    
    return this.expired ? 100 : progress;
  }

  /**
   * Gets the main display value and label
   * @param {Object} config - Card configuration
   * @returns {Object} - Object with value and label properties
   */
  getMainDisplay(config) {
    const { show_months, show_days, show_hours, show_minutes, show_seconds } = config;
    const { months, days, hours, minutes, seconds } = this.timeRemaining;
    
    if (this.expired) {
      return { value: '🎉', label: 'Completed!' };
    }
    
    // Show the largest time unit that is enabled and has a value > 0
    if (show_months && months > 0) {
      return { value: months.toString(), label: months === 1 ? 'month left' : 'months left' };
    } else if (show_days && days > 0) {
      return { value: days.toString(), label: days === 1 ? 'day left' : 'days left' };
    } else if (show_hours && hours > 0) {
      return { value: hours.toString(), label: hours === 1 ? 'hour left' : 'hours left' };
    } else if (show_minutes && minutes > 0) {
      return { value: minutes.toString(), label: minutes === 1 ? 'minute left' : 'minutes left' };
    } else if (show_seconds && seconds >= 0) {
      return { value: seconds.toString(), label: seconds === 1 ? 'second left' : 'seconds left' };
    }
    
    return { value: '0', label: 'seconds left' };
  }

  /**
   * Gets the subtitle text showing time breakdown
   * @param {Object} config - Card configuration
   * @returns {string} - Formatted subtitle text
   */
  getSubtitle(config) {
    if (this.expired) {
      const { expired_text = 'Completed! 🎉' } = config;
      return expired_text;
    }
    
    const { months, days, hours, minutes, seconds } = this.timeRemaining || { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    const { show_months, show_days, show_hours, show_minutes, show_seconds } = config;
    
    const parts = [];
    
    // Add each time unit based on configuration and if value > 0
    if (show_months && months > 0) {
      parts.push({ value: months, unit: months === 1 ? 'month' : 'months' });
    }
    
    if (show_days && days > 0) {
      parts.push({ value: days, unit: days === 1 ? 'day' : 'days' });
    }
    
    if (show_hours && hours > 0) {
      parts.push({ value: hours, unit: hours === 1 ? 'hour' : 'hours' });
    }
    
    if (show_minutes && minutes > 0) {
      parts.push({ value: minutes, unit: minutes === 1 ? 'minute' : 'minutes' });
    }
    
    if (show_seconds && seconds > 0) {
      parts.push({ value: seconds, unit: seconds === 1 ? 'second' : 'seconds' });
    }
    
    // If no parts are shown or all values are 0, show the largest enabled unit
    if (parts.length === 0) {
      if (show_months) {
        parts.push({ value: months, unit: months === 1 ? 'month' : 'months' });
      } else if (show_days) {
        parts.push({ value: days, unit: days === 1 ? 'day' : 'days' });
      } else if (show_hours) {
        parts.push({ value: hours, unit: hours === 1 ? 'hour' : 'hours' });
      } else if (show_minutes) {
        parts.push({ value: minutes, unit: minutes === 1 ? 'minute' : 'minutes' });
      } else if (show_seconds) {
        parts.push({ value: seconds, unit: seconds === 1 ? 'second' : 'seconds' });
      }
    }
    
    // Count enabled units for formatting decision
    const enabledUnits = [show_months, show_days, show_hours, show_minutes, show_seconds].filter(Boolean).length;
    
    // Format based on number of enabled units
    if (enabledUnits <= 2 && parts.length > 0) {
      // Natural format for 1-2 enabled units: "1 month and 10 days"
      if (parts.length === 1) {
        return `${parts[0].value} ${parts[0].unit}`;
      } else if (parts.length === 2) {
        return `${parts[0].value} ${parts[0].unit} and ${parts[1].value} ${parts[1].unit}`;
      }
    }
    
    // Compact format for 3+ enabled units: "1mo 10d 5h"
    return parts.map(part => {
      const shortUnit = part.unit.charAt(0); // m, d, h, m, s
      return `${part.value}${shortUnit}`;
    }).join(' ') || '0s';
  }

  /**
   * Gets current time remaining
   * @returns {Object} - Time remaining object
   */
  getTimeRemaining() {
    return this.timeRemaining;
  }

  /**
   * Gets expired status
   * @returns {boolean} - Whether countdown has expired
   */
  isExpired() {
    return this.expired;
  }
}

/**
 * StyleManager - Handles styling calculations and CSS processing
 * Provides dynamic sizing, proportional scaling, and style management
 */
class StyleManager {
  // Constants for icon and stroke size limits
  static MIN_ICON_SIZE = 40;
  static MAX_ICON_SIZE = 120;
  static MIN_STROKE = 4;
  static MAX_STROKE = 20;

  constructor() {
    this.cache = {
      dynamicIconSize: null,
      dynamicStrokeWidth: null,
      customStyles: null,
      lastConfigHash: null
    };
  }

  /**
   * Processes styles array into CSS string
   * @param {Array} styles - Array of style objects or strings
   * @returns {string} - CSS string
   */
  processStyles(styles) {
    if (!styles || !Array.isArray(styles)) return '';
    
    return styles.map(style => {
      try {
        if (typeof style === 'string') {
          return style;
        } else if (typeof style === 'object' && style !== null) {
          return Object.entries(style)
            .map(([prop, value]) => `${prop}: ${value}`)
            .join('; ');
        }
        return '';
      } catch (e) {
        console.warn('TimeFlow Card: Error processing style:', style, e);
        return '';
      }
    }).join('; ');
  }

  /**
   * Builds styles object from configuration
   * @param {Object} config - Card configuration
   * @returns {Object} - Processed styles object
   */
  buildStylesObject(config) {
    // Use cached value if available and config hasn't changed
    const configHash = JSON.stringify(config.styles || {});
    if (this.cache.customStyles !== null && this.cache.lastConfigHash === configHash) {
      return this.cache.customStyles;
    }

    const { styles = {} } = config;
    
    try {
      const processedStyles = {
        card: this.processStyles(styles.card),
        title: this.processStyles(styles.title),
        subtitle: this.processStyles(styles.subtitle),
        progress_circle: this.processStyles(styles.progress_circle)
      };

      this.cache.customStyles = processedStyles;
      this.cache.lastConfigHash = configHash;
      return processedStyles;
    } catch (e) {
      console.warn('TimeFlow Card: Error building styles object:', e);
      this.cache.customStyles = {
        card: '',
        title: '',
        subtitle: '',
        progress_circle: ''
      };
      return this.cache.customStyles;
    }
  }

  /**
   * Internal helper to get card dimensions based on width, height, and aspect ratio
   */
  _getCardDimensions(width, height, aspect_ratio) {
    const defaultWidth = 300;
    const defaultHeight = 150;
    let cardWidth = defaultWidth;
    let cardHeight = defaultHeight;
    if (width && height) {
      const parsedW = this.parseDimension(width);
      const parsedH = this.parseDimension(height);
      cardWidth = parsedW || defaultWidth;
      cardHeight = parsedH || defaultHeight;
    } else if (width && aspect_ratio) {
      const parsedW = this.parseDimension(width);
      cardWidth = parsedW || defaultWidth;
      const [ratioW, ratioH] = aspect_ratio.split('/').map(parseFloat);
      if (!isNaN(ratioW) && !isNaN(ratioH) && ratioW > 0) {
        cardHeight = cardWidth * (ratioH / ratioW);
      }
    } else if (height && aspect_ratio) {
      const parsedH = this.parseDimension(height);
      cardHeight = parsedH || defaultHeight;
      const [ratioW, ratioH] = aspect_ratio.split('/').map(parseFloat);
      if (!isNaN(ratioW) && !isNaN(ratioH) && ratioH > 0) {
        cardWidth = cardHeight * (ratioW / ratioH);
      }
    } else if (aspect_ratio) {
      const [ratioW, ratioH] = aspect_ratio.split('/').map(parseFloat);
      if (!isNaN(ratioW) && !isNaN(ratioH) && ratioW > 0) {
        cardHeight = defaultWidth * (ratioH / ratioW);
      }
      cardWidth = defaultWidth;
    }
    if (!cardWidth || isNaN(cardWidth) || cardWidth <= 0) cardWidth = defaultWidth;
    if (!cardHeight || isNaN(cardHeight) || cardHeight <= 0) cardHeight = defaultHeight;
    return { cardWidth, cardHeight };
  }

  /**
   * Calculate dynamic icon size based on card dimensions - now truly proportional
   * @param {*} width - Card width
   * @param {*} height - Card height
   * @param {string} aspect_ratio - Aspect ratio string
   * @param {*} icon_size - Explicit icon size
   * @returns {number} - Calculated icon size in pixels
   */
  calculateDynamicIconSize(width, height, aspect_ratio, icon_size) {
    // Use cached value if available and config hasn't changed
    const configKey = JSON.stringify({ width, height, aspect_ratio, icon_size });
    if (this.cache.dynamicIconSize !== null && this.cache.lastIconConfigHash === configKey) {
      return this.cache.dynamicIconSize;
    }

    try {
      const { cardWidth, cardHeight } = this._getCardDimensions(width, height, aspect_ratio);
      const minDimension = Math.min(cardWidth, cardHeight);
      const proportionalSize = minDimension * 0.4;
      let size = proportionalSize;

      // Respect explicit icon_size if provided, otherwise use proportional
      if (icon_size && icon_size !== '100px') {
        const baseSize = typeof icon_size === 'string' ?
          parseInt(icon_size.replace('px', '')) :
          (typeof icon_size === 'number' ? icon_size : proportionalSize);
        size = (!isNaN(baseSize))
          ? Math.max(StyleManager.MIN_ICON_SIZE, Math.min(baseSize, minDimension * 0.6))
          : StyleManager.MIN_ICON_SIZE;
      }

      this.cache.dynamicIconSize = Math.max(StyleManager.MIN_ICON_SIZE, Math.min(size, StyleManager.MAX_ICON_SIZE));
      this.cache.lastIconConfigHash = configKey;
      return this.cache.dynamicIconSize;
    } catch (error) {
      console.warn('TimeFlow Card: Error calculating dynamic icon size:', error);
      this.cache.dynamicIconSize = StyleManager.MIN_ICON_SIZE; // Safe fallback
      return this.cache.dynamicIconSize;
    }
  }

  /**
   * Calculate dynamic stroke width based on icon size
   * @param {number} iconSize - Icon size in pixels
   * @param {*} stroke_width - Explicit stroke width
   * @returns {number} - Calculated stroke width
   */
  calculateDynamicStrokeWidth(iconSize, stroke_width) {
    // Use cached value if available and config hasn't changed
    const configKey = JSON.stringify({ iconSize, stroke_width });
    if (this.cache.dynamicStrokeWidth !== null && this.cache.lastStrokeConfigHash === configKey) {
      return this.cache.dynamicStrokeWidth;
    }

    try {
      const ratio = 0.15;
      const calculated = Math.round(iconSize * ratio);
      this.cache.dynamicStrokeWidth = Math.max(StyleManager.MIN_STROKE, Math.min(calculated, StyleManager.MAX_STROKE));
      this.cache.lastStrokeConfigHash = configKey;
      return this.cache.dynamicStrokeWidth;
    } catch (error) {
      console.warn('TimeFlow Card: Error calculating dynamic stroke width:', error);
      this.cache.dynamicStrokeWidth = StyleManager.MIN_STROKE; // Safe fallback
      return this.cache.dynamicStrokeWidth;
    }
  }

  /**
   * Calculate proportional font sizes based on card dimensions
   * @param {*} width - Card width
   * @param {*} height - Card height
   * @param {string} aspect_ratio - Aspect ratio string
   * @returns {Object} - Object with font sizes and dimensions
   */
  calculateProportionalSizes(width, height, aspect_ratio) {
    try {
      const { cardWidth, cardHeight } = this._getCardDimensions(width, height, aspect_ratio);
      const defaultArea = 300 * 150;
      const scaleFactor = Math.sqrt((cardWidth * cardHeight) / defaultArea);

      return {
        titleSize: Math.max(1.2, Math.min(2.2, 1.6 * scaleFactor)),
        subtitleSize: Math.max(0.9, Math.min(1.4, 1.1 * scaleFactor)),
        cardWidth,
        cardHeight
      };
    } catch (error) {
      console.warn('TimeFlow Card: Error calculating proportional sizes:', error);
      return { titleSize: 1.6, subtitleSize: 1.1, cardWidth: 300, cardHeight: 150 };
    }
  }

  /**
   * Helper to parse dimension strings (e.g., "200px", "100%") to numbers
   * @param {*} dimension - Dimension value to parse
   * @returns {number|null} - Parsed dimension in pixels
   */
  parseDimension(dimension) {
    try {
      if (typeof dimension === 'number') return dimension;
      if (typeof dimension !== 'string') return null;
      // Normalize string for case-insensitive matching
      const dimStr = dimension.toLowerCase();
      // Handle percentage values - assume 300px base for calculations
      if (dimStr.includes('%')) {
        const percent = parseFloat(dimStr.replace('%', ''));
        return isNaN(percent) ? null : (percent / 100) * 300; // 300px as base
      }
      // Handle pixel values
      if (dimStr.includes('px')) {
        const pixels = parseFloat(dimStr.replace('px', ''));
        return isNaN(pixels) ? null : pixels;
      }
      // Try to parse as number
      const parsed = parseFloat(dimStr);
      return isNaN(parsed) ? null : parsed;
    } catch (error) {
      console.warn('TimeFlow Card: Error parsing dimension:', dimension, error);
      return null;
    }
  }

  /**
   * Generates card dimensions CSS based on configuration
   * @param {*} width - Card width
   * @param {*} height - Card height
   * @param {string} aspect_ratio - Aspect ratio string
   * @returns {Array} - Array of CSS style strings
   */
  generateCardDimensionStyles(width, height, aspect_ratio) {
    const cardStyles = [];
    
    // Apply width if specified
    if (width) {
      cardStyles.push(`width: ${width}`);
    }
    
    // Apply height if specified
    if (height) {
      cardStyles.push(`height: ${height}`);
    } else if (aspect_ratio) {
      // Use aspect-ratio if height not specified
      cardStyles.push(`aspect-ratio: ${aspect_ratio}`);
    } else {
      // Fallback minimum height
      cardStyles.push('min-height: 120px');
    }

    return cardStyles;
  }

  /**
   * Clears style cache
   */
  clearCache() {
    this.cache = {
      dynamicIconSize: null,
      dynamicStrokeWidth: null,
      customStyles: null,
      lastConfigHash: null
    };
  }
}

/**
 * ProgressCircleBeta - Modular progress circle component
 * Provides visual progress indication
 */
class ProgressCircleBeta extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      --progress-color: var(--progress-color, #4CAF50);
    }
    
    svg {
      transform: rotate(-90deg);
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s ease;
      overflow: visible;
    }
    
    svg:focus {
      outline: 2px solid var(--primary-color, #03A9F4);
      outline-offset: 2px;
    }
    
    .progress-background {
      fill: none;
      stroke: rgba(255, 255, 255, 0.1);
    }
    
    .progress-circle {
      fill: none;
      stroke-linecap: round;
      transition: stroke-dashoffset 0.3s ease, stroke 0.3s ease;
    }
    
    .progress-text {
      fill: currentColor;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      font-weight: 600;
      text-anchor: middle;
      dominant-baseline: middle;
      opacity: 0.8;
    }
    
    /* Animation for progress changes */
    @keyframes progress-pulse {
      0% { opacity: 0.8; }
      50% { opacity: 1; }
      100% { opacity: 0.8; }
    }
    
    svg.updating .progress-circle {
      animation: progress-pulse 0.5s ease-in-out;
    }
  `;

  
  // Reactive property: progress
  get progress() { return this._progress !== undefined ? this._progress : 0; }
  set progress(value) { 
    const oldValue = this._progress;
    this._progress = value;
    this.requestUpdate('progress', oldValue);
  }
  
  // Reactive property: color
  get color() { return this._color !== undefined ? this._color : '#4CAF50'; }
  set color(value) { 
    const oldValue = this._color;
    this._color = value;
    this.requestUpdate('color', oldValue);
  }
  
  // Reactive property: size
  get size() { return this._size !== undefined ? this._size : 100; }
  set size(value) { 
    const oldValue = this._size;
    this._size = value;
    this.requestUpdate('size', oldValue);
  }
  
  // Reactive property: strokeWidth
  get strokeWidth() { return this._strokeWidth !== undefined ? this._strokeWidth : 15; }
  set strokeWidth(value) { 
    const oldValue = this._strokeWidth;
    this._strokeWidth = value;
    this.requestUpdate('strokeWidth', oldValue);
  }

  render() {
    const radius = (this.size - this.strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (this.progress / 100) * circumference;

    // Validate calculations to prevent SVG errors
    if (isNaN(this.size) || isNaN(radius) || isNaN(circumference) || isNaN(strokeDashoffset)) {
      console.warn('TimeFlow Card: Invalid SVG calculations, using fallback values');
      return html`<div>Invalid circle dimensions</div>`;
    }

    return html`
      <svg 
        class="progress-circle-beta" 
        width="${this.size}" 
        height="${this.size}"
        style="--progress-color: ${this.color};"
      >
        <circle
          class="progress-background"
          cx="${this.size / 2}"
          cy="${this.size / 2}"
          r="${radius}"
          stroke-width="${this.strokeWidth}"
        />
        <circle
          class="progress-circle"
          cx="${this.size / 2}"
          cy="${this.size / 2}"
          r="${radius}"
          stroke="${this.color}"
          stroke-width="${this.strokeWidth}"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${strokeDashoffset}"
        />
        <text
          class="progress-text"
          x="${this.size / 2}"
          y="${this.size / 2}"
          fill="currentColor"
          font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif"
          font-size="${Math.max(12, this.size * 0.15)}px"
          font-weight="600"
          text-anchor="middle"
          dominant-baseline="middle"
          transform="rotate(90 ${this.size / 2} ${this.size / 2})"
          opacity="0.8"
        >
          ${Math.round(this.progress)}%
        </text>
      </svg>
    `;
  }

  /**
   * Static method to check if component is loaded
   * @returns {boolean} - True if component is defined
   */
  static isLoaded() {
    return customElements.get('progress-circle-beta') !== undefined;
  }

  /**
   * Get component version for debugging
   * @returns {string} - Component version
   */
  static get version() {
    return '2.0.0';
  }
}

/**
 * TimeFlowCardBeta - Main card component with modular architecture
 * Orchestrates all modules and provides clean separation of concerns
 */
class TimeFlowCardBeta extends LitElement {
  // Define static styles
  static styles = css`
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    }
    
    ha-card {
      display: flex;
      flex-direction: column;
      padding: 0;
      border-radius: 22px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      border: none;
    }
    
    .card-content {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 20px;
      height: 100%;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0;
    }
    
    .title-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .title {
      font-weight: 500;
      margin: 0;
      opacity: 0.9;
      line-height: 1.3;
      letter-spacing: -0.01em;
    }
    
    .subtitle {
      opacity: 0.65;
      margin: 0;
      font-weight: 400;
      line-height: 1.2;
    }
    
    .progress-section {
      flex-shrink: 0;
      margin-left: auto;
    }
    
    .content {
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
      margin-top: auto;
      padding-top: 12px;
    }
    
    .expired {
      animation: celebration 0.8s ease-in-out;
    }
    
    @keyframes celebration {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    .progress-circle-beta {
      opacity: 0.9;
    }
    
    .error {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: #f44336;
      color: white;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    }
    
    .error-title {
      font-weight: bold;
      margin-bottom: 8px;
    }
    
    .error-message {
      font-size: 0.9em;
      opacity: 0.9;
    }
    
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      ha-card {
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      }
    }
  `;
  // Lit reactive properties
  
  // Reactive property: hass
  get hass() { return this._hass !== undefined ? this._hass : {}; }
  set hass(value) { 
    const oldValue = this._hass;
    this._hass = value;
    this.requestUpdate('hass', oldValue);
  }
  
  // Reactive state: _config
  get _config() { return this.__config !== undefined ? this.__config : {}; }
  set _config(value) { 
    const oldValue = this.__config;
    this.__config = value;
    this.requestUpdate('_config', oldValue);
  }
  
  // Reactive state: _errorState
  get _errorState() { return this.__errorState !== undefined ? this.__errorState : null; }
  set _errorState(value) { 
    const oldValue = this.__errorState;
    this.__errorState = value;
    this.requestUpdate('_errorState', oldValue);
  }
  
  // Reactive state: _currentProgress
  get _currentProgress() { return this.__currentProgress !== undefined ? this.__currentProgress : 0; }
  set _currentProgress(value) { 
    const oldValue = this.__currentProgress;
    this.__currentProgress = value;
    this.requestUpdate('_currentProgress', oldValue);
  }
  
  // Reactive state: _subtitleText
  get _subtitleText() { return this.__subtitleText !== undefined ? this.__subtitleText : ''; }
  set _subtitleText(value) { 
    const oldValue = this.__subtitleText;
    this.__subtitleText = value;
    this.requestUpdate('_subtitleText', oldValue);
  }
  
  // Reactive state: _isExpired
  get _isExpired() { return this.__isExpired !== undefined ? this.__isExpired : false; }
  set _isExpired(value) { 
    const oldValue = this.__isExpired;
    this.__isExpired = value;
    this.requestUpdate('_isExpired', oldValue);
  }
  
  // Reactive state: _resolvedConfig
  get _resolvedConfig() { return this.__resolvedConfig !== undefined ? this.__resolvedConfig : {}; }
  set _resolvedConfig(value) { 
    const oldValue = this.__resolvedConfig;
    this.__resolvedConfig = value;
    this.requestUpdate('_resolvedConfig', oldValue);
  }

  constructor() {
    super();
    this._interval = null;
    this._updateScheduled = false;
    
    // Initialize modular services
    this.templateService = new TemplateService();
    this.countdownService = new CountdownService(this.templateService, DateParser);
    this.styleManager = new StyleManager();
    
    // Performance cache
    this._cache = {
      lastConfigHash: null,
      lastEntityStates: new Map(),
      templateWatchers: new Map(),
      parsedTargetDate: null,
      parsedCreationDate: null
    };
  }

  static getStubConfig() {
    return {
      type: 'timeflow-card-beta',
      target_date: '2024-12-31T23:59:59',
      title: 'New Year Countdown',
      show_days: true,
      show_hours: true,
      show_minutes: true,
      show_seconds: true
    };
  }

  setConfig(config) {
    try {
      // Validate configuration using modular validator
      ConfigValidator.validateConfig(config);
      
      this._config = { ...config };
      this._errorState = null;
      
      // Clear caches when config changes
      this.templateService.clearTemplateCache();
      this.styleManager.clearCache();
      this._clearPerformanceCache();
      
      // Trigger re-render
      this.requestUpdate();
    } catch (error) {
      this._errorState = error.message;
      console.error('TimeFlow Card: Configuration error:', error);
      this.requestUpdate();
    }
  }

  // Lit lifecycle methods
  firstUpdated() {
    this._applyCardMod();
    this._startTimer();
  }

  updated(changedProperties) {
    if (changedProperties.has('hass')) {
      const oldHass = changedProperties.get('hass');
      // Clear template cache when hass changes or entities update
      if (this.hass && oldHass !== this.hass) {
        this.templateService.clearTemplateCache();
        this._hasEntitiesChanged(oldHass, this.hass);
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopTimer();
    this._cleanup();
  }

  /**
   * Cleans up resources
   */
  _cleanup() {
    
    // Clear all caches to prevent memory leaks
    this.templateService.clearTemplateCache();
    this._clearPerformanceCache();
    
    // Clear cached DOM references
    this._domElements = null;
    
    // Cancel any pending animation frames
    if (this._updateScheduled) {
      this._updateScheduled = false;
    }
    
    // Clear error state
    this._errorState = null;
  }

  /**
   * Clears performance cache
   */
  _clearPerformanceCache() {
    this._cache.lastConfigHash = null;
    this._cache.lastEntityStates.clear();
    this._cache.templateWatchers.clear();
    this._cache.parsedTargetDate = null;
    this._cache.parsedCreationDate = null;
    this._cache.resolvedProperties = null;
    this._cache.resolvedPropertiesKey = null;
    this._cache.resolvedPropertiesTimestamp = 0;
  }

  /**
   * Checks if entities have changed
   * @param {Object} oldHass - Previous hass object
   * @param {Object} newHass - New hass object
   * @returns {boolean} - Whether entities changed
   */
  _hasEntitiesChanged(oldHass, newHass) {
    if (!oldHass || !newHass) return true;
    
    // Check if any relevant entities have changed
    const templateProperties = ['target_date', 'creation_date', 'title', 'subtitle', 'color', 'background_color', 'progress_color'];
    
    return templateProperties.some(prop => {
      const value = this._config[prop];
      if (typeof value === 'string' && value.includes('.')) {
        // This is an entity
        const oldState = oldHass.states[value];
        const newState = newHass.states[value];
        return !oldState || !newState || oldState.state !== newState.state;
      }
      return false;
    });
  }

  /**
   * Performance optimization: detect config changes
   */
  _hasConfigChanged() {
    const configHash = JSON.stringify({
      ...this._config,
      target_date: typeof this._config.target_date === 'string' && this._config.target_date.includes('.') ? 'entity' : this._config.target_date,
      creation_date: typeof this._config.creation_date === 'string' && this._config.creation_date.includes('.') ? 'entity' : this._config.creation_date
    });
    
    if (this._cache.lastConfigHash !== configHash) {
      this._cache.lastConfigHash = configHash;
      return true;
    }
    return false;
  }

  /**
   * Card-mod support
   */
  _applyCardMod() {
    if (!this._config || !this._config.card_mod) return;
    
    // Wait for card-mod to be available and apply styles
    customElements.whenDefined("card-mod").then(() => {
      const cardMod = customElements.get("card-mod");
      if (cardMod && cardMod.applyToElement) {
        cardMod.applyToElement(this, this._config.card_mod, {});
      }
    }).catch(() => {
      // Card-mod not available, silently continue
    });
  }

  async _startTimer() {
    this._stopTimer();
    await this._updateCountdown(); // Make sure initial countdown calculation completes
    this._interval = setInterval(async () => {
      await this._updateCountdown();
    }, 1000);
  }

  _stopTimer() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }

  /**
   * Builds dynamic styles based on resolved configuration
   */
  _buildDynamicStyles(resolvedConfig) {
    const {
      color = '#ffffff',
      background_color,
      progress_color,
      width = null,
      height = null,
      aspect_ratio = '2/1',
      icon_size = '100px',
      stroke_width = 15,
    } = resolvedConfig;

    const bgColor = background_color || '#1976d2';
    const progressColor = progress_color || '#4CAF50';
    const proportionalSizes = this.styleManager.calculateProportionalSizes(width, height, aspect_ratio);
    const dynamicIconSize = this.styleManager.calculateDynamicIconSize(width, height, aspect_ratio, icon_size);
    const cardStyles = this.styleManager.generateCardDimensionStyles(width, height, aspect_ratio);

    return {
      card: `
        background: ${bgColor};
        color: ${color};
        ${cardStyles.join('; ')};
        --timeflow-card-beta-background-color: ${bgColor};
        --timeflow-card-beta-text-color: ${color};
        --timeflow-card-beta-progress-color: ${progressColor};
        --timeflow-card-beta-icon-size: ${dynamicIconSize}px;
        --timeflow-card-beta-stroke-width: ${this.styleManager.calculateDynamicStrokeWidth(dynamicIconSize, stroke_width)};
      `,
      title: `
        font-size: ${proportionalSizes.titleSize}rem;
      `,
      subtitle: `
        font-size: ${proportionalSizes.subtitleSize}rem;
      `
    };
  }

  /**
   * Performance optimization: schedule updates with RAF for Lit
   */
  _scheduleUpdate() {
    if (!this._updateScheduled) {
      this._updateScheduled = true;
      requestAnimationFrame(() => {
        this._updateScheduled = false;
        this.requestUpdate();
      });
    }
  }

  async _updateCountdown() {
    try {
      await this.countdownService.updateCountdown(this._config, this.hass);
      
      // Update reactive state
      const resolvedConfig = await this._resolveTemplateProperties();
      this._currentProgress = await this.countdownService.calculateProgress(this._config, this.hass);
      this._subtitleText = this.countdownService.getSubtitle(this._config);
      this._isExpired = this.countdownService.isExpired();
      this._resolvedConfig = resolvedConfig;
      
      this._scheduleUpdate();
    } catch (error) {
      console.error('TimeFlow Card: Error in updateCountdown:', error);
    }
  }

  /**
   * Resolves template-based configuration properties
   */
  async _resolveTemplateProperties() {
    const resolvedConfig = { ...this._config };
    
    // Properties that support templating
    const templateProperties = [
      'title', 'subtitle', 'color', 'background_color', 'progress_color', 
      'primary_color', 'secondary_color', 'target_date', 'creation_date'
    ];
    
    // Create a cache key for this resolution
    const cacheKey = JSON.stringify(templateProperties.map(prop => this._config[prop]).filter(Boolean));
    
    // Check if we have cached results that are still valid
    if (this._cache.resolvedProperties && 
        this._cache.resolvedPropertiesKey === cacheKey &&
        Date.now() - this._cache.resolvedPropertiesTimestamp < 2000) {
      return this._cache.resolvedProperties;
    }
    
    for (const prop of templateProperties) {
      if (resolvedConfig[prop]) {
        try {
          const resolved = await this.templateService.resolveValue(resolvedConfig[prop], this.hass);
          // Only update if resolution was successful and different
          if (resolved !== null && resolved !== undefined && resolved !== 'Unavailable') {
            resolvedConfig[prop] = resolved;
          }
        } catch (error) {
          console.error(`TimeFlow Card: Failed to resolve property "${prop}":`, error);
          // Keep original value as fallback
        }
      }
    }
    
    // Cache the resolved properties
    this._cache.resolvedProperties = resolvedConfig;
    this._cache.resolvedPropertiesKey = cacheKey;
    this._cache.resolvedPropertiesTimestamp = Date.now();
    
    return resolvedConfig;
  }

  // Main Lit render method
  render() {
    if (this._errorState) {
      return this._renderError();
    }

    return this._renderCard();
  }

  /**
   * Renders error state using Lit templates
   */
  _renderError() {
    return html`
      <ha-card class="error">
        <div>
          <div class="error-title">TimeFlow Card Configuration Error</div>
          <div class="error-message">${this._errorState}</div>
        </div>
      </ha-card>
    `;
  }

  /**
   * Renders the main card using Lit templates
   */
  _renderCard() {
    const resolvedConfig = this._resolvedConfig || this._config;
    const {
      title = 'Countdown Timer',
      expired_animation = true,
    } = resolvedConfig;

    const processedStyles = this.styleManager.buildStylesObject(this._config);
    const dynamicStyles = this._buildDynamicStyles(resolvedConfig);

    return html`
      <ha-card 
        class="timeflow-card-beta ${this._isExpired && expired_animation ? 'expired' : ''}"
        style="${dynamicStyles.card}"
      >
        <div class="card-content" style="${processedStyles.card || ''}">
          <header class="header">
            <div class="title-section">
              <h2 class="title" style="${processedStyles.title || ''}; ${dynamicStyles.title}">
                ${this.templateService.escapeHtml(title)}
              </h2>
              <p class="subtitle" style="${processedStyles.subtitle || ''}; ${dynamicStyles.subtitle}">
                ${this.templateService.escapeHtml(this._subtitleText)}
              </p>
            </div>
          </header>
          
          <div class="content">
            <div class="progress-section">
              <progress-circle-beta
                class="progress-circle-beta"
                progress="${this._currentProgress}"
                color="${resolvedConfig.progress_color || '#4CAF50'}"
                size="${this.styleManager.calculateDynamicIconSize(resolvedConfig.width, resolvedConfig.height, resolvedConfig.aspect_ratio, resolvedConfig.icon_size)}"
                stroke-width="${this.styleManager.calculateDynamicStrokeWidth(this.styleManager.calculateDynamicIconSize(resolvedConfig.width, resolvedConfig.height, resolvedConfig.aspect_ratio, resolvedConfig.icon_size), resolvedConfig.stroke_width)}"
                style="${processedStyles.progress_circle || ''}"
              ></progress-circle-beta>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  /**
   * Card-mod support
   */
  _applyCardMod() {
    if (!this._config || !this._config.card_mod) return;
    
    // Wait for card-mod to be available and apply styles
    customElements.whenDefined("card-mod").then(() => {
      const cardMod = customElements.get("card-mod");
      if (cardMod && cardMod.applyToElement) {
        cardMod.applyToElement(this, this._config.card_mod, {});
      }
    }).catch(() => {
      // Card-mod not available, silently continue
    });
  }

  /**
   * Performance optimization: Initialize DOM structure only when needed
   * This method should only be called on first render or config change.
   * After that, only _updateContentOnly should be used to update the card.
   */
  async _initializeDOM() {
    // Generate the card's HTML structure and styles
    const cardHTML = await this._buildCardHTML();
    this.shadowRoot.innerHTML = cardHTML;

    // Cache DOM elements for selective updates
    this._domElements = {
      haCard: this.shadowRoot.querySelector('ha-card'),
      cardContent: this.shadowRoot.querySelector('.card-content'),
      title: this.shadowRoot.querySelector('.title'),
      subtitle: this.shadowRoot.querySelector('.subtitle'),
      ProgressCircleBeta: this.shadowRoot.querySelector('progress-circle-beta')
    };
    
    // Initial content update
    await this._updateContentOnly();
    this._applyCardMod();
  }

  /**
   * Builds the complete HTML for the card, including styles.
   * @returns {Promise<string>} - The HTML string for the card.
   */
  async _buildCardHTML() {
    const resolvedConfig = await this._resolveTemplateProperties();
    const processedStyles = this.styleManager.buildStylesObject(this._config);
    
    const {
      title = 'Countdown Timer',
      expired_animation = true,
    } = resolvedConfig;

    const currentProgress = await this.countdownService.calculateProgress(this._config, this.hass);
    const subtitleText = this.countdownService.getSubtitle(this._config);
    const styleTag = this._buildStyleTag(resolvedConfig);

    // Generate simple IDs for elements
    const cardId = `timeflow-card-beta-${Math.random().toString(36).substr(2, 9)}`;
    const titleId = `title-${Math.random().toString(36).substr(2, 9)}`;
    const subtitleId = `subtitle-${Math.random().toString(36).substr(2, 9)}`;

    return `
      ${styleTag}
      <ha-card 
        class="timeflow-card-beta ${this.countdownService.isExpired() && expired_animation ? 'expired' : ''}"
        id="${cardId}"
      >
        <div class="card-content" style="${processedStyles.card || ''}">
          <header class="header">
            <div class="title-section">
              <h2 class="title" id="${titleId}" style="${processedStyles.title || ''}">${this.templateService.escapeHtml(title)}</h2>
              <p class="subtitle" id="${subtitleId}" style="${processedStyles.subtitle || ''}">${this.templateService.escapeHtml(subtitleText)}</p>
            </div>
          </header>
          
          <div class="content">
            <div class="progress-section">
              <progress-circle-beta
                class="progress-circle-beta"
                progress="${currentProgress}"
                color="${resolvedConfig.progress_color || '#4CAF50'}"
                size="${this.styleManager.calculateDynamicIconSize(resolvedConfig.width, resolvedConfig.height, resolvedConfig.aspect_ratio, resolvedConfig.icon_size)}"
                stroke-width="${this.styleManager.calculateDynamicStrokeWidth(this.styleManager.calculateDynamicIconSize(resolvedConfig.width, resolvedConfig.height, resolvedConfig.aspect_ratio, resolvedConfig.icon_size), resolvedConfig.stroke_width)}"
                style="${processedStyles.progress_circle || ''}"
              ></progress-circle-beta>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  /**
   * Builds the <style> tag for the card's shadow DOM.
   * @param {Object} resolvedConfig - The resolved configuration.
   * @returns {string} - The <style> tag HTML string.
   */
  _buildStyleTag(resolvedConfig) {
    const {
      color = '#ffffff',
      background_color,
      progress_color,
      expired_animation = true,
      width = null,
      height = null,
      aspect_ratio = '2/1',
      icon_size = '100px',
      stroke_width = 15,
    } = resolvedConfig;

    const bgColor = background_color || '#1976d2';
    const progressColor = progress_color || '#4CAF50';
    const proportionalSizes = this.styleManager.calculateProportionalSizes(width, height, aspect_ratio);
    const dynamicIconSize = this.styleManager.calculateDynamicIconSize(width, height, aspect_ratio, icon_size);
    const dynamicStrokeWidth = this.styleManager.calculateDynamicStrokeWidth(dynamicIconSize, stroke_width);
    const cardStyles = this.styleManager.generateCardDimensionStyles(width, height, aspect_ratio);

    return `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          
          /* CSS Variables for dynamic theming */
          --timeflow-card-beta-background-color: ${bgColor};
          --timeflow-card-beta-text-color: ${color};
          --timeflow-card-beta-progress-color: ${progressColor};
          --timeflow-card-beta-icon-size: ${dynamicIconSize}px;
          --timeflow-card-beta-stroke-width: ${dynamicStrokeWidth};
        }
        
        ha-card {
          display: flex;
          flex-direction: column;
          padding: 0;
          border-radius: 22px;
          position: relative;
          overflow: hidden;
          background: var(--timeflow-card-beta-background-color);
          color: var(--timeflow-card-beta-text-color);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          border: none;
          ${cardStyles.join(';\n          ')};
        }
        
        .card-content {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 20px;
          height: 100%;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0;
        }
        
        .title-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .title {
          font-size: ${proportionalSizes.titleSize}rem;
          font-weight: 500;
          margin: 0;
          opacity: 0.9;
          line-height: 1.3;
          letter-spacing: -0.01em;
        }
        
        .subtitle {
          font-size: ${proportionalSizes.subtitleSize}rem;
          opacity: 0.65;
          margin: 0;
          font-weight: 400;
          line-height: 1.2;
        }
        
        .progress-section {
          flex-shrink: 0;
          margin-left: auto;
        }
        
        .content {
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          margin-top: auto;
          padding-top: 12px;
        }
        
        .expired {
          ${expired_animation ? 'animation: celebration 0.8s ease-in-out;' : ''}
        }
        
        ${expired_animation ? `
        @keyframes celebration {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }` : ''}
        
        .progress-circle-beta {
          opacity: 0.9;
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          ha-card {
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          }
        }
      </style>
    `;
  }

  /**
   * Selective content updates to prevent flickering
   * Updates only what has changed without rebuilding DOM
   */
  async _updateContentOnly() {
    if (!this._domElements) return;

    // Resolve any template properties first
    const resolvedConfig = await this._resolveTemplateProperties();
    const { title = 'Countdown Timer', expired_animation = true } = resolvedConfig;

    // Update title only if it changed
    const titleEl = this._domElements.title;
    if (titleEl && titleEl.textContent !== title) {
      titleEl.textContent = title;
    }

    // Update subtitle only if it changed
    const subtitleText = this.countdownService.getSubtitle(this._config);
    const subtitleEl = this._domElements.subtitle;
    if (subtitleEl && subtitleEl.textContent !== subtitleText) {
      subtitleEl.textContent = subtitleText;
    }

    // Update progress circle only if progress changed
    const currentProgress = await this.countdownService.calculateProgress(this._config, this.hass);
    const progressEl = this._domElements.ProgressCircleBeta;
    if (progressEl) {
      const currentProgressAttr = progressEl.getAttribute('progress');
      if (currentProgressAttr !== currentProgress.toString()) {
        progressEl.setAttribute('progress', currentProgress);
      }
      
      // Update color if it changed
      const progressColor = resolvedConfig.progress_color || '#4CAF50';
      const currentColor = progressEl.getAttribute('color');
      if (currentColor !== progressColor) {
        progressEl.setAttribute('color', progressColor);
      }
    }

    // Update expired state only if it changed
    const haCardEl = this._domElements.haCard;
    if (haCardEl) {
      const shouldShowExpired = this.countdownService.isExpired() && expired_animation;
      const hasExpiredClass = haCardEl.classList.contains('expired');
      
      if (shouldShowExpired && !hasExpiredClass) {
        haCardEl.classList.add('expired');
      } else if (!shouldShowExpired && hasExpiredClass) {
        haCardEl.classList.remove('expired');
      }
    }
  }



  getCardSize() {
    // Dynamic card size based on aspect ratio and dimensions
    const { aspect_ratio = '2/1', height } = this._config;
    
    if (height) {
      // If explicit height is set, calculate size based on pixels
      const heightValue = parseInt(height);
      if (heightValue <= 100) return 1;
      if (heightValue <= 150) return 2;
      if (heightValue <= 200) return 3;
      return 4;
    }
    
    // Calculate based on aspect ratio
    if (aspect_ratio) {
      const [width, height] = aspect_ratio.split('/').map(Number);
      const ratio = height / width;
      
      // Taller cards need more rows
      if (ratio >= 1.5) return 4; // Square-ish or tall
      if (ratio >= 1) return 3;   // Square
      if (ratio >= 0.75) return 2; // Slightly wide
      return 2; // Wide cards
    }
    
    return 3; // Default
  }

  static get version() {
    return '2.0.0';
  }
}

/**
 * TimeFlow Card - Entry point for modular architecture
 * Registers components and exposes the card to Home Assistant
 */
// Register custom elements with duplicate protection
if (!customElements.get('progress-circle-beta')) {
  customElements.define('progress-circle-beta', ProgressCircleBeta);
  console.debug('TimeFlow Card Beta: Registered progress-circle-beta component');
} else {
  console.debug('TimeFlow Card Beta: progress-circle-beta component already registered');
}
if (!customElements.get('timeflow-card-beta')) {
  customElements.define('timeflow-card-beta', TimeFlowCardBeta);
  console.debug('TimeFlow Card Beta: Registered timeflow-card-beta component');
} else {
  console.debug('TimeFlow Card Beta: timeflow-card-beta component already registered');
}

// Register the card with Home Assistant
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'timeflow-card-beta',
  name: 'TimeFlow Card',
  description: 'A beautiful countdown timer card with progress circle for Home Assistant',
  preview: true,
  documentationURL: 'https://github.com/Rishi8078/TimeFlow-Card'
});

console.info(
  `%c  TIMEFLOW-CARD  \n%c  Version ${TimeFlowCardBeta.version}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);

// Export main class for external use
