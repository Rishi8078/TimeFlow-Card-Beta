import { LitElement, html, css } from 'lit';

interface PacecardConfig {
  entity: string;
  title?: string;
}

class Pacecard extends LitElement {
  public config!: PacecardConfig;

  static properties = {
    hass: {},
    config: {},
  };

  static styles = css`
    .container { display: flex; align-items: center; background: #222; border-radius: 16px; padding: 16px; color: #fff; }
    .progress { margin-right: 16px; }
    .label { font-weight: bold; }
  `;

  setConfig(config: PacecardConfig) { this.config = config; }
  set hass(hass: any) { (this as any).hass = hass; this.requestUpdate(); }

  render() {
    // @ts-ignore
    const hass = (this as any).hass;
    if (!this.config || !hass) return html``;
    const value = Number(hass.states[this.config.entity]?.state || 0);
    const percent = Math.min(100, Math.max(0, value));
    const radius = 25, circ = 2 * Math.PI * radius;
    return html`
      <div class="container">
        <svg class="progress" width="60" height="60">
          <circle cx="30" cy="30" r="${radius}" stroke="#444" stroke-width="8" fill="none"/>
          <circle cx="30" cy="30" r="${radius}" stroke="#4caf50" stroke-width="8" fill="none"
            stroke-dasharray="${circ}" stroke-dashoffset="${circ * (1 - percent / 100)}"
            style="transition:stroke-dashoffset 0.5s;"/>
        </svg>
        <div>
          <div class="label">${this.config.title || "Progress"}</div>
          <div>${percent}%</div>
        </div>
      </div>
    `;
  }
}

customElements.define('pacecard', Pacecard); 