/**
 * TimeFlowCardBeta - Main card component with modular architecture
 * Orchestrates all modules and provides clean separation of concerns
 */
import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { DateParser } from '../utils/DateParser.js';
import { ConfigValidator } from '../utils/ConfigValidator.js';
import { TemplateService } from '../services/TemplateService.js';
import { CountdownService } from '../services/CountdownService.js';
import { StyleManager } from '../utils/StyleManager.js';
import { ProgressCircleBeta } from '../components/ProgressCircle.js';

export class TimeFlowCardBeta extends LitElement {
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
  @property({ type: Object }) hass = {};
  @state() _config = {};
  @state() _errorState = null;
  @state() _currentProgress = 0;
  @state() _subtitleText = '';
  @state() _isExpired = false;
  @state() _resolvedConfig = {};

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
      
      // Initialize reactive state with config change
      this._initializeReactiveState();
      
      // Trigger re-render
      this.requestUpdate();
    } catch (error) {
      this._errorState = error.message;
      console.error('TimeFlow Card: Configuration error:', error);
      this.requestUpdate();
    }
  }

  /**
   * Initialize reactive state properties when config changes
   */
  async _initializeReactiveState() {
    try {
      // Initialize basic properties
      console.log('TimeFlow Debug: Initializing reactive state with config:', this._config);
      this._subtitleText = this.countdownService.getSubtitle(this._config);
      this._currentProgress = await this.countdownService.calculateProgress(this._config, this.hass);
      this._isExpired = this.countdownService.isExpired();
      this._resolvedConfig = await this._resolveTemplateProperties();
      
      console.log('TimeFlow Debug: Reactive state initialized:', {
        subtitleText: this._subtitleText,
        currentProgress: this._currentProgress,
        isExpired: this._isExpired,
        resolvedConfig: this._resolvedConfig
      });
    } catch (error) {
      console.warn('TimeFlow Card: Error initializing reactive state:', error);
      // Set sensible defaults
      this._subtitleText = '';
      this._currentProgress = 0;
      this._isExpired = false;
      this._resolvedConfig = this._config;
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
      
      // Update reactive state properties - Lit will automatically re-render when these change
      const resolvedConfig = await this._resolveTemplateProperties();
      const newProgress = await this.countdownService.calculateProgress(this._config, this.hass);
      const newSubtitle = this.countdownService.getSubtitle(this._config);
      const newExpired = this.countdownService.isExpired();
      
      console.log('TimeFlow Debug: Updating countdown:', {
        oldProgress: this._currentProgress,
        newProgress,
        oldSubtitle: this._subtitleText,
        newSubtitle,
        oldExpired: this._isExpired,
        newExpired
      });
      
      this._currentProgress = newProgress;
      this._subtitleText = newSubtitle;
      this._isExpired = newExpired;
      this._resolvedConfig = resolvedConfig;
      
      // No need to manually call requestUpdate() - reactive properties trigger it automatically
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
    console.log('TimeFlow Debug: Render called with state:', {
      errorState: this._errorState,
      config: this._config,
      subtitleText: this._subtitleText,
      currentProgress: this._currentProgress,
      isExpired: this._isExpired,
      resolvedConfig: this._resolvedConfig
    });
    
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
   * Reactive content updates using Lit's state management
   * This method is no longer needed since Lit handles updates automatically
   * when reactive properties change. Left for backward compatibility.
   */
  async _updateContentOnly() {
    // No longer needed - Lit handles this automatically through reactive properties
    // The reactive properties are updated in _updateCountdown()
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
