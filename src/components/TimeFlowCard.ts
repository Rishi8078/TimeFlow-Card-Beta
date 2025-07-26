//TimeFlowCardBeta.ts
import { LitElement, html, css, TemplateResult, CSSResult } from 'lit';
import { property, state } from 'lit/decorators.js';

import { DateParser } from '../utils/DateParser';
import { ConfigValidator } from '../utils/ConfigValidator';
import { TemplateService } from '../services/TemplateService';
import { CountdownService } from '../services/CountdownService';
import { StyleManager } from '../utils/StyleManager';
import { HomeAssistant, CountdownState, CardConfig } from '../types/index';

export class TimeFlowCardBeta extends LitElement {
  // Reactive properties to trigger updates
  @property({ type: Object }) hass: HomeAssistant | null = null;
  @property({ type: Object }) config: CardConfig = {};

  // Internal reactive state for resolved config props and countdown state
  @state() private _resolvedConfig: CardConfig = {};
  @state() private _progress: number = 0;
  @state() private _countdown: CountdownState = {
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  };
  @state() private _expired: boolean = false;
  @state() private _error: string | null = null;

  // Timer ID
  private _timerId: ReturnType<typeof setInterval> | null = null;

  // Services instances (could be injected if needed)
  private templateService = new TemplateService();
  private countdownService = new CountdownService(this.templateService, DateParser);
  private styleManager = new StyleManager();

  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
        font-family: 'Roboto', 'Arial', sans-serif;
        color: var(--primary-text-color, #222);
        --progress-color: var(--progress-color, #4caf50);
      }
      ha-card {
        padding: 16px;
        border-radius: 12px;
        background: var(--card-background, var(--primary-background-color, #fff));
        box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgb(0 0 0 / 0.12));
        transition: background-color 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      ha-card.expired {
        background-color: var(--expired-background-color, #eee);
      }
      .title {
        font-size: 1.5em;
        font-weight: 600;
        margin: 0 0 4px 0;
      }
      .subtitle {
        font-size: 1em;
        color: var(--secondary-text-color, #666);
        margin: 0 0 16px 0;
      }
      .content {
        position: relative;
        min-height: 60px;
      }
      .progress-circle-container {
        position: absolute;
        bottom: 0;
        right: 0;
        z-index: 1;
      }
      progress-circle-beta {
        flex-shrink: 0;
      }
    `;
  }

  constructor() {
    super();
    // Default config stub
    this.config = this.getStubConfig();
    this._resolvedConfig = {};
  }

  // Provide default configuration stub (like original)
  static getStubConfig(): CardConfig {
    return {
      type: 'timeflow-card-beta',
      target_date: '2026-12-31T23:59:59',
      title: 'New Year Countdown',
      show_days: true,
      show_hours: true,
      show_minutes: true,
      show_seconds: true,
      progress_color: '#4caf50',
      stroke_width: 15,
      icon_size: 100,
      expired_animation: true,
      expired_text: 'Completed! 🎉',
    };
  }

  // Instance method for internal use
  getStubConfig(): CardConfig {
    return TimeFlowCardBeta.getStubConfig();
  }

  setConfig(config: CardConfig): void {
    try {
      ConfigValidator.validateConfig(config);
      this.config = { ...config };
      this._error = null;
      this.templateService.clearTemplateCache();
      this.styleManager.clearCache();
    } catch (err) {
      this._error = (err as Error).message || 'Invalid configuration';
      console.error('TimeFlow Card: Configuration error:', err);
    }
  }

  // Lit lifecycle: Called when component is first updated after initial render
  firstUpdated(): void {
    // Set up template service with card reference
    this.templateService.card = this;
    this._startCountdownUpdates();
  }

  // Cleanup on disconnect
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._stopCountdownUpdates();
  }

  updated(changedProperties: Map<string | number | symbol, unknown>): void {
    if (changedProperties.has('hass') || changedProperties.has('config')) {
      // Clear template caches on hass or config changes
      this.templateService.clearTemplateCache();
      this._updateCountdownAndRender();
    }
  }

  /**
   * Starts ticking the countdown every second
   */
  _startCountdownUpdates(): void {
    this._stopCountdownUpdates(); // clear previous interval
    this._updateCountdownAndRender().catch(console.error);
    this._timerId = setInterval(() => {
      this._updateCountdownAndRender().catch(console.error);
    }, 1000);
  }

  /**
   * Clears the countdown update timer
   */
  _stopCountdownUpdates(): void {
    if (this._timerId) {
      clearInterval(this._timerId);
      this._timerId = null;
    }
  }

  /**
   * Resolves templates and updates countdown data, then requests re-render
   */
  async _updateCountdownAndRender() {
    // If configuration error, skip updates
    if (this._error) return;

    // Clone config for resolution
    const resolvedConfig = { ...this.config };

    // List of config keys that can be templates
    const templateKeys = [
      'target_date',
      'creation_date',
      'title',
      'subtitle',
      'color',
      'background_color',
      'progress_color',
      'primary_color',
      'secondary_color'
    ];

    // Resolve templates where applicable
    for (const key of templateKeys) {
      if (typeof resolvedConfig[key] === 'string' && this.templateService.isTemplate(resolvedConfig[key])) {
        resolvedConfig[key] = await this.templateService.resolveValue(resolvedConfig[key]);
      }
    }

    // Store resolved config in reactive state
    this._resolvedConfig = resolvedConfig;

    // Calculate countdown data
    await this.countdownService.updateCountdown(resolvedConfig, this.hass);

    // Update countdown state
    this._countdown = { ...this.countdownService.getTimeRemaining() };
    this._expired = this.countdownService.isExpired();

    // Calculate progress (0-100)
    this._progress = await this.countdownService.calculateProgress(resolvedConfig, this.hass);

    this.requestUpdate();
  }

  render(): TemplateResult {
    if (this._error) {
      return html`<ha-card><div class="error">Configuration Error: ${this._error}</div></ha-card>`;
    }

    const {
      title = 'Countdown Timer',
      subtitle,
      color,
      background_color,
      progress_color,
      stroke_width = 15,
      icon_size = 100,
      expired_animation = true,
      expired_text = 'Completed! 🎉',
      width,
      height,
      aspect_ratio
    } = this._resolvedConfig;

    // Determine colors with fallback CSS vars
    const mainProgressColor = progress_color || color || 'var(--progress-color, #4caf50)';
    const cardBackground = background_color || 'var(--card-background, #fff)';

    // Calculate dynamic circle size based on card dimensions to prevent overflow
    const dynamicCircleSize = this.styleManager.calculateDynamicIconSize(width, height, aspect_ratio, icon_size);
    const dynamicStroke = this.styleManager.calculateDynamicStrokeWidth(dynamicCircleSize, stroke_width);

    // Generate dimension styles for the card
    const dimensionStyles = this.styleManager.generateCardDimensionStyles(width, height, aspect_ratio);
    
    // Compose CSS styles for card including dynamic background and dimensions
    const cardStyles = [
      `background: ${cardBackground}`,
      ...dimensionStyles
    ].join('; ');

    // Compose subtitle text
    const subtitleText = this._expired ? expired_text : (subtitle || this.countdownService.getSubtitle(this._resolvedConfig));

    // Compose title text with fallback
    const titleText = title || (this._expired ? expired_text : 'Countdown Timer');

    // Determine show expired class for card
    const expiredClass = (this._expired && expired_animation) ? 'expired' : '';

    return html`
      <ha-card class="${expiredClass}" style="${cardStyles}">
        <div class="title" aria-live="polite">${titleText}</div>
        <div class="subtitle" aria-live="polite">${subtitleText}</div>
        <div class="content" role="group" aria-label="Countdown Progress">
          <div class="progress-circle-container">
            <progress-circle-beta
              .progress="${this._progress}"
              .color="${mainProgressColor}"
              .size="${dynamicCircleSize}"
              .strokeWidth="${dynamicStroke}"
              aria-label="Countdown progress: ${Math.round(this._progress)}%"
            ></progress-circle-beta>
          </div>
        </div>
      </ha-card>
    `;
  }

  /**
   * Helper: Returns card size (in Home Assistant's grid rows approx)
   */
  getCardSize(): number {
    const { aspect_ratio = '2/1', height } = this.config;
    if (height) {
      const heightValue = parseInt(typeof height === 'string' ? height : height.toString());
      if (heightValue <= 100) return 1;
      if (heightValue <= 150) return 2;
      if (heightValue <= 200) return 3;
      return 4;
    }
    if (aspect_ratio) {
      const [width, height] = aspect_ratio.split('/').map(Number);
      if (!width || !height) return 3;
      const ratio = height / width;
      if (ratio >= 1.5) return 4;
      if (ratio >= 1) return 3;
      if (ratio >= 0.75) return 2;
      return 2;
    }
    return 3;
  }

  // Static version info
  static get version() {
    return '1.2.0-lit';
  }
}

