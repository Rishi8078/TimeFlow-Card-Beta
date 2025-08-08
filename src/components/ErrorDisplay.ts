import { LitElement, html, css, TemplateResult, CSSResult } from 'lit';
import { property, state } from 'lit/decorators.js';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  suggestion?: string;
  value?: any;
}

export class ErrorDisplay extends LitElement {
  @property({ type: Array }) errors: ValidationError[] = [];
  @property({ type: String }) title: string = 'Configuration Error';
  @property({ type: Boolean }) allowReset: boolean = true;
  @property({ type: Boolean }) allowSafeMode: boolean = true;
  
  @state() private _showDetails: boolean = false;
  @state() private _showSuggestions: boolean = true;

  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
        font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif);
      }

      .error-container {
        background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
        border: 2px solid #f87171;
        border-radius: 16px;
        padding: 20px;
        margin: 8px;
        box-shadow: 0 4px 12px rgba(248, 113, 113, 0.15);
        color: #7f1d1d;
      }

      .error-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }

      .error-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0;
        color: #991b1b;
      }

      .error-icon {
        font-size: 1.5rem;
      }

      .error-summary {
        background: rgba(255, 255, 255, 0.7);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 16px;
        border-left: 4px solid #ef4444;
      }

      .error-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .error-item {
        background: rgba(255, 255, 255, 0.5);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 8px;
        border-left: 3px solid var(--error-color);
      }

      .error-item.critical {
        --error-color: #dc2626;
        background: rgba(220, 38, 38, 0.1);
      }

      .error-item.warning {
        --error-color: #d97706;
        background: rgba(217, 119, 6, 0.1);
        color: #92400e;
      }

      .error-item.info {
        --error-color: #2563eb;
        background: rgba(37, 99, 235, 0.1);
        color: #1e40af;
      }

      .error-field {
        font-weight: 600;
        font-family: 'Courier New', monospace;
        background: rgba(0, 0, 0, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.9em;
      }

      .error-message {
        margin: 4px 0;
        line-height: 1.4;
      }

      .error-suggestion {
        margin-top: 8px;
        padding: 8px;
        background: rgba(34, 197, 94, 0.1);
        border-radius: 6px;
        border-left: 3px solid #22c55e;
        font-size: 0.9em;
        color: #15803d;
      }

      .error-suggestion::before {
        content: "💡 ";
        margin-right: 4px;
      }

      .error-value {
        margin-top: 4px;
        font-family: 'Courier New', monospace;
        background: rgba(0, 0, 0, 0.05);
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.85em;
        word-break: break-all;
      }

      .error-actions {
        display: flex;
        gap: 8px;
        margin-top: 16px;
        flex-wrap: wrap;
      }

      .error-button {
        background: #dc2626;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 500;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .error-button:hover {
        background: #b91c1c;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
      }

      .error-button.secondary {
        background: #6b7280;
      }

      .error-button.secondary:hover {
        background: #4b5563;
      }

      .error-button.safe-mode {
        background: #059669;
      }

      .error-button.safe-mode:hover {
        background: #047857;
      }

      .toggle-button {
        background: transparent;
        border: 1px solid #dc2626;
        color: #dc2626;
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.85rem;
        transition: all 0.2s ease;
      }

      .toggle-button:hover {
        background: #dc2626;
        color: white;
      }

      .details-section {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(220, 38, 38, 0.2);
      }

      .technical-details {
        background: rgba(0, 0, 0, 0.05);
        border-radius: 6px;
        padding: 12px;
        font-family: 'Courier New', monospace;
        font-size: 0.8rem;
        white-space: pre-wrap;
        word-break: break-word;
        max-height: 200px;
        overflow-y: auto;
      }

      .severity-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .severity-critical {
        background: #dc2626;
        color: white;
      }

      .severity-warning {
        background: #d97706;
        color: white;
      }

      .severity-info {
        background: #2563eb;
        color: white;
      }

      .no-errors {
        text-align: center;
        color: #22c55e;
        font-weight: 500;
        padding: 20px;
      }

      @media (max-width: 480px) {
        .error-container {
          margin: 4px;
          padding: 16px;
        }
        
        .error-actions {
          flex-direction: column;
        }
        
        .error-button {
          justify-content: center;
        }
      }
    `;
  }

  render(): TemplateResult {
    if (!this.errors || this.errors.length === 0) {
      return html`
        <div class="error-container">
          <div class="no-errors">
            ✅ Configuration is valid
          </div>
        </div>
      `;
    }

    const criticalErrors = this.errors.filter(e => e.severity === 'critical');
    const warningErrors = this.errors.filter(e => e.severity === 'warning');
    const infoErrors = this.errors.filter(e => e.severity === 'info');

    return html`
      <div class="error-container">
        <div class="error-header">
          <h3 class="error-title">
            <span class="error-icon">⚠️</span>
            ${this.title}
          </h3>
          <button
            class="toggle-button"
            @click="${this._toggleDetails}"
          >
            ${this._showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        <div class="error-summary">
          <strong>Found ${this.errors.length} issue${this.errors.length !== 1 ? 's' : ''}:</strong>
          ${criticalErrors.length > 0 ? html`<br>• ${criticalErrors.length} critical error${criticalErrors.length !== 1 ? 's' : ''} (prevents card from loading)` : ''}
          ${warningErrors.length > 0 ? html`<br>• ${warningErrors.length} warning${warningErrors.length !== 1 ? 's' : ''} (may cause unexpected behavior)` : ''}
          ${infoErrors.length > 0 ? html`<br>• ${infoErrors.length} info message${infoErrors.length !== 1 ? 's' : ''} (recommendations)` : ''}
        </div>

        <ul class="error-list">
          ${this.errors.map(error => html`
            <li class="error-item ${error.severity}">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span class="severity-badge severity-${error.severity}">
                  ${error.severity}
                </span>
                <span class="error-field">${error.field}</span>
              </div>
              <div class="error-message">${error.message}</div>
              ${error.value !== undefined ? html`
                <div class="error-value">
                  Current value: ${typeof error.value === 'object' ? JSON.stringify(error.value) : String(error.value)}
                </div>
              ` : ''}
              ${error.suggestion && this._showSuggestions ? html`
                <div class="error-suggestion">${error.suggestion}</div>
              ` : ''}
            </li>
          `)}
        </ul>

        ${this._showDetails ? html`
          <div class="details-section">
            <h4>Technical Details:</h4>
            <div class="technical-details">${this._getTechnicalDetails()}</div>
          </div>
        ` : ''}

        <div class="error-actions">
          ${this.allowReset ? html`
            <button
              class="error-button"
              @click="${this._handleReset}"
            >
              🔄 Reset to Default
            </button>
          ` : ''}
          
          ${this.allowSafeMode && criticalErrors.length === 0 ? html`
            <button
              class="error-button safe-mode"
              @click="${this._handleSafeMode}"
            >
              🛡️ Load Safe Mode
            </button>
          ` : ''}
          
          <button
            class="error-button secondary"
            @click="${() => this._showSuggestions = !this._showSuggestions}"
          >
            ${this._showSuggestions ? '🙈 Hide' : '💡 Show'} Suggestions
          </button>
        </div>
      </div>
    `;
  }

  private _toggleDetails(): void {
    this._showDetails = !this._showDetails;
  }

  private _handleReset(): void {
    this.dispatchEvent(new CustomEvent('config-reset', {
      bubbles: true,
      composed: true
    }));
  }

  private _handleSafeMode(): void {
    this.dispatchEvent(new CustomEvent('config-safe-mode', {
      bubbles: true,
      composed: true
    }));
  }

  private _getTechnicalDetails(): string {
    return this.errors.map(error => 
      `[${error.severity.toUpperCase()}] ${error.field}: ${error.message}\n` +
      (error.value !== undefined ? `  Value: ${JSON.stringify(error.value)}\n` : '') +
      (error.suggestion ? `  Suggestion: ${error.suggestion}\n` : '')
    ).join('\n');
  }
}

// Register the custom element
customElements.define('error-display', ErrorDisplay);
