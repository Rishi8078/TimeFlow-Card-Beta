class PaceCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._interval = null;
  }

  static getConfigElement() {
    return document.createElement('pacecard-editor');
  }

  static getStubConfig() {
    return {
      type: 'custom:pacecard',
      title: 'Countdown Timer',
      target_date: '2024-12-31T23:59:59',
      show_days: true,
      show_hours: true,
      show_minutes: true,
      show_seconds: true,
      font_size: '2rem',
      color: '#ffffff',
      background_color: '#1976d2'
    };
  }

  setConfig(config) {
    if (!config.target_date) {
      throw new Error('You need to define a target_date');
    }
    this._config = { ...config };
    this.render();
    this.startTimer();
  }

  set hass(hass) {
    this._hass = hass;
  }

  connectedCallback() {
    this.startTimer();
  }

  disconnectedCallback() {
    this.stopTimer();
  }

  startTimer() {
    this.stopTimer();
    this.updateCountdown();
    this._interval = setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }

  stopTimer() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }

  updateCountdown() {
    const now = new Date().getTime();
    const targetDate = new Date(this._config.target_date).getTime();
    const difference = targetDate - now;

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      this.updateDisplay(days, hours, minutes, seconds);
    } else {
      this.updateDisplay(0, 0, 0, 0, true);
    }
  }

  updateDisplay(days, hours, minutes, seconds, expired = false) {
    const daysEl = this.shadowRoot.querySelector('.days .value');
    const hoursEl = this.shadowRoot.querySelector('.hours .value');
    const minutesEl = this.shadowRoot.querySelector('.minutes .value');
    const secondsEl = this.shadowRoot.querySelector('.seconds .value');
    const titleEl = this.shadowRoot.querySelector('.title');

    if (daysEl) daysEl.textContent = this.padZero(days);
    if (hoursEl) hoursEl.textContent = this.padZero(hours);
    if (minutesEl) minutesEl.textContent = this.padZero(minutes);
    if (secondsEl) secondsEl.textContent = this.padZero(seconds);

    if (expired && titleEl) {
      titleEl.textContent = this._config.expired_text || 'Timer Expired!';
      this.shadowRoot.querySelector('.countdown-container').classList.add('expired');
    }
  }

  padZero(num) {
    return num.toString().padStart(2, '0');
  }

  render() {
    const {
      title = 'Countdown Timer',
      show_days = true,
      show_hours = true,
      show_minutes = true,
      show_seconds = true,
      font_size = '2rem',
      color = '#ffffff',
      background_color = '#1976d2',
      border_radius = '8px'
    } = this._config;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: var(--paper-font-body1_-_font-family);
        }
        
        .card {
          background: ${background_color};
          color: ${color};
          border-radius: ${border_radius};
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          transition: all 0.3s ease;
        }
        
        .card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
          transform: translateY(-2px);
        }
        
        .title {
          text-align: center;
          font-size: 1.2rem;
          font-weight: bold;
          margin-bottom: 20px;
          opacity: 0.9;
        }
        
        .countdown-container {
          display: flex;
          justify-content: space-around;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }
        
        .time-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 60px;
        }
        
        .value {
          font-size: ${font_size};
          font-weight: bold;
          line-height: 1;
          text-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        
        .label {
          font-size: 0.7rem;
          margin-top: 5px;
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .separator {
          font-size: ${font_size};
          font-weight: bold;
          opacity: 0.6;
          animation: blink 1s infinite;
        }
        
        @keyframes blink {
          0%, 50% { opacity: 0.6; }
          51%, 100% { opacity: 0.2; }
        }
        
        .expired {
          animation: pulse 1s infinite;
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
        
        @media (max-width: 480px) {
          .countdown-container {
            flex-direction: column;
            gap: 10px;
          }
          
          .time-unit {
            min-width: auto;
          }
          
          .value {
            font-size: 1.5rem;
          }
        }
      </style>
      
      <div class="card">
        <div class="title">${title}</div>
        <div class="countdown-container">
          ${show_days ? `
            <div class="time-unit days">
              <div class="value">00</div>
              <div class="label">Days</div>
            </div>
          ` : ''}
          
          ${show_days && show_hours ? '<div class="separator">:</div>' : ''}
          
          ${show_hours ? `
            <div class="time-unit hours">
              <div class="value">00</div>
              <div class="label">Hours</div>
            </div>
          ` : ''}
          
          ${show_hours && show_minutes ? '<div class="separator">:</div>' : ''}
          
          ${show_minutes ? `
            <div class="time-unit minutes">
              <div class="value">00</div>
              <div class="label">Minutes</div>
            </div>
          ` : ''}
          
          ${show_minutes && show_seconds ? '<div class="separator">:</div>' : ''}
          
          ${show_seconds ? `
            <div class="time-unit seconds">
              <div class="value">00</div>
              <div class="label">Seconds</div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  getCardSize() {
    return 3;
  }

  static get version() {
    return '1.0.0';
  }
}

customElements.define('pacecard', PaceCard);

// Register the card with the custom card registry
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'pacecard',
  name: 'Pace Card',
  description: 'A beautiful countdown timer card for Home Assistant',
  preview: true,
  documentationURL: 'https://github.com/yourusername/pacecard'
});

console.info(
  `%c  PACE-CARD  \n%c  Version ${PaceCard.version}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);
