// ProgressCircleBeta.ts
import { LitElement, html, css, CSSResult, TemplateResult, PropertyValues } from 'lit';

export class ProgressCircleBeta extends LitElement {
  static properties = {
    progress: { type: Number },
    color: { type: String },
    size: { type: Number },
    strokeWidth: { type: Number }
  };

  progress: number = 0;
  color: string = '#4CAF50';
  size: number = 100;
  strokeWidth: number = 15;

  static get styles(): CSSResult {
    return css`
      :host {
        display: inline-block;
        vertical-align: middle;
      }
      .progress-wrapper {
        position: relative;
      }
      svg {
        display: block;
        margin: 0 auto;
      }
      .progress-text {
        font-size: 1.1em;
        font-weight: bold;
        fill: var(--progress-text-color, #444);
        dominant-baseline: middle;
        text-anchor: middle;
        /* Center in SVG */
        pointer-events: none;
        user-select: none;
      }
      .updating {
        transition: stroke-dashoffset 0.3s ease;
      }
    `;
  }

  constructor() {
    super();
    this.progress = 0;
    this.color = '#4CAF50';
    this.size = 100;
    this.strokeWidth = 15;
  }

  updated(changed: PropertyValues): void {
    // Animate stroke-dashoffset if progress changes
    if (changed.has('progress')) {
      const circle = this.renderRoot?.querySelector('.progress-bar') as HTMLElement;
      if (circle) {
        circle.classList.add('updating');
        setTimeout(() => {
          if (circle) circle.classList.remove('updating');
        }, 400);
      }
    }
  }

  // Expose imperative API for external modules, as before
  updateProgress(progress: number, animate: boolean = true): void {
    if (animate) {
      this.progress = progress;
    } else {
      // Instantly set progress, skips animation
      const bar = this.renderRoot?.querySelector('.progress-bar') as HTMLElement;
      this.progress = progress;
      if (bar) bar.style.transition = 'none';
      setTimeout(() => { if (bar) bar.style.transition = ''; }, 20);
    }
  }

  getProgress(): number {
    return this.progress;
  }

  render(): TemplateResult {
    // Calculations as before
    const safeProgress = Math.max(0, Math.min(100, Number(this.progress) || 0));
    const size = Number(this.size) || 100;
    const stroke = Number(this.strokeWidth) || 15;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (safeProgress / 100) * circumference;

    return html`
      <div class="progress-wrapper" style="width:${size}px; height:${size}px;">
        <svg
          class="progress-circle-beta"
          height="${size}" width="${size}"
          style="overflow:visible;"
        >
          <circle
            class="progress-bg"
            cx="${size / 2}" cy="${size / 2}"
            r="${radius}"
            fill="none"
            stroke="#FFFFFF1A"
            stroke-width="${stroke}"
          ></circle>
          <circle
            class="progress-bar"
            cx="${size / 2}" cy="${size / 2}"
            r="${radius}"
            fill="none"
            stroke="${this.color}"
            stroke-width="${stroke}"
            stroke-linecap="round"
            style="
              stroke-dasharray: ${circumference};
              stroke-dashoffset: ${offset};
              transition: stroke-dashoffset 0.3s ease;
              transform: rotate(-90deg);
              transform-origin: ${size / 2}px ${size / 2}px;
            "
          ></circle>
          <text
            x="50%" y="50%"
            class="progress-text"
            dominant-baseline="middle"
            text-anchor="middle"
            dy="2"
          >
            ${Math.round(safeProgress)}%
          </text>
        </svg>
      </div>
    `;
  }
}

// Register the custom element
customElements.define('progress-circle-beta', ProgressCircleBeta);
