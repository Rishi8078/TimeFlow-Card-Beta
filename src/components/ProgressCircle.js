/**
 * ProgressCircleBeta - Modular progress circle component
 * Provides visual progress indication
 */
import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';

export class ProgressCircleBeta extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      --progress-color: var(--progress-color, #4CAF50);
    }
    
    svg {
      transform: rotate(-90deg);
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s ease;
      overflow: visible;
    }
    
    svg:focus {
      outline: 2px solid var(--primary-color, #03A9F4);
      outline-offset: 2px;
    }
    
    .progress-background {
      fill: none;
      stroke: rgba(255, 255, 255, 0.1);
    }
    
    .progress-circle {
      fill: none;
      stroke-linecap: round;
      transition: stroke-dashoffset 0.3s ease, stroke 0.3s ease;
    }
    
    .progress-text {
      fill: currentColor;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      font-weight: 600;
      text-anchor: middle;
      dominant-baseline: middle;
      opacity: 0.8;
    }
    
    /* Animation for progress changes */
    @keyframes progress-pulse {
      0% { opacity: 0.8; }
      50% { opacity: 1; }
      100% { opacity: 0.8; }
    }
    
    svg.updating .progress-circle {
      animation: progress-pulse 0.5s ease-in-out;
    }
  `;

  @property({ type: Number }) progress = 0;
  @property({ type: String }) color = '#4CAF50';
  @property({ type: Number }) size = 100;
  @property({ type: Number, attribute: 'stroke-width' }) strokeWidth = 15;

  render() {
    const radius = (this.size - this.strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (this.progress / 100) * circumference;

    // Validate calculations to prevent SVG errors
    if (isNaN(this.size) || isNaN(radius) || isNaN(circumference) || isNaN(strokeDashoffset)) {
      console.warn('TimeFlow Card: Invalid SVG calculations, using fallback values');
      return html`<div>Invalid circle dimensions</div>`;
    }

    return html`
      <svg 
        class="progress-circle-beta" 
        width="${this.size}" 
        height="${this.size}"
        style="--progress-color: ${this.color};"
      >
        <circle
          class="progress-background"
          cx="${this.size / 2}"
          cy="${this.size / 2}"
          r="${radius}"
          stroke-width="${this.strokeWidth}"
        />
        <circle
          class="progress-circle"
          cx="${this.size / 2}"
          cy="${this.size / 2}"
          r="${radius}"
          stroke="${this.color}"
          stroke-width="${this.strokeWidth}"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${strokeDashoffset}"
        />
        <text
          class="progress-text"
          x="${this.size / 2}"
          y="${this.size / 2}"
          fill="currentColor"
          font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif"
          font-size="${Math.max(12, this.size * 0.15)}px"
          font-weight="600"
          text-anchor="middle"
          dominant-baseline="middle"
          transform="rotate(90 ${this.size / 2} ${this.size / 2})"
          opacity="0.8"
        >
          ${Math.round(this.progress)}%
        </text>
      </svg>
    `;
  }

  /**
   * Static method to check if component is loaded
   * @returns {boolean} - True if component is defined
   */
  static isLoaded() {
    return customElements.get('progress-circle-beta') !== undefined;
  }

  /**
   * Get component version for debugging
   * @returns {string} - Component version
   */
  static get version() {
    return '2.0.0';
  }
}
