import { LitElement, html, css, TemplateResult, CSSResult } from 'lit';
import { property } from 'lit/decorators.js';

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

  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
        font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif);
      }

      .error-container {
        background: #332022;
        border: 1px solid #D74133;
        border-radius: 8px;
        padding: 16px;
        margin: 8px;
        color: #ffffff;
      }

      .error-header {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
      }

      .error-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0;
        color: #D74133;
      }

      .error-icon {
        font-size: 1.5rem;
      }

      .error-summary {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 12px;
        border-left: 3px solid #D74133;
        color: #ffffff;
      }

      .error-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .error-item {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 8px;
        border-left: 3px solid var(--error-color);
        color: #ffffff;
      }

      .error-item.critical {
        --error-color: #D74133;
        background: rgba(215, 65, 51, 0.1);
      }

      .error-item.warning {
        --error-color: #D74133;
        background: rgba(215, 65, 51, 0.1);
      }

      .error-field {
        font-weight: 600;
        font-family: 'Courier New', monospace;
        background: rgba(255, 255, 255, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.9em;
        color: #D74133;
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
        color: #22c55e;
      }

      .error-suggestion::before {
        content: "💡 ";
        margin-right: 4px;
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
        background: #D74133;
        color: white;
      }

      .severity-warning {
        background: #D74133;
        color: white;
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
        </div>

        <div class="error-summary">
          <strong>Found ${relevantErrors.length} issue${relevantErrors.length !== 1 ? 's' : ''}:</strong>
          ${criticalErrors.length > 0 ? html`<br>• ${criticalErrors.length} critical error${criticalErrors.length !== 1 ? 's' : ''}` : ''}
          ${warningErrors.length > 0 ? html`<br>• ${warningErrors.length} warning${warningErrors.length !== 1 ? 's' : ''}` : ''}
        </div>

        <ul class="error-list">
          ${relevantErrors.map(error => html`
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
}

// Register the custom element
customElements.define('error-display', ErrorDisplay);
