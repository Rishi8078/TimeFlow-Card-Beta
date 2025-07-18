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
      target_date: '2024-12-31T23:59:59',
      creation_date: null,
      show_days: true,
      show_hours: true,
      show_minutes: true,
      show_seconds: true,
      color: '#ffffff',
      background_color: '#1976d2',
      progress_color: '#4CAF50',
      card_style: 'modern',
      size: 'medium' // small, medium, large
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
    
    if (typeof value === 'string' && value.includes('.') && this._hass && this._hass.states[value]) {
      const entity = this._hass.states[value];
      return entity.state;
    }
    
    return value;
  }

  _getMainDisplay() {
    const { show_days, show_hours, show_minutes, show_seconds } = this._config;
    
    if (this._expired) {
      return { value: '🎉', label: 'Completed!' };
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
    
    return { value: '🎉', label: 'Completed!' };
  }

  _getSubtitle() {
    if (this._expired) return 'Timer has expired';
    
    const { days, hours, minutes } = this._timeRemaining;
    
    if (days > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else if (hours > 0) {
      return `${minutes}m remaining`;
    } else {
      return `${minutes}m ${this._timeRemaining.seconds}s`;
    }
  }

  render() {
    const {
      title = 'Countdown Timer',
      show_days = true,
      show_hours = true,
      show_minutes = true,
      show_seconds = true,
      color = '#ffffff',
      background_color,
      progress_color,
      card_style = 'modern',
      size = 'medium',
      expired_text = 'Completed! 🎉'
    } = this._config;

    const bgColor = background_color || '#1976d2';
    const progressColor = progress_color || '#4CAF50';

    const sizeClasses = {
      small: 'size-small',
      medium: 'size-medium',
      large: 'size-large'
    };

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        }
        
        .card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 20px;
          border-radius: 16px;
          position: relative;
          overflow: hidden;
          background: ${bgColor};
          color: ${color};
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          border: none;
          aspect-ratio: 16:9;
        }
        
        .card.size-small {
          min-height: 100px;
          padding: 16px;
        }
        
        .card.size-medium {
          min-height: 120px;
          padding: 20px;
        }
        
        .card.size-large {
          min-height: 140px;
          padding: 24px;
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
          font-size: 2rem;
          font-weight: 500;
          margin: 0;
          opacity: 0.9;
          line-height: 1.3;
          letter-spacing: -0.01em;
        }
        
        .subtitle {
          font-size: 1.6rem;
          opacity: 0.65;
          margin: 0;
          font-weight: 400;
          line-height: 1.2;
        }
        
        .progress-section {
          flex-shrink: 0;
          margin-left: auto;
        }
        
        /* CONTENT SECTION - Like reference cards bottom area */
        .content {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 12px;
        }
        
        .main-display {
          flex: 1;
        }
        
        /* MAIN VALUE - Large number like reference cards */
        .main-value {
          font-size: 2.2rem;
          font-weight: 600;
          line-height: 0.9;
          margin: 0 0 2px 0;
          letter-spacing: -0.02em;
        }
        
        /* MAIN LABEL - Small text under main value */
        .main-label {
          font-size: 0.75rem;
          opacity: 0.7;
          margin: 0;
          font-weight: 400;
          text-transform: lowercase;
          line-height: 1.2;
        }
        
        .size-small .main-value {
          font-size: 2rem;
        }
        
        .size-large .main-value {
          font-size: 3rem;
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
        }
        
        /* Responsive design */
        @media (max-width: 480px) {
          .card {
            padding: 16px;
            border-radius: 12px;
          }
          
          .title {
            font-size: 1rem;
          }
          
          .main-value {
            font-size: 2rem;
          }
          
          .subtitle {
            font-size: 0.8rem;
          }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .card {
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          }
        }
      </style>
      
      <div class="card ${sizeClasses[size]} ${this._expired ? 'expired' : ''}">
        <div class="header">
          <div class="title-section">
            <h2 class="title">${this._expired ? expired_text : title}</h2>
            <p class="subtitle">${this._getSubtitle()}</p>
          </div>
        </div>
        
        <div class="content">
          <div class="main-display">
            <div class="main-value">${this._getMainDisplay().value}</div>
            <div class="main-label">${this._getMainDisplay().label}</div>
          </div>
          <div class="progress-section">
            <progress-circle
              class="progress-circle"
              progress="${this._getProgress()}"
              color="${progressColor}"
              size="100"
              stroke-width="15"
            ></progress-circle>
          </div>
        </div>
      </div>
    `;
    
    setTimeout(() => this._updateDisplay(), 0);
  }

  getCardSize() {
    const size = this._config.size || 'medium';
    return size === 'small' ? 2 : size === 'large' ? 4 : 3;
  }

  static get version() {
    return '3.0.0';
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