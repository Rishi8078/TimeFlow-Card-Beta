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
      this[name.replace('-', '')] = name === 'progress' ? Number(newValue) : newValue;
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
          stroke: rgba(255, 255, 255, 0.2);
        }
        
        .progress-bar {
          fill: none;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.5s ease;
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

// Main Pace Card Component
class PaceCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._timeRemaining = { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    this._expired = false;
    this._interval = null;
  }

  static getConfigElement() {
    return document.createElement('pace-card-editor');
  }

  static getStubConfig() {
    return {
      type: 'custom:pace-card',
      title: 'Countdown Timer',
      target_date: '2024-12-31T23:59:59',
      show_days: true,
      show_hours: true,
      show_minutes: true,
      show_seconds: true,
      color: '#ffffff',
      background_color: '#1976d2',
      progress_color: '#4CAF50',
      card_style: 'modern'
    };
  }

  setConfig(config) {
    if (!config.target_date) {
      throw new Error('You need to define a target_date');
    }
    this._config = { ...config };
    this.render();
    this._startTimer();
  }

  set hass(hass) {
    this._hass = hass;
  }

  connectedCallback() {
    this._startTimer();
  }

  disconnectedCallback() {
    this._stopTimer();
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

  _updateCountdown() {
    if (!this._config.target_date) return;
    
    const now = new Date().getTime();
    const targetDate = new Date(this._config.target_date).getTime();
    const difference = targetDate - now;

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      this._timeRemaining = { days, hours, minutes, seconds, total: difference };
      this._expired = false;
    } else {
      this._timeRemaining = { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      this._expired = true;
    }
    
    this._updateDisplay();
  }

  _updateDisplay() {
    const progressCircle = this.shadowRoot.querySelector('progress-circle');
    const mainValue = this.shadowRoot.querySelector('.main-value');
    const mainLabel = this.shadowRoot.querySelector('.main-label');
    const timeDisplay = this.shadowRoot.querySelector('.time-display');
    const card = this.shadowRoot.querySelector('.card');
    
    if (progressCircle) {
      progressCircle.setAttribute('progress', this._getProgress());
    }
    
    const mainDisplay = this._getMainDisplay();
    if (mainValue) mainValue.textContent = mainDisplay.value;
    if (mainLabel) mainLabel.textContent = mainDisplay.label;
    
    if (timeDisplay) {
      this._updateTimeDisplay(timeDisplay);
    }
    
    if (card) {
      card.classList.toggle('expired', this._expired);
    }
  }

  _updateTimeDisplay(timeDisplay) {
    const { show_days, show_hours, show_minutes, show_seconds } = this._config;
    const activeTimeUnits = [show_days, show_hours, show_minutes, show_seconds].filter(Boolean).length;
    const isSingleUnit = activeTimeUnits <= 1;
    
    if (isSingleUnit || this._expired) {
      timeDisplay.style.display = 'none';
      return;
    }
    
    timeDisplay.style.display = 'flex';
    
    const timeRows = [];
    if (show_days) {
      timeRows.push(`<div class="time-row"><span class="time-value">${this._timeRemaining.days}</span><span class="time-label">days</span></div>`);
    }
    if (show_hours) {
      timeRows.push(`<div class="time-row"><span class="time-value">${this._timeRemaining.hours}</span><span class="time-label">hours</span></div>`);
    }
    if (show_minutes) {
      timeRows.push(`<div class="time-row"><span class="time-value">${this._timeRemaining.minutes}</span><span class="time-label">min</span></div>`);
    }
    if (show_seconds) {
      timeRows.push(`<div class="time-row"><span class="time-value">${this._timeRemaining.seconds}</span><span class="time-label">sec</span></div>`);
    }
    
    timeDisplay.innerHTML = timeRows.join('');
  }

  _getProgress() {
    const targetDate = new Date(this._config.target_date).getTime();
    const creationDate = this._config.creation_date ? 
      new Date(this._config.creation_date).getTime() : 
      targetDate - (365 * 24 * 60 * 60 * 1000);
    
    const totalDuration = targetDate - creationDate;
    const elapsed = Date.now() - creationDate;
    const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    
    return this._expired ? 100 : progress;
  }

  _getMainDisplay() {
    const { show_days, show_hours, show_minutes, show_seconds } = this._config;
    
    if (this._expired) {
      return { value: '00', label: 'expired' };
    }
    
    if (show_days && this._timeRemaining.days > 0) {
      return { value: this._timeRemaining.days.toString(), label: 'days left' };
    } else if (show_hours && this._timeRemaining.hours > 0) {
      return { value: this._timeRemaining.hours.toString(), label: 'hours left' };
    } else if (show_minutes && this._timeRemaining.minutes > 0) {
      return { value: this._timeRemaining.minutes.toString(), label: 'minutes left' };
    } else if (show_seconds) {
      return { value: this._timeRemaining.seconds.toString(), label: 'seconds left' };
    }
    
    return { value: '00', label: 'expired' };
  }

  _adjustColor(color, amount) {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }

  render() {
    const {
      title = 'Countdown Timer',
      show_days = true,
      show_hours = true,
      show_minutes = true,
      show_seconds = true,
      color = '#ffffff',
      background_color = '#1976d2',
      progress_color = '#4CAF50',
      card_style = 'modern',
      expired_text = 'Timer Expired!'
    } = this._config;

    const activeTimeUnits = [show_days, show_hours, show_minutes, show_seconds].filter(Boolean).length;
    const isSingleUnit = activeTimeUnits <= 1;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: var(--paper-font-body1_-_font-family, 'Roboto', sans-serif);
        }
        
        .card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          border-radius: 16px;
          position: relative;
          overflow: hidden;
          min-height: 120px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          color: ${color};
        }
        
        .card.modern {
          background: linear-gradient(135deg, ${background_color}, ${this._adjustColor(background_color, -20)});
        }
        
        .card.classic {
          background: ${background_color};
        }
        
        .card.minimal {
          background: ${background_color};
          border: 1px solid var(--divider-color, #e0e0e0);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .title {
          font-size: 0.9rem;
          font-weight: 500;
          margin-bottom: 8px;
          opacity: 0.9;
          text-align: center;
        }
        
        .content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          width: 100%;
        }
        
        .progress-section {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        
        .progress-content {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: ${color};
        }
        
        .main-value {
          font-size: 1.8rem;
          font-weight: bold;
          line-height: 1;
        }
        
        .main-label {
          font-size: 0.7rem;
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 2px;
        }
        
        .time-display {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }
        
        .time-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          opacity: 0.9;
        }
        
        .time-value {
          font-weight: 600;
          min-width: 20px;
        }
        
        .time-label {
          font-size: 0.75rem;
          opacity: 0.7;
          text-transform: lowercase;
        }
        
        .expired {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        ${isSingleUnit ? `
          .content {
            flex-direction: column;
            gap: 12px;
          }
          
          .time-display {
            align-items: center;
          }
          
          .time-row {
            justify-content: center;
          }
        ` : ''}
        
        @media (max-width: 480px) {
          .card {
            padding: 16px;
          }
          
          .content {
            flex-direction: column;
            gap: 12px;
          }
          
          .main-value {
            font-size: 1.4rem;
          }
          
          .time-display {
            align-items: center;
          }
        }
      </style>
      
      <div class="card ${card_style} ${this._expired ? 'expired' : ''}">
        <div class="title">${this._expired ? expired_text : title}</div>
        
        <div class="content">
          <div class="progress-section">
            <progress-circle
              progress="${this._getProgress()}"
              color="${progress_color}"
              size="90"
              stroke-width="6"
            ></progress-circle>
            <div class="progress-content">
              <div class="main-value">${this._getMainDisplay().value}</div>
              <div class="main-label">${this._getMainDisplay().label}</div>
            </div>
          </div>
          
          <div class="time-display" style="display: ${!isSingleUnit && !this._expired ? 'flex' : 'none'}">
            <!-- Time rows will be populated by _updateTimeDisplay -->
          </div>
        </div>
      </div>
    `;
    
    // Initial display update
    setTimeout(() => this._updateDisplay(), 0);
  }

  getCardSize() {
    return 3;
  }

  static get version() {
    return '2.0.0';
  }
}

// Configuration Editor
class PaceCardEditor extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this.hass = null;
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    this._config = { ...config };
    this.render();
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
        
        input[type="text"], input[type="datetime-local"], select {
          width: 100%;
          padding: 8px;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          background: var(--card-background-color);
          color: var(--primary-text-color);
          font-family: inherit;
        }
        
        input[type="checkbox"] {
          margin-left: auto;
          transform: scale(1.2);
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
      </style>
      
      <div class="card-config">
        <div class="section-header">Basic Settings</div>
        
        <div class="config-row">
          <div class="config-label">Title</div>
          <div class="config-input">
            <input 
              type="text"
              value="${this._config.title || 'Countdown Timer'}"
              data-config-key="title"
              placeholder="Countdown Timer">
          </div>
        </div>
        
        <div class="config-row">
          <div class="config-label">Target Date</div>
          <div class="config-input">
            <input 
              type="datetime-local"
              value="${this._config.target_date ? this._config.target_date.slice(0, 16) : ''}"
              data-config-key="target_date">
          </div>
        </div>
        
        <div class="config-row">
          <div class="config-label">Creation Date</div>
          <div class="config-input">
            <input 
              type="datetime-local"
              value="${this._config.creation_date ? this._config.creation_date.slice(0, 16) : ''}"
              data-config-key="creation_date"
              placeholder="Optional: for progress calculation">
          </div>
        </div>
        
        <div class="config-row">
          <div class="config-label">Expired Text</div>
          <div class="config-input">
            <input 
              type="text"
              value="${this._config.expired_text || 'Timer Expired!'}"
              data-config-key="expired_text"
              placeholder="Timer Expired!">
          </div>
        </div>
        
        <div class="section-header">Display Options</div>
        
        <div class="config-row">
          <div class="config-label">Card Style</div>
          <div class="config-input">
            <select data-config-key="card_style">
              <option value="modern" ${this._config.card_style === 'modern' ? 'selected' : ''}>Modern</option>
              <option value="classic" ${this._config.card_style === 'classic' ? 'selected' : ''}>Classic</option>
              <option value="minimal" ${this._config.card_style === 'minimal' ? 'selected' : ''}>Minimal</option>
            </select>
          </div>
        </div>
        
        <div class="config-row">
          <div class="config-label">Show Days</div>
          <input 
            type="checkbox"
            ${this._config.show_days !== false ? 'checked' : ''}
            data-config-key="show_days">
        </div>
        
        <div class="config-row">
          <div class="config-label">Show Hours</div>
          <input 
            type="checkbox"
            ${this._config.show_hours !== false ? 'checked' : ''}
            data-config-key="show_hours">
        </div>
        
        <div class="config-row">
          <div class="config-label">Show Minutes</div>
          <input 
            type="checkbox"
            ${this._config.show_minutes !== false ? 'checked' : ''}
            data-config-key="show_minutes">
        </div>
        
        <div class="config-row">
          <div class="config-label">Show Seconds</div>
          <input 
            type="checkbox"
            ${this._config.show_seconds !== false ? 'checked' : ''}
            data-config-key="show_seconds">
        </div>
        
        <div class="section-header">Styling</div>
        
        <div class="config-row">
          <div class="config-label">Text Color</div>
          <div class="config-input">
            <input 
              type="color" 
              class="color-input"
              value="${this._config.color || '#ffffff'}"
              data-config-key="color">
          </div>
        </div>
        
        <div class="config-row">
          <div class="config-label">Background Color</div>
          <div class="config-input">
            <input 
              type="color" 
              class="color-input"
              value="${this._config.background_color || '#1976d2'}"
              data-config-key="background_color">
          </div>
        </div>
        
        <div class="config-row">
          <div class="config-label">Progress Color</div>
          <div class="config-input">
            <input 
              type="color" 
              class="color-input"
              value="${this._config.progress_color || '#4CAF50'}"
              data-config-key="progress_color">
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    this.shadowRoot.querySelectorAll('input, select').forEach(element => {
      element.addEventListener('input', this._valueChanged.bind(this));
      element.addEventListener('change', this._valueChanged.bind(this));
    });
  }

  _valueChanged(ev) {
    const target = ev.target;
    const configKey = target.dataset.configKey;
    
    if (!configKey) return;

    let value;
    if (target.type === 'checkbox') {
      value = target.checked;
    } else if (configKey === 'target_date' && target.value) {
      value = target.value + ':00';
    } else if (configKey === 'creation_date' && target.value) {
      value = target.value + ':00';
    } else {
      value = target.value;
    }

    if (this._config[configKey] !== value) {
      const newConfig = { ...this._config, [configKey]: value };
      this._config = newConfig;
      this._fireConfigChanged();
    }
  }

  _fireConfigChanged() {
    const event = new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  static get version() {
    return '2.0.0';
  }
}

// Register custom elements
customElements.define('progress-circle', ProgressCircle);
customElements.define('pace-card', PaceCard);
customElements.define('pace-card-editor', PaceCardEditor);

// Register the card
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'pace-card',
  name: 'Pace Card',
  description: 'A beautiful countdown timer card with progress circle for Home Assistant',
  preview: true,
  documentationURL: 'https://github.com/Rishi8078/Pacecard'
});

console.info(
  `%c  PACE-CARD  \n%c  Version ${PaceCard.version}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);
