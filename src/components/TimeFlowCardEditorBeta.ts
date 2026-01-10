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
        
        // Handle timer_source_type selector
        if ('timer_source_type' in value) {
            const sourceType = value.timer_source_type;
            // Clear all timer source fields when changing type
            if (sourceType !== 'entity') delete value.timer_entity;
            if (sourceType !== 'countdown') {
                delete value.target_date;
                delete value.creation_date;
            }
            if (sourceType !== 'assistants') {
                delete value.auto_discover_alexa;
                delete value.auto_discover_google;
            }
            // Don't store the virtual timer_source_type field
            delete value.timer_source_type;
        }
        
        // Merge with existing config and keep the card type
        const newConfig = { ...(this._config || {}), ...value, type: this._config?.type || 'custom:timeflow-card-beta' } as CardConfig;
        this._config = newConfig;
        this._fireConfigChanged(newConfig);
    }

    private _computeHelper(schema: any): string {
        const helpers: Record<string, string> = {
            'creation_date': 'Examples: "2024-01-01T00:00:00", "{{ now() }}", "{{ states(\'input_datetime.start\') }}"',
            'target_date': 'Examples: "2024-12-31T23:59:59", "{{ states(\'input_datetime.deadline\') }}"',
            'progress_color': 'Examples: "#FF0000", "red", "rgb(255,0,0)", "{{ states(\'input_text.color\') }}"',
            'background_color': 'Examples: "#00FF00", "blue", "rgba(0,255,0,0.5)", "{{ \'red\' if is_state(\'switch.alert\', \'on\') else \'green\' }}"',
            'text_color': 'Examples: "#333333", "white", "rgb(0,0,0)", "{{ states(\'input_text.color\') }}"',
            'title': 'Examples: "My Timer", "{{ states(\'sensor.event_name\') }}"',
            'subtitle': 'Shows time remaining by default; only change if you want custom text.',
            'expired_text': 'Examples: "Time\'s up!", "{{ states(\'input_text.message\') }}"',
            'expired_animation': 'A subtle animation when timer expires',
            'width': 'Card width in CSS units (e.g., "300px", "100%", "20em")',
            'height': 'Card height in CSS units (e.g., "200px", "auto", "15em")',
            'aspect_ratio': 'Width to height ratio (e.g., "16/9", "4/3", "1/1")',
            'auto_discover_alexa': 'Automatically find and use Alexa timers',
            'auto_discover_google': 'Automatically find and use Google Home timers',
            'timer_entity': 'Select a timer or sensor entity'
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
        const timerSourceType = cfg.timer_entity ? 'entity' : 
                                cfg.target_date ? 'countdown' :
                                (cfg.auto_discover_alexa || cfg.auto_discover_google) ? 'assistants' :
                                undefined;

        const schema = [
            // === TIMER SOURCE TYPE SELECTOR ===
            {
                name: 'timer_source_type',
                label: 'You need to add a timer source type',
                selector: {
                    select: {
                        options: [
                            { label: 'Entity Timer', value: 'entity' },
                            { label: 'Static Countdown', value: 'countdown' },
                            { label: 'Smart Assistants', value: 'assistants' }
                        ],
                        mode: 'dropdown'
                    }
                }
            },
            
            // === ENTITY TIMER ===
            ...(timerSourceType === 'entity' ? [
                { name: 'timer_entity', label: 'Timer Entity', selector: { entity: { domain: ['timer', 'sensor'] } } }
            ] : []),
            
            // === STATIC COUNTDOWN ===
            ...(timerSourceType === 'countdown' ? [
                { name: 'target_date', label: 'Target Date', selector: { text: {} } },
                { name: 'creation_date', label: 'Creation Date (Optional)', selector: { text: {} } }
            ] : []),
            
            // === SMART ASSISTANTS ===
            ...(timerSourceType === 'assistants' ? [
                {
                    type: 'grid',
                    schema: [
                        { name: 'auto_discover_alexa', label: 'Alexa Timers', selector: { boolean: {} } },
                        { name: 'auto_discover_google', label: 'Google Home Timers', selector: { boolean: {} } },
                    ]
                }
            ] : []),
            
            // === TEXT & MESSAGES ===
            { name: 'title', label: 'Title (Optional)', selector: { text: {} } },
            { name: 'subtitle', label: 'Subtitle (Optional)', selector: { text: {} } },
            { name: 'expired_text', label: 'Expired Text (Optional)', selector: { text: {} } },
            
            // === TIME UNITS (always visible) ===
            {
                type: 'grid',
                schema: [
                    { name: 'show_days', label: 'Days', selector: { boolean: {} } },
                    { name: 'show_hours', label: 'Hours', selector: { boolean: {} } },
                    { name: 'show_minutes', label: 'Minutes', selector: { boolean: {} } },
                    { name: 'show_seconds', label: 'Seconds', selector: { boolean: {} } },
                ]
            },
            
            // === APPEARANCE ===
            {
                type: "expandable",
                title: "Appearance",
                schema: [
                    { name: 'progress_color', label: 'Progress Color', selector: { text: {} } },
                    { name: 'background_color', label: 'Background Color', selector: { text: {} } },
                    { name: 'text_color', label: 'Text Color', selector: { text: {} } },
                    { name: 'expired_animation', label: 'Expired Animation', selector: { boolean: {} } },
                ]
            },
            
            // === LAYOUT ===
            {
                type: "expandable",
                title: "Layout",
                schema: [
                    {
                        type: 'grid',
                        schema: [
                            { name: 'width', label: 'Width', selector: { text: {} } },
                            { name: 'height', label: 'Height', selector: { text: {} } },
                        ]
                    },
                    { name: 'aspect_ratio', label: 'Aspect Ratio', selector: { text: {} } },
                ]
            },
            
            // === PROGRESS CIRCLE ===
            {
                type: "expandable",
                title: "Progress Circle",
                schema: [
                    {
                        type: "grid",
                        schema: [
                            { name: 'stroke_width', label: 'Stroke Width', selector: { number: { min: 1, max: 50 } } },
                            { name: 'icon_size', label: 'Icon Size', selector: { number: { min: 10, max: 350 } } },
                        ]
                    },
                    { name: 'show_progress_text', label: 'Show Progress Text', selector: { boolean: {} } },
                ]
            }
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
