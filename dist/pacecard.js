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

  static getStubConfig() {
    return {
      type: 'custom:pace-card',
      title: 'Countdown Timer',
      target_date: '2024-12-31T23:59:59', // Can also be an entity like 'sensor.target_date'
      creation_date: null, // Optional: can be a date string or entity like 'input_datetime.start_date'
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
      throw new Error('You need to define a target_date (can be a date string or entity ID)');
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
    const targetDateValue = this._getEntityValueOrString(this._config.target_date);
    if (!targetDateValue) return;
    
    const targetDate = new Date(targetDateValue).getTime();
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
    const targetDateValue = this._getEntityValueOrString(this._config.target_date);
    if (!targetDateValue) return 0;
    
    const targetDate = new Date(targetDateValue).getTime();
    
    let creationDate;
    if (this._config.creation_date) {
      const creationDateValue = this._getEntityValueOrString(this._config.creation_date);
      creationDate = creationDateValue ? new Date(creationDateValue).getTime() : targetDate - (365 * 24 * 60 * 60 * 1000);
    } else {
      creationDate = targetDate - (365 * 24 * 60 * 60 * 1000);
    }
    
    const totalDuration = targetDate - creationDate;
    const elapsed = Date.now() - creationDate;
    const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    
    return this._expired ? 100 : progress;
  }

  _getEntityValueOrString(value) {
    if (!value) return null;
    
    // If it starts with an entity domain (has a dot), treat as entity
    if (typeof value === 'string' && value.includes('.') && this._hass && this._hass.states[value]) {
      const entity = this._hass.states[value];
      return entity.state;
    }
    
    // Otherwise, treat as a direct value
    return value;
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
          font-size: 2.2rem;
          font-weight: bold;
          margin-bottom: 8px;
          opacity: 0.9;
          text-align: left;
        }
        
        .content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          width: 100%;
          position: relative;
        }
        
        .progress-section {
          position: absolute;
          bottom: 16px;
          right: 16px;
          z-index: 10;
        }
        
        .main-display {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          flex: 1;
        }
        
        .main-value {
          font-size: 2.2rem;
          font-weight: bold;
          line-height: 1;
        }
        
        .main-label {
          font-size: 0.9rem;
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 4px;
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
          
          .main-display {
            align-items: flex-start;
          }
          
          .time-display {
            align-items: flex-start;
          }
          
          .time-row {
            justify-content: flex-start;
          }
          
          .progress-section {
            position: relative;
            bottom: auto;
            right: auto;
            margin-top: 16px;
          }
        ` : ''}
        
        @media (max-width: 480px) {
          .card {
            padding: 16px;
          }
          
          .title {
            font-size: 1.8rem;
          }
          
          .content {
            flex-direction: column;
            gap: 12px;
          }
          
          .main-value {
            font-size: 1.8rem;
          }
          
          .main-display {
            align-items: flex-start;
          }
          
          .time-display {
            align-items: flex-start;
          }
          
          .progress-section {
            position: relative;
            bottom: auto;
            right: auto;
            margin-top: 12px;
          }
        }
      </style>
      
      <div class="card ${card_style} ${this._expired ? 'expired' : ''}">
        <div class="title">${this._expired ? expired_text : title}</div>
        
        <div class="content">
          <div class="main-display">
            <div class="main-value">${this._getMainDisplay().value}</div>
            <div class="main-label">${this._getMainDisplay().label}</div>
            
            <div class="time-display" style="display: ${!isSingleUnit && !this._expired ? 'flex' : 'none'}">
              <!-- Time rows will be populated by _updateTimeDisplay -->
            </div>
          </div>
          
          <div class="progress-section">
            <progress-circle
              progress="${this._getProgress()}"
              color="${progress_color}"
              size="60"
              stroke-width="8"
            ></progress-circle>
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

// Register custom elements
customElements.define('progress-circle', ProgressCircle);
customElements.define('pace-card', PaceCard);

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
