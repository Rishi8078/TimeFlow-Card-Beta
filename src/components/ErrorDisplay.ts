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
  @property({ type: String }) title: string = 'Configuration Issues';
  
  @state() private _showDetails: boolean = false;

  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
        font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif);
      }

      .error-container {
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        border: 1px solid #f59e0b;
        border-radius: 12px;
        padding: 16px;
        margin: 8px;
        box-shadow: 0 2px 8px rgba(245, 158, 11, 0.1);
        color: #92400e;
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
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0;
        color: #b45309;
      }

      .error-icon {
        font-size: 1.5rem;
      }

      .error-summary {
        background: rgba(255, 255, 255, 0.7);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 12px;
        border-left: 3px solid #f59e0b;
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

      .toggle-button {
        background: transparent;
        border: 1px solid #f59e0b;
        color: #f59e0b;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.8rem;
        transition: all 0.2s ease;
      }

      .toggle-button:hover {
        background: #f59e0b;
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
      return html``;
    }

    // Filter out info messages, only show critical and warning
    const relevantErrors = this.errors.filter(e => e.severity === 'critical' || e.severity === 'warning');
    
    if (relevantErrors.length === 0) {
      return html``;
    }

    const criticalErrors = relevantErrors.filter(e => e.severity === 'critical');
    const warningErrors = relevantErrors.filter(e => e.severity === 'warning');

    return html`
      <div class="error-container">
        <div class="error-header">
          <h3 class="error-title">
            <span class="error-icon">⚠️</span>
            ${this.title}
          </h3>
          ${relevantErrors.length > 3 ? html`
            <button
              class="toggle-button"
              @click="${this._toggleDetails}"
            >
              ${this._showDetails ? 'Less' : 'More'}
            </button>
          ` : ''}
        </div>

        <div class="error-summary">
          <strong>Found ${relevantErrors.length} issue${relevantErrors.length !== 1 ? 's' : ''}:</strong>
          ${criticalErrors.length > 0 ? html`<br>• ${criticalErrors.length} critical error${criticalErrors.length !== 1 ? 's' : ''}` : ''}
          ${warningErrors.length > 0 ? html`<br>• ${warningErrors.length} warning${warningErrors.length !== 1 ? 's' : ''}` : ''}
        </div>

        <ul class="error-list">
          ${(this._showDetails ? relevantErrors : relevantErrors.slice(0, 3)).map(error => html`
            <li class="error-item ${error.severity}">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span class="severity-badge severity-${error.severity}">
                  ${error.severity}
                </span>
                <span class="error-field">${error.field}</span>
              </div>
              <div class="error-message">${error.message}</div>
              ${error.suggestion ? html`
                <div class="error-suggestion">${error.suggestion}</div>
              ` : ''}
            </li>
          `)}
        </ul>
      </div>
    `;
  }

  private _toggleDetails(): void {
    this._showDetails = !this._showDetails;
  }
}

// Register the custom element
customElements.define('error-display', ErrorDisplay);
