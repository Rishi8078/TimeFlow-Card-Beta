import { LitElement, html, css, TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { CardConfig } from '../types/index';

/**
 * TimeFlow Card Editor Beta
 * Minimal graphical editor for the TimeFlow custom card (Beta version).
 * Emits `config-changed` events with the updated config.
 */
export class TimeFlowCardEditorBeta extends LitElement {
    @property({ type: Object }) hass: any = null;
    @state() private _config: CardConfig = { type: 'custom:timeflow-card-beta' } as CardConfig;

    setConfig(config: CardConfig) {
        this._config = { ...config } as CardConfig;
    }

    private _fireConfigChanged(config: CardConfig) {
        this.dispatchEvent(new CustomEvent('config-changed', {
            detail: { config },
            bubbles: true,
            composed: true
        }));
    }

    private _formChanged(ev: CustomEvent) {
        const value = ev.detail?.value || {};
        // Merge with existing config and keep the card type
        const newConfig = { ...(this._config || {}), ...value, type: this._config?.type || 'custom:timeflow-card-beta' } as CardConfig;
        this._config = newConfig;
        this._fireConfigChanged(newConfig);
    }

    private _computeHelper(schema: any): string {
        const helpers: Record<string, string> = {
            'creation_date': 'Start date for progress calculation. Examples: "2024-01-01T00:00:00", "{{ now() }}"',
            'target_date': 'End date for countdown. Examples: "2024-12-31T23:59:59", "{{ states(\'input_datetime.deadline\') }}"',
            'timer_entity': 'Use a Home Assistant timer entity instead of fixed dates',
            'auto_discover_alexa': 'Automatically find and display active Alexa timers',
            'auto_discover_google': 'Automatically find and display active Google Home timers',
            'progress_color': 'Color of the progress ring',
            'background_color': 'Card background color',
            'text_color': 'Color for title and subtitle text',
            'title': 'Card title (auto-generated from timer if empty)',
            'subtitle': 'Shows time remaining by default',
            'expired_text': 'Text shown when countdown completes',
            'expired_animation': 'Pulse animation when timer expires',
            'width': 'e.g., "300px", "100%"',
            'height': 'e.g., "200px", "auto"',
            'aspect_ratio': 'e.g., "16/9", "4/3", "1/1"',
            'show_progress_text': 'Display percentage inside the circle'
        };
        return helpers[schema.name] || '';
    }

    private _computeLabel(schema: any): string {
        if (schema.label)
            return schema.label;

        const key = (schema.name ?? '').toString();
        if (!key) return '';
        return key
            .split('_')
            .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
    }

    render(): TemplateResult {
        const cfg = this._config || {};

        const schema = [
            // === Basic Info ===
            { name: 'title', required: false, selector: { text: {} } },
            { name: 'subtitle', required: false, selector: { text: {} } },
            
            // === Timer Source (grouped together) ===
            {
                type: "expandable",
                title: "Timer Source",
                schema: [
                    { name: 'timer_entity', required: false, selector: { entity: { domain: ['timer', 'sensor'] } } },
                    { name: 'target_date', required: false, selector: { text: {} } },
                    { name: 'creation_date', required: false, selector: { text: {} } },
                    {
                        type: 'grid',
                        schema: [
                            { name: 'auto_discover_alexa', label: 'Auto-discover Alexa', required: false, selector: { boolean: {} } },
                            { name: 'auto_discover_google', label: 'Auto-discover Google', required: false, selector: { boolean: {} } },
                        ]
                    },
                ]
            },
            
            // === Time Units (visible, not collapsed) ===
            {
                type: 'grid',
                name: 'time_units',
                schema: [
                    { name: 'show_days', label: 'Days', required: false, selector: { boolean: {} } },
                    { name: 'show_hours', label: 'Hours', required: false, selector: { boolean: {} } },
                    { name: 'show_minutes', label: 'Minutes', required: false, selector: { boolean: {} } },
                    { name: 'show_seconds', label: 'Seconds', required: false, selector: { boolean: {} } },
                ]
            },
            
            // === Appearance ===
            {
                type: "expandable",
                title: "Appearance",
                schema: [
                    { name: 'progress_color', required: false, selector: { ui_color: {} } },
                    { name: 'background_color', required: false, selector: { ui_color: {} } },
                    { name: 'text_color', required: false, selector: { ui_color: {} } },
                    { name: 'expired_text', required: false, selector: { text: {} } },
                    { name: 'expired_animation', required: false, selector: { boolean: {} } },
                ]
            },
            
            // === Progress Circle ===
            {
                type: "expandable",
                title: "Progress Circle",
                schema: [
                    { name: 'icon_size', label: 'Circle Size', required: false, selector: { number: { min: 40, max: 200, step: 5, mode: 'slider' } } },
                    { name: 'stroke_width', label: 'Ring Thickness', required: false, selector: { number: { min: 2, max: 30, step: 1, mode: 'slider' } } },
                    { name: 'show_progress_text', label: 'Show Percentage', required: false, selector: { boolean: {} } },
                ]
            },
            
            // === Layout (advanced, collapsed) ===
            {
                type: "expandable",
                title: "Layout",
                schema: [
                    {
                        type: 'grid',
                        schema: [
                            { name: 'width', required: false, selector: { text: {} } },
                            { name: 'height', required: false, selector: { text: {} } },
                        ]
                    },
                    { name: 'aspect_ratio', required: false, selector: { text: {} } },
                ]
            },
        ];

        return html`
      <div style="padding: 8px;">
        <ha-form
          .hass=${this.hass}
          .data=${cfg}
          .schema=${schema}
          @value-changed=${(e: CustomEvent) => this._formChanged(e)}
          .computeLabel=${this._computeLabel}
          .computeHelper=${this._computeHelper}
        ></ha-form>
      </div>
    `;
    }

}

export default TimeFlowCardEditorBeta;
