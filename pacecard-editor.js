class PaceCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
  }

  set hass(hass) {
    this._hass = hass;
  }

  setConfig(config) {
    this._config = { ...config };
    this.render();
    this.attachEventListeners();
  }

  get _title() {
    return this._config.title || 'Countdown Timer';
  }

  get _target_date() {
    return this._config.target_date || '';
  }

  get _show_days() {
    return this._config.show_days !== false;
  }

  get _show_hours() {
    return this._config.show_hours !== false;
  }

  get _show_minutes() {
    return this._config.show_minutes !== false;
  }

  get _show_seconds() {
    return this._config.show_seconds !== false;
  }

  get _font_size() {
    return this._config.font_size || '2rem';
  }

  get _color() {
    return this._config.color || '#ffffff';
  }

  get _background_color() {
    return this._config.background_color || '#1976d2';
  }

  get _border_radius() {
    return this._config.border_radius || '8px';
  }

  get _expired_text() {
    return this._config.expired_text || 'Timer Expired!';
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .card-config {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
          background: var(--primary-background-color);
          border-radius: 8px;
        }
        
        .config-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        
        .config-label {
          min-width: 120px;
          font-weight: 500;
          color: var(--primary-text-color);
        }
        
        .config-input {
          flex: 1;
          min-width: 200px;
        }
        
        paper-input, paper-dropdown-menu {
          width: 100%;
        }
        
        paper-checkbox {
          margin-left: auto;
        }
        
        .section-header {
          font-size: 1.1rem;
          font-weight: bold;
          color: var(--primary-text-color);
          margin: 16px 0 8px 0;
          border-bottom: 1px solid var(--divider-color);
          padding-bottom: 4px;
        }
        
        .color-input {
          width: 60px;
          height: 40px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .preview-card {
          margin-top: 20px;
          padding: 16px;
          border: 1px solid var(--divider-color);
          border-radius: 8px;
          background: var(--card-background-color);
        }
        
        .preview-title {
          font-weight: bold;
          margin-bottom: 8px;
          color: var(--primary-text-color);
        }
      </style>
      
      <div class="card-config">
        <div class="section-header">Basic Settings</div>
        
        <div class="config-row">
          <div class="config-label">Title</div>
          <div class="config-input">
            <paper-input 
              .value="${this._title}"
              .configValue="${'title'}"
              @value-changed="${this._valueChanged}"
              placeholder="Countdown Timer">
            </paper-input>
          </div>
        </div>
        
        <div class="config-row">
          <div class="config-label">Target Date</div>
          <div class="config-input">
            <paper-input 
              .value="${this._target_date}"
              .configValue="${'target_date'}"
              @value-changed="${this._valueChanged}"
              placeholder="2024-12-31T23:59:59"
              helper-text="Format: YYYY-MM-DDTHH:mm:ss">
            </paper-input>
          </div>
        </div>
        
        <div class="config-row">
          <div class="config-label">Expired Text</div>
          <div class="config-input">
            <paper-input 
              .value="${this._expired_text}"
              .configValue="${'expired_text'}"
              @value-changed="${this._valueChanged}"
              placeholder="Timer Expired!">
            </paper-input>
          </div>
        </div>
        
        <div class="section-header">Display Options</div>
        
        <div class="config-row">
          <div class="config-label">Show Days</div>
          <paper-checkbox 
            ?checked="${this._show_days}"
            .configValue="${'show_days'}"
            @change="${this._valueChanged}">
          </paper-checkbox>
        </div>
        
        <div class="config-row">
          <div class="config-label">Show Hours</div>
          <paper-checkbox 
            ?checked="${this._show_hours}"
            .configValue="${'show_hours'}"
            @change="${this._valueChanged}">
          </paper-checkbox>
        </div>
        
        <div class="config-row">
          <div class="config-label">Show Minutes</div>
          <paper-checkbox 
            ?checked="${this._show_minutes}"
            .configValue="${'show_minutes'}"
            @change="${this._valueChanged}">
          </paper-checkbox>
        </div>
        
        <div class="config-row">
          <div class="config-label">Show Seconds</div>
          <paper-checkbox 
            ?checked="${this._show_seconds}"
            .configValue="${'show_seconds'}"
            @change="${this._valueChanged}">
          </paper-checkbox>
        </div>
        
        <div class="section-header">Styling</div>
        
        <div class="config-row">
          <div class="config-label">Font Size</div>
          <div class="config-input">
            <paper-input 
              .value="${this._font_size}"
              .configValue="${'font_size'}"
              @value-changed="${this._valueChanged}"
              placeholder="2rem">
            </paper-input>
          </div>
        </div>
        
        <div class="config-row">
          <div class="config-label">Text Color</div>
          <div class="config-input">
            <input 
              type="color" 
              class="color-input"
              .value="${this._color}"
              @change="${this._colorChanged}"
              data-config-value="color">
          </div>
        </div>
        
        <div class="config-row">
          <div class="config-label">Background Color</div>
          <div class="config-input">
            <input 
              type="color" 
              class="color-input"
              .value="${this._background_color}"
              @change="${this._colorChanged}"
              data-config-value="background_color">
          </div>
        </div>
        
        <div class="config-row">
          <div class="config-label">Border Radius</div>
          <div class="config-input">
            <paper-input 
              .value="${this._border_radius}"
              .configValue="${'border_radius'}"
              @value-changed="${this._valueChanged}"
              placeholder="8px">
            </paper-input>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Event listeners are attached through the template
  }

  _valueChanged(ev) {
    if (!this._config || !this._hass) {
      return;
    }

    const target = ev.target;
    const configValue = target.configValue;
    
    if (!configValue) {
      return;
    }

    let value;
    if (target.type === 'checkbox') {
      value = target.checked;
    } else {
      value = target.value;
    }

    if (this._config[configValue] === value) {
      return;
    }

    const newConfig = {
      ...this._config,
      [configValue]: value
    };

    this._config = newConfig;
    this._configChanged();
  }

  _colorChanged(ev) {
    const target = ev.target;
    const configValue = target.dataset.configValue;
    const value = target.value;

    if (!configValue || this._config[configValue] === value) {
      return;
    }

    const newConfig = {
      ...this._config,
      [configValue]: value
    };

    this._config = newConfig;
    this._configChanged();
  }

  _configChanged() {
    // Fire the config changed event
    const event = new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  static get version() {
    return '1.0.0';
  }
}

customElements.define('pacecard-editor', PaceCardEditor);
