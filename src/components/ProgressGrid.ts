import { LitElement, html, css, CSSResult, TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

export class ProgressGridBeta extends LitElement {
  @property({ type: Number }) progress: number = 0;
  @property({ type: String }) color: string = '#4CAF50';
  @property({ type: String }) bgStroke: string = '#FFFFFF1A';
  @property({ type: Number }) bgOpacity: number | null = null;
  @property({ type: Boolean }) fullWidth: boolean = false;
  @property({ type: Number }) minColumns: number = 10;
  @property({ type: Number }) rows: number = 5;
  @property({ type: Number }) columns: number = 20;
  @property({ type: Number }) totalDots: number = 0;  // >0 overrides rows x columns
  @property({ type: Number }) fixedRows: number = 0;  // >0 pins the row count when totalDots is set
  @property({ type: Number }) dotSize: number = 12;
  @property({ type: Number }) gap: number = 8;

  private _resizeObserver: ResizeObserver | null = null;
  private _containerWidth: number = 0;

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

  firstUpdated(): void {
    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    this._resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      if (Math.abs(width - this._containerWidth) > 0.5) {
        this._containerWidth = width;
        this.requestUpdate();
      }
    });

    this._resizeObserver.observe(this);
  }

  disconnectedCallback(): void {
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
    super.disconnectedCallback();
  }

  private _getSafeGridValue(value: number, fallback: number): number {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) && numericValue > 0 ? Math.floor(numericValue) : fallback;
  }

  /**
   * How much a candidate column count is penalised for leaving a half-empty last
   * row. Expressed in the same px units as the dot-size score, and kept small
   * enough that it only decides between layouts of near-identical dot size.
   */
  private _raggedPenalty(candidateColumns: number, balanceTotal: number): number {
    if (balanceTotal <= 0) {
      return 0;
    }
    const remainder = balanceTotal % candidateColumns;
    if (remainder === 0) {
      return 0;
    }
    return 0.35 * ((candidateColumns - remainder) / candidateColumns);
  }

  private _resolveResponsiveLayout(
    maxColumns: number,
    minColumns: number,
    preferredDotSize: number,
    gap: number,
    balanceTotal: number = 0
  ): { columns: number; dotSize: number } {
    if (!this.fullWidth || this._containerWidth <= 0) {
      return { columns: maxColumns, dotSize: preferredDotSize };
    }

    const availableWidth = this._containerWidth;
    const boundedMinColumns = Math.min(minColumns, maxColumns);
    const maxDotSize = preferredDotSize;
    const minDotSize = Math.max(4, Math.floor(preferredDotSize * 0.6));
    let bestColumns = maxColumns;
    let bestDotSize = preferredDotSize;
    let bestScore = Number.POSITIVE_INFINITY;

    for (let candidateColumns = boundedMinColumns; candidateColumns <= maxColumns; candidateColumns++) {
      const cellSize = (availableWidth - gap * (candidateColumns - 1)) / candidateColumns;
      if (cellSize < minDotSize) {
        continue;
      }

      const candidateDotSize = Math.min(cellSize, maxDotSize);
      const score = Math.abs(candidateDotSize - preferredDotSize)
        + this._raggedPenalty(candidateColumns, balanceTotal);

      if (score < bestScore - 1e-6 || (Math.abs(score - bestScore) <= 1e-6 && candidateColumns > bestColumns)) {
        bestScore = score;
        bestColumns = candidateColumns;
        bestDotSize = candidateDotSize;
      }
    }

    if (bestScore === Number.POSITIVE_INFINITY) {
      const fallbackColumns = Math.max(1, Math.floor((availableWidth + gap) / (minDotSize + gap)));
      const resolvedColumns = Math.max(1, Math.min(maxColumns, fallbackColumns));
      const resolvedCellSize = Math.max(2, (availableWidth - gap * (resolvedColumns - 1)) / resolvedColumns);
      return {
        columns: resolvedColumns,
        dotSize: Math.min(resolvedCellSize, maxDotSize)
      };
    }

    return {
      columns: bestColumns,
      dotSize: bestDotSize
    };
  }

  render(): TemplateResult {
    const safeProgress = Math.max(0, Math.min(100, Number(this.progress) || 0));
    const rows = this._getSafeGridValue(this.rows, 5);
    const requestedTotal = Number(this.totalDots);
    // An explicit dot count wins over rows x columns: the columns still flex with
    // the available width, and the grid simply wraps into as many rows as it needs.
    const hasExplicitTotal = Number.isFinite(requestedTotal) && requestedTotal > 0;
    const explicitTotal = hasExplicitTotal ? Math.floor(requestedTotal) : 0;
    const baseMaxColumns = this._getSafeGridValue(this.columns, 20);
    let maxColumns = hasExplicitTotal ? Math.min(baseMaxColumns, explicitTotal) : baseMaxColumns;
    let minColumns = Math.min(this._getSafeGridValue(this.minColumns, 10), maxColumns);

    // A requested row count is really a statement about columns: this is a plain
    // wrapping grid, so pinning the columns to ceil(total / rows) is what makes
    // that many rows appear. Both bounds are pinned so the responsive search has
    // a single candidate - it can still fall back to fewer columns (and so more
    // rows) if that many dots simply will not fit across the card.
    const requestedRows = this._getSafeGridValue(this.fixedRows, 0);
    if (hasExplicitTotal && requestedRows > 0) {
      const pinnedColumns = Math.ceil(explicitTotal / Math.min(requestedRows, explicitTotal));
      maxColumns = Math.max(1, pinnedColumns);
      minColumns = maxColumns;
    }

    // Only an explicit total gets balanced wrapping; the default rows x columns
    // grid is already exact, and scoring it would change how it has always laid out.
    const balanceTotal = hasExplicitTotal && requestedRows <= 0 ? explicitTotal : 0;
    const preferredDotSize = this._getSafeGridValue(this.dotSize, 12);
    const configuredGap = this._getSafeGridValue(this.gap, 8);

    let layout = this._resolveResponsiveLayout(maxColumns, minColumns, preferredDotSize, configuredGap, balanceTotal);
    let gap = configuredGap;
    if (layout.dotSize < preferredDotSize) {
      // Dots had to shrink, so shrink the spacing with them and lay out again -
      // the reclaimed width goes back into the dots, and the grid keeps reading
      // as one block instead of dots adrift in whitespace.
      gap = Math.max(2, Math.round(configuredGap * (layout.dotSize / preferredDotSize)));
      layout = this._resolveResponsiveLayout(maxColumns, minColumns, preferredDotSize, gap, balanceTotal);
    }

    const { columns, dotSize } = layout;
    const totalDots = hasExplicitTotal ? explicitTotal : rows * columns;
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
