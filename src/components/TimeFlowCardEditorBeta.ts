import { LitElement, html, css, TemplateResult, CSSResult, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { CardConfig } from '../types/index';
import { computeSchema, styleSchema } from '../editor/schema';
import { SourceType, applySource, availableSources, getSourceType, resolveSource, usesDateFields } from '../editor/capabilities';
import { computeLabel, computeHelper } from '../editor/labels';

const SOURCE_HELPERS: Record<string, string> = {
    date: 'Count to a date or entity you choose',
    timer: 'Follow one timer, sensor or input_datetime entity',
    auto: 'Follow whichever Alexa or Google Home timers are running',
    countdowns: 'Show the countdowns pinned to this card, plus any discovered timers',
};

/**
 * TimeFlow Card Editor Beta
 * Full-featured graphical editor for the TimeFlow custom card (Beta version).
 * Emits `config-changed` events with the updated config.
 */
export class TimeFlowCardEditorBeta extends LitElement {
    @property({ type: Object }) hass: any = null;
    @state() private _config: CardConfig = { type: 'custom:timeflow-card-beta' } as CardConfig;

    // A source the user has picked that the config cannot yet express - picking
    // "Entity" before choosing an entity is the case that matters. Held here
    // rather than written to the config so no synthetic key reaches their YAML.
    @state() private _pendingSource: SourceType | null = null;

    // Track which date fields are in "template mode"
    @state() private _targetDateTemplateMode: boolean = false;
    @state() private _creationDateTemplateMode: boolean = false;
    @state() private _countUpGoalDateTemplateMode: boolean = false;

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
            
            /* Date field with mode toggle */
            .date-field-container {
                display: flex;
                flex-direction: column;
                gap: 4px;
                margin-bottom: 16px;
            }
            .date-field-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .date-field-label {
                font-weight: 500;
                font-size: 14px;
                color: var(--primary-text-color);
            }
            .mode-toggle {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 12px;
                color: var(--secondary-text-color);
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 4px;
                background: var(--secondary-background-color);
                border: none;
            }
            .mode-toggle:hover {
                background: var(--primary-color);
                color: var(--text-primary-color);
            }
            .mode-toggle ha-icon {
                --mdc-icon-size: 16px;
            }
            .date-helper {
                font-size: 12px;
                color: var(--secondary-text-color);
                margin-top: 4px;
            }
            ha-textfield, input[type="datetime-local"] {
                width: 100%;
            }
            input[type="datetime-local"] {
                padding: 12px;
                border: 1px solid var(--divider-color);
                border-radius: 4px;
                background: var(--card-background-color);
                color: var(--primary-text-color);
                font-size: 14px;
            }
            input[type="datetime-local"]:focus {
                outline: none;
                border-color: var(--primary-color);
            }
            .editor-section-label {
                font-weight: 500;
                font-size: 14px;
                color: var(--primary-text-color);
            }
            .style-picker {
                display: flex;
                flex-direction: column;
                gap: 6px;
                padding: 8px 0 0 0;
            }
            .source-picker {
                display: flex;
                flex-direction: column;
                gap: 6px;
                padding: 8px 0 4px 0;
            }
            .source-picker ha-control-select {
                /* ha-control-select defaults to 40px, which assumes an icon or
                   a label. Stacking both needs the taller variant Home
                   Assistant uses for its own icon+label selects, or the text
                   collides with the icon above it. */
                --control-select-thickness: 64px;
                --control-select-border-radius: 14px;
                --control-select-padding: 6px;
            }
            .source-picker-helper {
                font-size: 12px;
                color: var(--secondary-text-color);
            }
            .date-fields-section {
                display: flex;
                flex-direction: column;
                gap: 16px;
                padding: 16px 0;
            }
        `;
    }

    setConfig(config: CardConfig) {
        this._config = { ...config } as CardConfig;

        // The remembered choice is dropped only when the config names a
        // *different* source - a YAML edit, say. It deliberately survives the
        // config agreeing with it, because clearing the entity afterwards would
        // otherwise read as 'date' and throw the user out of Entity mode
        // mid-edit.
        const inferred = getSourceType(this._config);
        if (this._pendingSource && inferred !== 'date' && inferred !== this._pendingSource) {
            this._pendingSource = null;
        }

        // Auto-detect if existing values are templates
        const targetDate = config.target_date || '';
        const creationDate = config.creation_date || '';
        const countUpGoalDate = config.count_up_goal_date || '';
        this._targetDateTemplateMode = this._isTemplate(targetDate);
        this._creationDateTemplateMode = this._isTemplate(creationDate);
        this._countUpGoalDateTemplateMode = this._isTemplate(countUpGoalDate);
    }

    private _isTemplate(value: string): boolean {
        return value.includes('{{') || value.includes('{%');
    }

    private _convertToDatetimeLocal(isoDate: string): string {
        if (!isoDate || this._isTemplate(isoDate)) return '';
        // Convert ISO format to datetime-local format (YYYY-MM-DDTHH:MM)
        // Use local time components to avoid timezone shift from toISOString()
        try {
            const date = new Date(isoDate);
            if (isNaN(date.getTime())) return '';
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        } catch {
            return '';
        }
    }

    private _convertFromDatetimeLocal(localDate: string): string {
        if (!localDate) return '';
        // Convert datetime-local to ISO format with seconds
        return localDate + ':00';
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
        const wasExplicit = this._config?.compact_format !== undefined;
        const previousDisplayedCompactFormat = this._getEffectiveCompactFormat();
        // Merge with existing config and keep the card type
        const newConfig = { ...(this._config || {}), ...value, type: this._config?.type || 'custom:timeflow-card-beta' } as CardConfig;

        if (!wasExplicit && value.compact_format === previousDisplayedCompactFormat) {
            delete newConfig.compact_format;
        }

        this._config = newConfig;
        this._fireConfigChanged(newConfig);
    }

    /**
     * Where the card gets its countdown. Rendered outside ha-form for two
     * reasons: ha-form has no selector that looks like this, and a schema field
     * named `source_type` would be echoed straight back into the config on
     * every change - the source is inferred from real keys, never stored.
     */
    private _renderSourcePicker(config: CardConfig, source: SourceType): TemplateResult {
        const labels: Record<SourceType, { label: string; icon: string }> = {
            date: { label: 'Date', icon: 'mdi:calendar' },
            timer: { label: 'Entity', icon: 'mdi:timer-outline' },
            auto: { label: 'Smart Timers', icon: 'mdi:creation-outline' },
            countdowns: { label: 'Pinned', icon: 'mdi:format-list-bulleted' },
        };

        const options = availableSources(config).map((value) => ({
            value,
            label: labels[value].label,
            icon: html`<ha-icon .icon=${labels[value].icon}></ha-icon>`,
        }));

        return html`
            <div class="source-picker">
                <span class="editor-section-label">Countdown Source</span>
                <ha-control-select
                    .options=${options}
                    .value=${source}
                    @value-changed=${this._sourceChanged}
                ></ha-control-select>
                <span class="source-picker-helper">${SOURCE_HELPERS[source]}</span>
            </div>
        `;
    }

    /**
     * Switching source clears the selectors belonging to the others, so the
     * picker always agrees with what the card will actually render. Only
     * selectors are cleared - a target_date survives a trip through Entity mode
     * and is still there on the way back.
     */
    private _sourceChanged(ev: CustomEvent): void {
        ev.stopPropagation();
        const next = ev.detail?.value as SourceType | undefined;
        if (!next || next === resolveSource(this._config, this._pendingSource)) return;

        const updated = applySource(this._config, next);
        this._config = updated;
        // Remember the choice when the config alone cannot show it - "Entity"
        // has nothing to store until an entity is picked.
        this._pendingSource = getSourceType(updated) === next ? null : next;
        this._fireConfigChanged(updated);
    }

    private _renderDateField(
        configKey: 'target_date' | 'creation_date' | 'count_up_goal_date',
        label: string,
        helper: string,
        templateMode: boolean,
        toggleCallback: () => void
    ): TemplateResult {
        const value = this._config[configKey] || '';

        return html`
            <div class="date-field-container">
                <div class="date-field-header">
                    <span class="date-field-label">${label}</span>
                    <button 
                        class="mode-toggle" 
                        @click=${toggleCallback}
                        title=${templateMode ? 'Switch to date picker' : 'Switch to template/Jinja mode'}
                    >
                        <ha-icon icon=${templateMode ? 'mdi:calendar' : 'mdi:code-braces'}></ha-icon>
                        ${templateMode ? 'Picker' : 'Template'}
                    </button>
                </div>
                
                ${templateMode
                ? html`
                        <ha-textfield
                            .value=${value}
                            .placeholder=${'{{ states(\'input_datetime.my_date\') }}'}
                            @input=${(e: Event) => this._updateDateField(configKey, (e.target as HTMLInputElement).value)}
                        ></ha-textfield>
                        <div class="date-helper">Enter Jinja template, entity, or ISO date string</div>
                    `
                : html`
                        <input 
                            type="datetime-local"
                            .value=${this._convertToDatetimeLocal(value)}
                            @input=${(e: Event) => this._updateDateField(configKey, this._convertFromDatetimeLocal((e.target as HTMLInputElement).value))}
                        />
                        <div class="date-helper">${helper}</div>
                    `
            }
            </div>
        `;
    }

    private _updateDateField(configKey: string, value: string): void {
        const newConfig = { ...this._config, [configKey]: value };
        this._config = newConfig as CardConfig;
        this._fireConfigChanged(newConfig as CardConfig);
    }

    private _toggleTargetDateMode(): void {
        this._targetDateTemplateMode = !this._targetDateTemplateMode;
    }

    private _toggleCreationDateMode(): void {
        this._creationDateTemplateMode = !this._creationDateTemplateMode;
    }

    private _toggleCountUpGoalDateMode(): void {
        this._countUpGoalDateTemplateMode = !this._countUpGoalDateTemplateMode;
    }

    /**
     * Compute the effective compact_format state for display
     * Auto-enables when 3+ units are selected (unless explicitly disabled)
     */
    private _getEffectiveCompactFormat(): boolean {
        const { show_years, show_months, show_weeks, show_days, show_hours, show_minutes, show_seconds, compact_format } = this._config;

        // If explicitly set, use that value
        if (compact_format !== undefined) {
            return compact_format;
        }

        // Otherwise, auto-enable if 3+ units are shown
        const enabledUnits = [show_years, show_months, show_weeks, show_days, show_hours, show_minutes, show_seconds].filter(v => v === true).length;
        return enabledUnits >= 3;
    }

    render(): TemplateResult {
        const cfg = this._config || {};
        const mode = cfg.mode === 'count_up' ? 'count_up' : 'count_down';

        // Create a display config that shows the effective compact_format state
        const displayCfg = {
            ...cfg,
            mode,
            // Show the effective compact_format value for UI consistency
            compact_format: this._getEffectiveCompactFormat()
        };

        const source = resolveSource(displayCfg as CardConfig, this._pendingSource);
        const schema = computeSchema(displayCfg as CardConfig, source);

        // The date pickers live outside ha-form because each carries a
        // picker/template toggle, and the template rule says a date field must
        // stay free text when someone wants Jinja in it. They are only shown
        // for a date-driven card: a timer entity, auto-discovery or a list of
        // pinned countdowns each bring their own start and end.
        const dateFields = usesDateFields(source) ? html`
            <div class="date-fields-section">
                ${this._renderDateField(
            'target_date',
            mode === 'count_up' ? 'Start Date' : 'Target Date',
            mode === 'count_up' ? 'Date/time the elapsed count begins' : 'Date/time when countdown ends',
            this._targetDateTemplateMode,
            () => this._toggleTargetDateMode()
        )}
                
                ${mode === 'count_up'
                ? this._renderDateField(
                    'count_up_goal_date',
                    'Goal Date',
                    'Optional end date for count-up progress',
                    this._countUpGoalDateTemplateMode,
                    () => this._toggleCountUpGoalDateMode()
                )
                : this._renderDateField(
                    'creation_date',
                    'Creation Date',
                    'Optional start date for countdown progress',
                    this._creationDateTemplateMode,
                    () => this._toggleCreationDateMode()
                )}
            </div>
        ` : nothing;

        return html`
            ${this._renderSourcePicker(displayCfg as CardConfig, source)}
            <div class="style-picker">
                <span class="editor-section-label">Style</span>
                <ha-form
                    .hass=${this.hass}
                    .data=${displayCfg}
                    .schema=${styleSchema()}
                    @value-changed=${(e: CustomEvent) => this._formChanged(e)}
                    .computeLabel=${computeLabel}
                    .computeHelper=${computeHelper}
                ></ha-form>
            </div>
            ${dateFields}
            <ha-form
                .hass=${this.hass}
                .data=${displayCfg}
                .schema=${schema}
                @value-changed=${(e: CustomEvent) => this._formChanged(e)}
                .computeLabel=${computeLabel}
                .computeHelper=${computeHelper}
            ></ha-form>
        `;
    }

}

export default TimeFlowCardEditorBeta;
