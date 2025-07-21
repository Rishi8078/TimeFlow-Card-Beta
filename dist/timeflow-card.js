// Progress Circle Component
class ProgressCircle extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.progress = 0;
    this.color = '#4CAF50';
    this.size = 90;
    this.strokeWidth = 6;
  }

  static get observedAttributes() {
    return ['progress', 'color', 'size', 'stroke-width'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name === 'stroke-width') {
        this.strokeWidth = Number(newValue);
      } else if (name === 'progress') {
        this.progress = Number(newValue);
      } else {
        this[name] = newValue;
      }
      this.render();
    }
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const radius = (this.size - this.strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (this.progress / 100) * circumference;
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
        
        .progress-circle {
          transform: rotate(-90deg);
        }
        
        .progress-track {
          fill: none;
          stroke: rgba(255, 255, 255, 0.15);
        }
        
        .progress-bar {
          fill: none;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
      </style>
      
      <svg
        class="progress-circle"
        width="${this.size}"
        height="${this.size}"
        viewBox="0 0 ${this.size} ${this.size}"
      >
        <circle
          class="progress-track"
          cx="${this.size / 2}"
          cy="${this.size / 2}"
          r="${radius}"
          stroke-width="${this.strokeWidth}"
        />
        <circle
          class="progress-bar"
          cx="${this.size / 2}"
          cy="${this.size / 2}"
          r="${radius}"
          stroke-width="${this.strokeWidth}"
          stroke="${this.color}"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${strokeDashoffset}"
        />
      </svg>
    `;
  }
}

// Main TimeFlow Card Component
class TimeFlowCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._timeRemaining = { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    this._expired = false;
    this._interval = null;
    
    // Performance optimization cache
    this._cache = {
      dynamicIconSize: null,
      dynamicStrokeWidth: null,
      customStyles: null,
      lastConfigHash: null,
      parsedTargetDate: null,
      parsedCreationDate: null
    };
    this._domElements = null; // Cache DOM references
    this._updateScheduled = false; // Prevent duplicate RAF calls
  }

  static getStubConfig() {
    return {
      type: 'custom:timeflow-card',
      title: 'Countdown Timer',
      target_date: '2024-12-31T23:59:59',
      creation_date: null,
      show_months: false,
      show_days: true,
      show_hours: true,
      show_minutes: true,
      show_seconds: true,
      color: '#ffffff',
      background_color: '#1976d2',
      progress_color: '#4CAF50',
      // Dynamic sizing options (like button-card)
      width: null, // e.g., '200px' or '100%'
      height: null, // e.g., '150px' or 'auto'
      aspect_ratio: '2/1', // e.g., '1/1', '2/1', '3/1', '1/1.5'
      icon_size: '100px', // e.g., '80px', '20%', '100px'
      stroke_width: 15, // Progress circle thickness
      styles: {
        card: [],
        title: [],
        subtitle: [],
        progress_circle: []
      }
    };
  }

  setConfig(config) {
    if (!config.target_date) {
      throw new Error('You need to define a target_date (can be a date string or entity ID)');
    }
    
    // Create a mutable copy of the config
    const mutableConfig = { ...config };
    
    // If no creation_date is provided, set it to today (when card is created)
    if (!mutableConfig.creation_date && !this._config.creation_date) {
      // Always use strict ISO format for cross-browser compatibility
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      mutableConfig.creation_date = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }
    
    this._config = { ...mutableConfig };
    this.render();
    this._startTimer();
    
    // Re-apply card-mod styles when config changes
    setTimeout(() => this._applyCardMod(), 0);
  }

  set hass(hass) {
    this._hass = hass;
  }

  // Performance optimization: detect config changes
  _hasConfigChanged() {
    const configHash = JSON.stringify({
      ...this._config,
      // Exclude frequently changing values from hash
      target_date: typeof this._config.target_date === 'string' && this._config.target_date.includes('.') ? 'entity' : this._config.target_date,
      creation_date: typeof this._config.creation_date === 'string' && this._config.creation_date.includes('.') ? 'entity' : this._config.creation_date
    });
    
    if (this._cache.lastConfigHash !== configHash) {
      this._cache.lastConfigHash = configHash;
      // Clear cached values when config changes
      this._cache.dynamicIconSize = null;
      this._cache.dynamicStrokeWidth = null;
      this._cache.customStyles = null;
      return true;
    }
    return false;
  }

  connectedCallback() {
    this._startTimer();
    this._applyCardMod();
  }

  disconnectedCallback() {
    this._stopTimer();
  }

  // Card-mod support
  _applyCardMod() {
    if (!this._config || !this._config.card_mod) return;
    
    // Wait for card-mod to be available and apply styles
    customElements.whenDefined("card-mod").then(() => {
      const cardMod = customElements.get("card-mod");
      if (cardMod && cardMod.applyToElement) {
        // Get the ha-card element
        const haCard = this.shadowRoot.querySelector('ha-card');
        if (haCard) {
          // Apply card-mod styles to the ha-card element
          cardMod.applyToElement(
            haCard,
            "card",
            this._config.card_mod,
            { config: this._config },
            true, // Use shadow DOM 
            "type-custom-timeflow-card"
          );
        }
      }
    }).catch(() => {
      // Card-mod not available, silently continue
    });
  }

  _startTimer() {
    this._stopTimer();
    this._updateCountdown();
    this._interval = setInterval(() => {
      this._updateCountdown();
    }, 1000);
  }

  _stopTimer() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }

  // Performance optimization: schedule updates with RAF
  _scheduleUpdate() {
    if (!this._updateScheduled) {
      this._updateScheduled = true;
      requestAnimationFrame(() => {
        this._updateDisplay();
        this._updateScheduled = false;
      });
    }
  }

  // Helper for consistent date parsing across platforms
  _parseISODate(dateString) {
    try {
      // Handle ISO format strings properly (most reliable cross-platform)
      if (typeof dateString === 'string' && dateString.includes('T')) {
        // ISO format parsing is most consistent across browsers/devices
        const [datePart, timePart] = dateString.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        
        if (timePart && timePart.includes(':')) {
          const [hour, minute, secondPart] = timePart.split(':');
          const second = secondPart ? parseInt(secondPart) : 0;
          return new Date(year, month - 1, day, hour, minute, second).getTime();
        } else {
          return new Date(year, month - 1, day).getTime();
        }
      } else {
        // Fallback to regular parsing for other formats
        return new Date(dateString).getTime();
      }
    } catch (e) {
      console.error('Error parsing date:', e);
      return new Date(dateString).getTime();
    }
  }
  
  _updateCountdown() {
    if (!this._config.target_date) return;
    
    const now = new Date().getTime();
    const targetDateValue = this._getEntityValueOrString(this._config.target_date);
    if (!targetDateValue) return;
    
    // Use the helper method for consistent date parsing
    const targetDate = this._parseISODate(targetDateValue);
    
    const difference = targetDate - now;

    if (difference > 0) {
      // Calculate time units based on what's enabled - cascade disabled units into enabled ones
      const { show_months, show_days, show_hours, show_minutes, show_seconds } = this._config;
      
      let totalMilliseconds = difference;
      let months = 0, days = 0, hours = 0, minutes = 0, seconds = 0;
      
      // Find the largest enabled unit and calculate everything from there
      if (show_months) {
        // Normal calculation when months are enabled
        months = Math.floor(totalMilliseconds / (1000 * 60 * 60 * 24 * 30.44));
        totalMilliseconds = totalMilliseconds % (1000 * 60 * 60 * 24 * 30.44);
        
        if (show_days) {
          days = Math.floor(totalMilliseconds / (1000 * 60 * 60 * 24));
          totalMilliseconds = totalMilliseconds % (1000 * 60 * 60 * 24);
        }
        
        if (show_hours) {
          hours = Math.floor(totalMilliseconds / (1000 * 60 * 60));
          totalMilliseconds = totalMilliseconds % (1000 * 60 * 60);
        }
        
        if (show_minutes) {
          minutes = Math.floor(totalMilliseconds / (1000 * 60));
          totalMilliseconds = totalMilliseconds % (1000 * 60);
        }
        
        if (show_seconds) {
          seconds = Math.floor(totalMilliseconds / 1000);
        }
      } else if (show_days) {
        // Months disabled - put everything into days and below
        days = Math.floor(totalMilliseconds / (1000 * 60 * 60 * 24));
        totalMilliseconds = totalMilliseconds % (1000 * 60 * 60 * 24);
        
        if (show_hours) {
          hours = Math.floor(totalMilliseconds / (1000 * 60 * 60));
          totalMilliseconds = totalMilliseconds % (1000 * 60 * 60);
        }
        
        if (show_minutes) {
          minutes = Math.floor(totalMilliseconds / (1000 * 60));
          totalMilliseconds = totalMilliseconds % (1000 * 60);
        }
        
        if (show_seconds) {
          seconds = Math.floor(totalMilliseconds / 1000);
        }
      } else if (show_hours) {
        // Days and months disabled - put everything into hours and below
        hours = Math.floor(totalMilliseconds / (1000 * 60 * 60));
        totalMilliseconds = totalMilliseconds % (1000 * 60 * 60);
        
        if (show_minutes) {
          minutes = Math.floor(totalMilliseconds / (1000 * 60));
          totalMilliseconds = totalMilliseconds % (1000 * 60);
        }
        
        if (show_seconds) {
          seconds = Math.floor(totalMilliseconds / 1000);
        }
      } else if (show_minutes) {
        // Only minutes and possibly seconds enabled
        minutes = Math.floor(totalMilliseconds / (1000 * 60));
        totalMilliseconds = totalMilliseconds % (1000 * 60);
        
        if (show_seconds) {
          seconds = Math.floor(totalMilliseconds / 1000);
        }
      } else if (show_seconds) {
        // Only seconds enabled
        seconds = Math.floor(totalMilliseconds / 1000);
      }

      this._timeRemaining = { months, days, hours, minutes, seconds, total: difference };
      this._expired = false;
    } else {
      this._timeRemaining = { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      this._expired = true;
    }
    
    this._scheduleUpdate();
  }

  _updateDisplay() {
    // Use cached DOM elements and RAF for better performance
    if (this._domElements) {
      this._updateContent();
    } else {
      // Fallback to original method if DOM elements not cached
      const progressCircle = this.shadowRoot.querySelector('progress-circle');
      const mainValue = this.shadowRoot.querySelector('.main-value');
      const mainLabel = this.shadowRoot.querySelector('.main-label');
      const subtitle = this.shadowRoot.querySelector('.subtitle');
      const card = this.shadowRoot.querySelector('.card');
      
      if (progressCircle) {
        progressCircle.setAttribute('progress', this._getProgress());
      }
      
      const mainDisplay = this._getMainDisplay();
      if (mainValue) mainValue.textContent = mainDisplay.value;
      if (mainLabel) mainLabel.textContent = mainDisplay.label;
      
      if (subtitle) {
        subtitle.textContent = this._getSubtitle();
      }
      
      if (card) {
        card.classList.toggle('expired', this._expired);
      }
    }
  }

  _getProgress() {
    const targetDateValue = this._getEntityValueOrString(this._config.target_date);
    if (!targetDateValue) return 0;
    
    // Use the helper method for consistent date parsing
    const targetDate = this._parseISODate(targetDateValue);
    const now = Date.now();
    
    let creationDate;
    if (this._config.creation_date) {
      const creationDateValue = this._getEntityValueOrString(this._config.creation_date);
      
      if (creationDateValue) {
        // Use the helper method for consistent date parsing
        creationDate = this._parseISODate(creationDateValue);
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
    
    return this._expired ? 100 : progress;
  }

  _getEntityValueOrString(value) {
    if (!value) return null;
    
    if (typeof value === 'string' && value.includes('.') && this._hass && this._hass.states[value]) {
      const entity = this._hass.states[value];
      return entity.state;
    }
    
    return value;
  }

  _getMainDisplay() {
    const { show_months, show_days, show_hours, show_minutes, show_seconds } = this._config;
    const { months, days, hours, minutes, seconds } = this._timeRemaining;
    
    if (this._expired) {
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

    _getSubtitle() {
    if (this._expired) return 'Timer has expired';
    
    const { months, days, hours, minutes, seconds } = this._timeRemaining;
    const { show_months, show_days, show_hours, show_minutes, show_seconds } = this._config;
    
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

  _applyCardMod() {
    // Card-mod compatibility is handled by adding ha-card class to root element
    // This allows card-mod to automatically apply styles
  }

  _processStyles(styles, element) {
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

  _buildStylesObject() {
    // Use cached value if available and config hasn't changed
    if (this._cache.customStyles !== null && !this._hasConfigChanged()) {
      return this._cache.customStyles;
    }

    const { styles = {} } = this._config;
    
    try {
      const processedStyles = {
        card: this._processStyles(styles.card),
        title: this._processStyles(styles.title),
        subtitle: this._processStyles(styles.subtitle),
        progress_circle: this._processStyles(styles.progress_circle)
      };

      this._cache.customStyles = processedStyles;
      return processedStyles;
    } catch (e) {
      console.warn('TimeFlow Card: Error building styles object:', e);
      this._cache.customStyles = {
        card: '',
        title: '',
        subtitle: '',
        progress_circle: ''
      };
      return this._cache.customStyles;
    }
  }

  // Calculate dynamic icon size based on card dimensions
  _calculateDynamicIconSize(width, height, aspect_ratio, icon_size) {
    // Use cached value if available and config hasn't changed
    if (this._cache.dynamicIconSize !== null && !this._hasConfigChanged()) {
      return this._cache.dynamicIconSize;
    }

    try {
      // Parse the configured icon_size (remove 'px' if present)
      const baseIconSize = typeof icon_size === 'string' ? 
        parseInt(icon_size.replace('px', '')) : 
        (typeof icon_size === 'number' ? icon_size : 100);

      // If we have explicit width and height, use them for calculations
      if (width && height) {
        const cardWidth = this._parseDimension(width);
        const cardHeight = this._parseDimension(height);
        
        if (cardWidth && cardHeight) {
          // Scale icon to be roughly 40-50% of the smaller dimension
          const minDimension = Math.min(cardWidth, cardHeight);
          this._cache.dynamicIconSize = Math.max(40, Math.min(minDimension * 0.45, baseIconSize * 1.5));
          return this._cache.dynamicIconSize;
        }
      }

      // If we have width and aspect ratio, calculate based on that
      if (width && aspect_ratio) {
        const cardWidth = this._parseDimension(width);
        if (cardWidth) {
          const [ratioW, ratioH] = aspect_ratio.split('/').map(parseFloat);
          const cardHeight = cardWidth * (ratioH / ratioW);
          const minDimension = Math.min(cardWidth, cardHeight);
          this._cache.dynamicIconSize = Math.max(40, Math.min(minDimension * 0.45, baseIconSize * 1.5));
          return this._cache.dynamicIconSize;
        }
      }

      // If we have height, estimate width using aspect ratio
      if (height && aspect_ratio) {
        const cardHeight = this._parseDimension(height);
        if (cardHeight) {
          const [ratioW, ratioH] = aspect_ratio.split('/').map(parseFloat);
          const cardWidth = cardHeight * (ratioW / ratioH);
          const minDimension = Math.min(cardWidth, cardHeight);
          this._cache.dynamicIconSize = Math.max(40, Math.min(minDimension * 0.45, baseIconSize * 1.5));
          return this._cache.dynamicIconSize;
        }
      }

      // Fallback: use the configured icon_size as-is
      this._cache.dynamicIconSize = baseIconSize;
      return this._cache.dynamicIconSize;
    } catch (error) {
      console.warn('TimeFlow Card: Error calculating dynamic icon size:', error);
      this._cache.dynamicIconSize = 100; // Safe fallback
      return this._cache.dynamicIconSize;
    }
  }

  // Calculate dynamic stroke width based on icon size
  _calculateDynamicStrokeWidth(iconSize, stroke_width) {
    // Use cached value if available and config hasn't changed
    if (this._cache.dynamicStrokeWidth !== null && !this._hasConfigChanged()) {
      return this._cache.dynamicStrokeWidth;
    }

    try {
      const baseStrokeWidth = typeof stroke_width === 'number' ? stroke_width : 15;
      
      // Scale stroke width proportionally to icon size
      // Base ratio: 15px stroke for 100px icon = 0.15
      const ratio = 0.15;
      const calculatedStroke = Math.round(iconSize * ratio);
      
      // Keep stroke width within reasonable bounds (6-25px)
      this._cache.dynamicStrokeWidth = Math.max(6, Math.min(calculatedStroke, 25));
      return this._cache.dynamicStrokeWidth;
    } catch (error) {
      console.warn('TimeFlow Card: Error calculating dynamic stroke width:', error);
      this._cache.dynamicStrokeWidth = 15; // Safe fallback
      return this._cache.dynamicStrokeWidth;
    }
  }

  // Helper to parse dimension strings (e.g., "200px", "100%") to numbers
  _parseDimension(dimension) {
    try {
      if (typeof dimension === 'number') return dimension;
      if (typeof dimension !== 'string') return null;
      
      // Handle percentage values - assume 300px base for calculations
      if (dimension.includes('%')) {
        const percent = parseFloat(dimension.replace('%', ''));
        return isNaN(percent) ? null : (percent / 100) * 300; // 300px as base
      }
      
      // Handle pixel values
      if (dimension.includes('px')) {
        const pixels = parseFloat(dimension.replace('px', ''));
        return isNaN(pixels) ? null : pixels;
      }
      
      // Try to parse as number
      const parsed = parseFloat(dimension);
      return isNaN(parsed) ? null : parsed;
    } catch (error) {
      console.warn('TimeFlow Card: Error parsing dimension:', dimension, error);
      return null;
    }
  }

  render() {
    // Check if we need to rebuild DOM or just update content
    if (!this._domElements || this._hasConfigChanged()) {
      this._initializeDOM();
    } else {
      this._updateContent();
    }
  }

  // Performance optimization: Initialize DOM structure only when needed
  _initializeDOM() {
    const {
      title = 'Countdown Timer',
      show_days = true,
      show_hours = true,
      show_minutes = true,
      show_seconds = true,
      color = '#ffffff',
      background_color,
      progress_color,
      // Dynamic sizing options (like button-card)
      width = null,
      height = null,
      aspect_ratio = '2/1',
      icon_size = '100px',
      stroke_width = 15,
      expired_text = 'Completed! 🎉'
    } = this._config;

    const bgColor = background_color || '#1976d2';
    const progressColor = progress_color || '#4CAF50';

    // Calculate card dimensions dynamically
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

    // Calculate dynamic progress circle size based on card dimensions
    const dynamicIconSize = this._calculateDynamicIconSize(width, height, aspect_ratio, icon_size);
    const dynamicStrokeWidth = this._calculateDynamicStrokeWidth(dynamicIconSize, stroke_width);

    // Build custom styles from config
    const customStyles = this._buildStylesObject();

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          
          /* CSS Variables for dynamic theming */
          --timeflow-card-background-color: ${bgColor};
          --timeflow-card-text-color: ${color};
          --timeflow-card-progress-color: ${progressColor};
          --timeflow-card-icon-size: ${dynamicIconSize}px;
          --timeflow-card-stroke-width: ${dynamicStrokeWidth};
        }
        
        ha-card {
          display: flex;
          flex-direction: column;
          padding: 0;
          border-radius: 22px;
          position: relative;
          overflow: hidden;
          background: var(--timeflow-card-background-color);
          color: var(--timeflow-card-text-color);
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
          ${customStyles.card ? customStyles.card : ''}
        }
        
        /* CLEAN HEADER SECTION - Like reference cards */
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
        
        /* IMPROVED TYPOGRAPHY - Matching reference cards */
        .title {
          font-size: clamp(1.4rem, 4vw, 2rem);
          font-weight: 500;
          margin: 0;
          opacity: 0.9;
          line-height: 1.3;
          letter-spacing: -0.01em;
          ${customStyles.title ? customStyles.title : ''}
        }
        
        .subtitle {
          font-size: clamp(1rem, 3vw, 1.6rem);
          opacity: 0.65;
          margin: 0;
          font-weight: 400;
          line-height: 1.2;
          ${customStyles.subtitle ? customStyles.subtitle : ''}
        }
        
        .progress-section {
          flex-shrink: 0;
          margin-left: auto;
        }
        
        /* CONTENT SECTION - Like reference cards bottom area */
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
        
        .progress-circle {
          opacity: 0.9;
          ${customStyles.progress_circle ? customStyles.progress_circle : ''}
        }
        
        /* Responsive design with container queries for better scaling */
        @container (max-width: 250px) {
          .card {
            padding: 12px;
          }
          
          .title {
            font-size: 1.2rem;
          }
          
          .subtitle {
            font-size: 0.9rem;
          }
        }
        
        /* Responsive design */
        @media (max-width: 480px) {
          .card {
            padding: 16px;
            border-radius: 22px;
          }
          
          .title {
            font-size: 1.6rem;
          }
          
          .subtitle {
            font-size: 1.2rem;
          }
          
          :host {
            --timeflow-card-icon-size: calc(var(--timeflow-card-icon-size) * 0.8);
          }
        }
        
        /* Extra small screens */
        @media (max-width: 320px) {
          .title {
            font-size: 1.4rem;
          }
          
          .subtitle {
            font-size: 1rem;
          }
          
          :host {
            --timeflow-card-icon-size: calc(var(--timeflow-card-icon-size) * 0.7);
          }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .card {
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          }
        }
      </style>
      
      <ha-card class="timeflow-card ${this._expired ? 'expired' : ''}">
        <div class="card-content">
          <div class="header">
            <div class="title-section">
              <h2 class="title">${this._expired ? expired_text : title}</h2>
              <p class="subtitle">${this._getSubtitle()}</p>
            </div>
          </div>
          
          <div class="content">
            <div class="progress-section">
              <progress-circle
                class="progress-circle"
                progress="${this._getProgress()}"
                color="${progressColor}"
                size="${dynamicIconSize}"
                stroke-width="${dynamicStrokeWidth}"
              ></progress-circle>
            </div>
          </div>
        </div>
      </ha-card>
    `;

    // Cache DOM elements for selective updates
    this._domElements = {
      haCard: this.shadowRoot.querySelector('ha-card'),
      cardContent: this.shadowRoot.querySelector('.card-content'),
      title: this.shadowRoot.querySelector('.title'),
      subtitle: this.shadowRoot.querySelector('.subtitle'),
      progressCircle: this.shadowRoot.querySelector('progress-circle')
    };
    
    setTimeout(() => {
      this._updateDisplay();
      this._applyCardMod();
    }, 0);
  }

  // Performance optimization: Update only content that changes
  _updateContent() {
    if (!this._domElements) return;

    const {
      title = 'Countdown Timer',
      expired_text = 'Completed! 🎉'
    } = this._config;

    // Update title
    const titleText = this._expired ? expired_text : title;
    if (this._domElements.title && this._domElements.title.textContent !== titleText) {
      this._domElements.title.textContent = titleText;
    }

    // Update subtitle
    const subtitleText = this._getSubtitle();
    if (this._domElements.subtitle && this._domElements.subtitle.textContent !== subtitleText) {
      this._domElements.subtitle.textContent = subtitleText;
    }

    // Update progress circle
    const progress = this._getProgress();
    if (this._domElements.progressCircle) {
      this._domElements.progressCircle.setAttribute('progress', progress);
    }

    // Update expired state
    if (this._domElements.haCard) {
      this._domElements.haCard.classList.toggle('expired', this._expired);
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
    return '3.4.0';
  }
}

// Register custom elements
customElements.define('progress-circle', ProgressCircle);
customElements.define('timeflow-card', TimeFlowCard);

// Register the card
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'timeflow-card',
  name: 'TimeFlow Card',
  description: 'A beautiful countdown timer card with progress circle for Home Assistant',
  preview: true,
  documentationURL: 'https://github.com/Rishi8078/TimeFlow-Card'
});

console.info(
  `%c  TIMEFLOW-CARD  \n%c  Version ${TimeFlowCard.version}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);