import { LitElement, html, css, CSSResult, TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

export class ProgressGridBeta extends LitElement {
  @property({ type: Number }) progress: number = 0;
  @property({ type: String }) color: string = '#4CAF50';
  @property({ type: String }) bgStroke: string = '#FFFFFF1A';
  @property({ type: Number }) bgOpacity: number | null = null;
  @property({ type: Boolean }) fullWidth: boolean = false;
  @property({ type: Number }) rows: number = 5;
  @property({ type: Number }) columns: number = 20;
  @property({ type: Number }) dotSize: number = 12;
  @property({ type: Number }) gap: number = 8;

  static get styles(): CSSResult {
    return css`
      :host {
        display: inline-block;
        vertical-align: middle;
        max-width: 100%;
      }

      .grid {
        display: grid;
        width: max-content;
      }

      .dot {
        display: block;
        border-radius: 999px;
        transition: background-color 0.25s ease, opacity 0.25s ease, transform 0.25s ease;
      }

      .dot.active {
        opacity: 1;
      }
    `;
  }

  updateProgress(progress: number): void {
    this.progress = progress;
  }

  getProgress(): number {
    return this.progress;
  }

  private _getSafeGridValue(value: number, fallback: number): number {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) && numericValue > 0 ? Math.floor(numericValue) : fallback;
  }

  render(): TemplateResult {
    const safeProgress = Math.max(0, Math.min(100, Number(this.progress) || 0));
    const rows = this._getSafeGridValue(this.rows, 5);
    const columns = this._getSafeGridValue(this.columns, 20);
    const dotSize = this._getSafeGridValue(this.dotSize, 12);
    const gap = this._getSafeGridValue(this.gap, 8);
    const totalDots = rows * columns;
    const filledDots = Math.min(totalDots, Math.max(0, Math.round((safeProgress / 100) * totalDots)));
    const inactiveOpacity = this.bgOpacity === null
      ? 1
      : Math.max(0, Math.min(100, Number(this.bgOpacity) || 0)) / 100;
    const gridTemplateColumns = this.fullWidth
      ? `repeat(${columns}, minmax(0, 1fr))`
      : `repeat(${columns}, ${dotSize}px)`;
    const gridWidth = this.fullWidth ? '100%' : 'max-content';

    return html`
      <div
        class="grid"
        style="
          width: ${gridWidth};
          grid-template-columns: ${gridTemplateColumns};
          gap: ${gap}px;
          justify-items: center;
        "
      >
        ${Array.from({ length: totalDots }, (_, index) => {
          const active = index < filledDots;
          return html`
            <span
              class="dot ${active ? 'active' : ''}"
              style="
                width: 100%;
                max-width: ${dotSize}px;
                aspect-ratio: 1 / 1;
                background-color: ${active ? this.color : this.bgStroke};
                opacity: ${active ? 1 : inactiveOpacity};
              "
            ></span>
          `;
        })}
      </div>
    `;
  }
}
