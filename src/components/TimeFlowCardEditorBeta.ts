import { LitElement, html, css, TemplateResult, CSSResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { CardConfig } from '../types/index';

/**
 * TimeFlow Card Editor Beta
 * Full-featured graphical editor for the TimeFlow custom card (Beta version).
 * Follows Bubble Card UX patterns: important fields visible, secondary in expandables.
 * Emits `config-changed` events with the updated config.
 */
export class TimeFlowCardEditorBeta extends LitElement {
    @property({ type: Object }) hass: any = null;
    @state() private _config: CardConfig = { type: 'custom:timeflow-card-beta' } as CardConfig;

    static get styles(): CSSResult {
        return css`
            .section-header {
                font-weight: 500;
                font-size: 14px;
                color: var(--primary-text-color);
                margin: 16px 0 8px 0;
                padding-bottom: 4px;
                border-bottom: 1px solid var(--divider-color);
            }
            .section-header:first-of-type {
                margin-top: 8px;
            }
            ha-form {
                display: block;
            }
        `;
    }

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
            // Timer Source
            'timer_entity': 'Select a timer, sensor, or input_datetime entity',
            'target_date': 'ISO date, entity, or template: "2024-12-31T23:59:59", "{{ states(\'input_datetime.deadline\') }}"',
            'creation_date': 'Start date for progress calculation (optional)',
            'auto_discover_alexa': 'Automatically find active Alexa timers',
            'auto_discover_google': 'Automatically find active Google Home timers',
            'prefer_labeled_timers': 'Prefer timers with labels over unnamed ones',
            
            // Display
            'title': 'Card title - supports templates: "{{ states(\'sensor.event_name\') }}"',
            'subtitle': 'Shows time remaining by default; only set for custom text',
            'expired_text': 'Text shown when countdown completes',
            
            // Colors
            'progress_color': 'Progress circle color (hex, name, rgb, or template)',
            'background_color': 'Card background color',
            'text_color': 'Text color for title and countdown',
            
            // Layout
            'width': 'Card width (e.g., "300px", "100%", "20em")',
            'height': 'Card height (e.g., "200px", "auto")',
            'aspect_ratio': 'Width:height ratio (e.g., "16/9", "4/3", "1/1")',
            
            // Progress Circle
            'stroke_width': 'Thickness of the progress circle ring',
            'icon_size': 'Size of the progress circle',
        };
        return helpers[schema.name] || '';
    }

    private _computeLabel(schema: any): string {
        if (schema.label)
            return schema.label;

        const labels: Record<string, string> = {
            'timer_entity': 'Timer Entity',
            'target_date': 'Target Date/Time',
            'creation_date': 'Start Date (for progress)',
            'auto_discover_alexa': 'Auto-discover Alexa Timers',
            'auto_discover_google': 'Auto-discover Google Timers',
            'prefer_labeled_timers': 'Prefer Labeled Timers',
            'show_alexa_device': 'Show Alexa Device Name',
            'show_days': 'Days',
            'show_hours': 'Hours',
            'show_minutes': 'Minutes',
            'show_seconds': 'Seconds',
            'show_months': 'Months',
            'expired_animation': 'Expired Animation',
            'expired_text': 'Expired Text',
            'progress_color': 'Progress Color',
            'background_color': 'Background Color',
            'text_color': 'Text Color',
            'stroke_width': 'Stroke Width',
            'icon_size': 'Circle Size',
            'aspect_ratio': 'Aspect Ratio',
        };

        if (labels[schema.name]) return labels[schema.name];

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
            // ═══════════════════════════════════════════════════════════
            // TIMER SOURCE - Most important, always visible at top
            // ═══════════════════════════════════════════════════════════
            { name: 'timer_entity', selector: { entity: { domain: ['timer', 'sensor', 'input_datetime'] } } },
            { name: 'target_date', selector: { text: {} } },
            { name: 'creation_date', selector: { text: {} } },
            
            // Smart Assistant Auto-Discovery (visible toggles)
            {
                type: 'grid',
                schema: [
                    { name: 'auto_discover_alexa', selector: { boolean: {} } },
                    { name: 'auto_discover_google', selector: { boolean: {} } },
                ]
            },
            
            // ═══════════════════════════════════════════════════════════
            // DISPLAY - Title, subtitle visible
            // ═══════════════════════════════════════════════════════════
            { name: 'title', selector: { text: {} } },
            { name: 'subtitle', selector: { text: {} } },
            { name: 'expired_text', selector: { text: {} } },
            
            // ═══════════════════════════════════════════════════════════
            // TIME UNITS - Always visible as grid
            // ═══════════════════════════════════════════════════════════
            {
                type: 'grid',
                schema: [
                    { name: 'show_months', selector: { boolean: {} } },
                    { name: 'show_days', selector: { boolean: {} } },
                    { name: 'show_hours', selector: { boolean: {} } },
                    { name: 'show_minutes', selector: { boolean: {} } },
                    { name: 'show_seconds', selector: { boolean: {} } },
                ]
            },
            
            // ═══════════════════════════════════════════════════════════
            // APPEARANCE - Expandable (secondary settings)
            // ═══════════════════════════════════════════════════════════
            {
                type: "expandable",
                title: "Appearance",
                icon: "mdi:palette",
                schema: [
                    { name: 'progress_color', selector: { text: {} } },
                    { name: 'background_color', selector: { text: {} } },
                    { name: 'text_color', selector: { text: {} } },
                    { name: 'expired_animation', selector: { boolean: {} } },
                ]
            },
            
            // ═══════════════════════════════════════════════════════════
            // LAYOUT - Expandable
            // ═══════════════════════════════════════════════════════════
            {
                type: "expandable",
                title: "Layout",
                icon: "mdi:page-layout-body",
                schema: [
                    {
                        type: 'grid',
                        schema: [
                            { name: 'width', selector: { text: {} } },
                            { name: 'height', selector: { text: {} } },
                        ]
                    },
                    { name: 'aspect_ratio', selector: { text: {} } },
                ]
            },
            
            // ═══════════════════════════════════════════════════════════
            // PROGRESS CIRCLE - Expandable
            // ═══════════════════════════════════════════════════════════
            {
                type: "expandable",
                title: "Progress Circle",
                icon: "mdi:circle-slice-3",
                schema: [
                    {
                        type: "grid",
                        schema: [
                            { name: 'stroke_width', selector: { number: { min: 1, max: 50, step: 1 } } },
                            { name: 'icon_size', selector: { number: { min: 10, max: 350, step: 5 } } },
                        ]
                    },
                ]
            },
            
            // ═══════════════════════════════════════════════════════════
            // ALEXA/GOOGLE OPTIONS - Expandable
            // ═══════════════════════════════════════════════════════════
            {
                type: "expandable",
                title: "Smart Assistant Options",
                icon: "mdi:home-assistant",
                schema: [
                    { name: 'prefer_labeled_timers', selector: { boolean: {} } },
                    { name: 'show_alexa_device', selector: { boolean: {} } },
                ]
            },
            
            // ═══════════════════════════════════════════════════════════
            // ACTIONS - Expandable
            // ═══════════════════════════════════════════════════════════
            {
                type: "expandable",
                title: "Tap Actions",
                icon: "mdi:gesture-tap",
                schema: [
                    { name: 'tap_action', selector: { ui_action: {} } },
                    { name: 'hold_action', selector: { ui_action: {} } },
                    { name: 'double_tap_action', selector: { ui_action: {} } },
                ]
            },
        ];

        return html`
            <ha-form
                .hass=${this.hass}
                .data=${cfg}
                .schema=${schema}
                @value-changed=${(e: CustomEvent) => this._formChanged(e)}
                .computeLabel=${this._computeLabel}
                .computeHelper=${this._computeHelper}
            ></ha-form>
        `;
    }

}

export default TimeFlowCardEditorBeta;
