// ProgressCircleBeta.ts
import { LitElement, html, css, CSSResult, TemplateResult, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';

export class ProgressCircleBeta extends LitElement {
  @property({ type: Number }) progress: number = 0;
  @property({ type: String }) color: string = '#4CAF50';
  @property({ type: Number }) size: number = 100;
  @property({ type: Number }) strokeWidth: number = 15;
  @property({ type: Boolean }) showProgressText: boolean = false;

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
        font-weight: bold;
        dominant-baseline: central;
        text-anchor: middle;
        pointer-events: none;
        user-select: none;
        /* Ensure text is always visible with high contrast */
        fill: var(--progress-text-color, #ffffff);
        /* Add text shadow for better visibility */
        filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
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
    this.showProgressText = false;
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

  willUpdate(_changed: PropertyValues): void {
    // Lifecycle hook for future use
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
    const safeProgress = Math.max(0, Math.min(100, Number(this.progress) || 0));
    const size = Number(this.size) || 100;
    const stroke = Number(this.strokeWidth) || 15;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (safeProgress / 100) * circumference;

    // Calculate responsive font size based on circle size with better scaling
    const fontSize = Math.max(8, Math.min(28, size * 0.18));
    
    // Calculate exact center coordinates
    const centerX = size / 2;
    const centerY = size / 2;

    // Debug logging to help troubleshoot
    console.log('ProgressCircle render - showProgressText:', this.showProgressText, 'progress:', safeProgress);
    
    if (this.showProgressText) {
      console.log('ProgressCircle - rendering text at:', centerX, centerY, 'fontSize:', fontSize);
    }

    return html`
      <div class="progress-wrapper" style="width:${size}px; height:${size}px;">
        <svg
          class="progress-circle-beta"
          height="${size}" width="${size}"
          style="overflow:visible;"
          viewBox="0 0 ${size} ${size}"
        >
          <!-- Background circle -->
          <circle
            class="progress-bg"
            cx="${centerX}" cy="${centerY}"
            r="${radius}"
            fill="none"
            stroke="#FFFFFF1A"
            stroke-width="${stroke}"
          ></circle>
          
          <!-- Progress circle -->
          <circle
            class="progress-bar"
            cx="${centerX}" cy="${centerY}"
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
              transform-origin: ${centerX}px ${centerY}px;
            "
          ></circle>

          <!-- Progress text - only render when showProgressText is true -->
          ${this.showProgressText ? html`
            <text
              x="${centerX}"
              y="${centerY}"
              class="progress-text"
              font-size="${fontSize}"
              font-family="inherit"
            >
              ${Math.round(safeProgress)}%
            </text>
          ` : ''}
        </svg>
      </div>
    `;
  }
}