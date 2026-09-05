import { LitElement, html, css, TemplateResult, CSSResult, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { CardConfig } from '../types/index';
import { computeSectionsSchema, computeSourceSchema, computeTextSchema, styleSchema } from '../editor/schema';
import { SourceType, applySource, availableSources, getCapabilities, getSourceType, resolveSource, usesDateFields } from '../editor/capabilities';
import { computeLabel, computeHelper } from '../editor/labels';

/**
 * Keys the editor renders itself, with a picker/template toggle: the three
 * dates, plus the title, subtitle and expired text. Everything else that takes
 * a template is a plain text field, where a template can simply be typed.
 *
 * subtitle_prefix and subtitle_suffix are deliberately absent: they are not in
 * the card's templateKeys, so a template typed into them would be rendered
 * literally.
 */
const TEMPLATABLE_FIELDS = ['target_date', 'creation_date', 'count_up_goal_date', 'title', 'subtitle', 'expired_text'] as const;

const SOURCE_HELPERS: Record<string, string> = {
    date: 'Count to a date or entity you choose',
    timer: 'Follow one timer, sensor or input_datetime entity',
    auto: 'Follows any running Alexa or Google Home timer',
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

    // Which date fields are showing a template box rather than a picker.
    @state() private _templateMode: Record<string, boolean> = {};

    // Whether ha-code-editor has been registered by the frontend yet. It is
    // lazy-loaded, and an unregistered custom element renders as an empty box,
    // so the textarea stands in until it appears.
    @state() private _codeEditorReady: boolean = !!customElements.get('ha-code-editor');

    // Fields the user has switched by hand. Auto-detection stops applying to
    // them: an empty template box is not a template, so re-detecting on the
    // next setConfig would silently throw the user back to the picker the
    // moment anything else on the form changed.
    private _templateModeTouched: Set<string> = new Set();

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
            
            /* Matches the 24px ha-form puts between its own fields, so a field
               we render sits on the same grid as one ha-form renders. */
            .editor-root {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }
            .date-field-container {
                display: flex;
                flex-direction: column;
                gap: 6px;
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
            /* ha-code-editor brings its own CodeMirror styling; the wrapper
               only has to give it the same frame as the date picker beside it
               and stop a long template widening the panel. */
            .template-editor {
                border: 1px solid var(--divider-color);
                border-radius: 4px;
                background: var(--card-background-color);
                padding: 4px 8px;
                overflow: auto;
            }
            .template-editor:focus-within {
                border-color: var(--primary-color);
            }
            .template-editor ha-code-editor {
                --code-mirror-max-height: 120px;
            }
            .template-input {
                width: 100%;
                box-sizing: border-box;
                min-height: 48px;
                padding: 12px;
                border: 1px solid var(--divider-color);
                border-radius: 4px;
                background: var(--card-background-color);
                color: var(--primary-text-color);
                font-family: var(--ha-font-family-code, monospace);
                font-size: 13px;
                line-height: 1.4;
                resize: vertical;
            }
            .template-input:focus {
                outline: none;
                border-color: var(--primary-color);
            }
            .date-helper {
                font-size: 12px;
                color: var(--secondary-text-color);
            }
            /* The date and time inputs come from Home Assistant, so they carry
               the theme's own styling. This only has to stop them huddling on
               the left of a wide panel. */
            .date-picker {
                width: 100%;
            }
            .date-picker ha-form {
                display: block;
                width: 100%;
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
            }
            .source-picker {
                display: flex;
                flex-direction: column;
                gap: 6px;
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
            .date-fields-section {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }
        `;
    }

    connectedCallback(): void {
        super.connectedCallback();
        if (!this._codeEditorReady) {
            customElements.whenDefined('ha-code-editor').then(() => {
                this._codeEditorReady = true;
            });
        }
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

        // Open in template mode for values that already are templates, unless
        // the user has said otherwise for that field.
        for (const key of TEMPLATABLE_FIELDS) {
            if (this._templateModeTouched.has(key)) continue;
            this._templateMode = {
                ...this._templateMode,
                [key]: this._isTemplate(String(config[key] ?? '')),
            };
        }
    }

    private _isTemplate(value: string): boolean {
        return value.includes('{{') || value.includes('{%');
    }

    /**
     * Config value -> the "YYYY-MM-DD HH:MM:SS" that ha-selector-datetime wants.
     * Undefined for an empty or template value, so the picker starts blank
     * rather than on the epoch.
     */
    private _toSelectorValue(isoDate: string): string | undefined {
        if (!isoDate || this._isTemplate(isoDate)) return undefined;

        // Local components, never toISOString(): the whole point of the
        // conversion is that a date the user typed stays on the day they typed
        // it. Seconds are carried through - ha-time-input runs with
        // enable-second, and rounding 23:59:59 down to 23:59:00 every time the
        // editor opened would quietly move people's deadlines.
        const date = new Date(isoDate);
        if (isNaN(date.getTime())) return undefined;

        const pad = (n: number) => String(n).padStart(2, '0');
        const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
        const time = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        return `${day} ${time}`;
    }

    /** The selector's value back into the ISO form the card stores. */
    private _fromSelectorValue(value: string): string {
        if (!value) return '';
        const iso = value.trim().replace(' ', 'T');
        // ha-time-input can hand back HH:MM when seconds are disabled.
        return iso.length === 16 ? `${iso}:00` : iso;
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
            // ha-control-select renders ariaLabel into the option's `title`, so
            // this is the hover text as well as what a screen reader announces.
            ariaLabel: SOURCE_HELPERS[value],
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
        helper: string
    ): TemplateResult {
        return this._renderTemplatableField(configKey, label, helper, html`
            <div class="date-picker">
                <ha-form
                    .hass=${this.hass}
                    .data=${{ [configKey]: this._toSelectorValue(String(this._config[configKey] ?? '')) }}
                    .schema=${[{ name: configKey, selector: { datetime: {} } }]}
                    .computeLabel=${() => ''}
                    @value-changed=${(e: CustomEvent) => this._updateDateField(
                        configKey,
                        this._fromSelectorValue(e.detail?.value?.[configKey] ?? '')
                    )}
                ></ha-form>
            </div>
        `);
    }

    /** The title, with the same toggle - plain text on one side, Jinja on the other. */
    private _renderTitleField(): TemplateResult {
        return this._renderTemplatableField(
            'title',
            'Title',
            'Falls back to the timer or entity name',
            this._renderPlainTextField('title')
        );
    }

    private _renderExpiredTextField(): TemplateResult {
        return this._renderTemplatableField(
            'expired_text',
            'Expired Text',
            'Replaces the countdown once it reaches zero',
            this._renderPlainTextField('expired_text')
        );
    }

    private _renderSubtitleField(): TemplateResult {
        return this._renderTemplatableField(
            'subtitle',
            'Subtitle',
            'Shows time remaining by default; only set for custom text',
            this._renderPlainTextField('subtitle')
        );
    }

    /**
     * The chosen source's own fields. Auto-discovery gets a heading and a line
     * of explanation, matching the Style and Countdown Source blocks; the other
     * sources are a single self-explanatory field and need neither.
     */
    private _renderSourceFields(
        displayCfg: CardConfig,
        schema: unknown[],
        source: SourceType
    ): TemplateResult {
        const form = html`
            <ha-form
                .hass=${this.hass}
                .data=${displayCfg}
                .schema=${schema}
                @value-changed=${(e: CustomEvent) => this._formChanged(e)}
                .computeLabel=${computeLabel}
                .computeHelper=${computeHelper}
            ></ha-form>
        `;

        if (source !== 'auto') return form;

        return html`
            <div class="date-field-container">
                <span class="editor-section-label">Auto Discover</span>
                ${form}
                <div class="date-helper">
                    Finds running timers on their own. Turn off whichever assistant you do not have.
                </div>
            </div>
        `;
    }

    /** The ordinary, non-template half of a text field. */
    private _renderPlainTextField(configKey: string): TemplateResult {
        return html`
            <div class="date-picker">
                <ha-form
                    .hass=${this.hass}
                    .data=${{ [configKey]: this._config[configKey] ?? '' }}
                    .schema=${[{ name: configKey, selector: { text: {} } }]}
                    .computeLabel=${() => ''}
                    @value-changed=${(e: CustomEvent) =>
                        this._updateDateField(configKey, e.detail?.value?.[configKey] ?? '')}
                ></ha-form>
            </div>
        `;
    }

    /**
     * A field with a picker/template toggle: `plain` is whatever the field
     * looks like normally, and template mode swaps it for the Jinja editor.
     */
    private _renderTemplatableField(
        configKey: string,
        label: string,
        helper: string,
        plain: TemplateResult
    ): TemplateResult {
        const value = String(this._config[configKey] ?? '');
        const templateMode = !!this._templateMode[configKey];

        return html`
            <div class="date-field-container">
                <div class="date-field-header">
                    <span class="date-field-label">${label}</span>
                    <button
                        type="button"
                        class="mode-toggle"
                        @click=${() => this._toggleTemplateMode(configKey)}
                        title=${templateMode ? 'Switch to date picker' : 'Switch to template/Jinja mode'}
                    >
                        <ha-icon icon=${templateMode ? 'mdi:calendar' : 'mdi:code-braces'}></ha-icon>
                        ${templateMode ? 'Picker' : 'Template'}
                    </button>
                </div>

                ${templateMode
                ? html`
                        ${this._codeEditorReady
                            ? html`
                                <div class="template-editor">
                                    <ha-code-editor
                                        mode="jinja2"
                                        linewrap
                                        autocomplete-entities
                                        .hass=${this.hass}
                                        .value=${value}
                                        .hasToolbar=${false}
                                        @value-changed=${(e: CustomEvent) =>
                                            this._updateDateField(configKey, e.detail?.value ?? '')}
                                    ></ha-code-editor>
                                </div>
                            `
                            : html`
                                <textarea
                                    class="template-input"
                                    rows="2"
                                    spellcheck="false"
                                    .value=${value}
                                    placeholder=${'{{ states(\'input_datetime.my_date\') }}'}
                                    @input=${(e: Event) =>
                                        this._updateDateField(configKey, (e.target as HTMLTextAreaElement).value)}
                                ></textarea>
                            `}
                        <div class="date-helper">Jinja template, entity id, or ISO date string</div>
                    `
                : html`
                        ${plain}
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

    private _toggleTemplateMode(configKey: string): void {
        this._templateModeTouched.add(configKey);
        this._templateMode = { ...this._templateMode, [configKey]: !this._templateMode[configKey] };
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
        const sourceSchema = computeSourceSchema(displayCfg as CardConfig, source);
        const textSchema = computeTextSchema(displayCfg as CardConfig, source);
        const sectionsSchema = computeSectionsSchema(displayCfg as CardConfig, source);
        const caps = getCapabilities(displayCfg as CardConfig);
        const showsTitle = caps.title;
        const showsSubtitle = caps.subtitle;
        const showsExpiredText = caps.expiredText;

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
            mode === 'count_up' ? 'Date/time the elapsed count begins' : 'Date/time when countdown ends'
        )}

                ${mode === 'count_up'
                ? this._renderDateField(
                    'count_up_goal_date',
                    'Goal Date',
                    'Optional end date for count-up progress'
                )
                : this._renderDateField(
                    'creation_date',
                    'Start Date',
                    'Where the progress ring starts filling from. Without it the ring stays empty.'
                )}
            </div>
        ` : nothing;

        return html`
            <div class="editor-root">
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
            ${this._renderSourceFields(displayCfg as CardConfig, sourceSchema, source)}
            ${showsTitle ? this._renderTitleField() : nothing}
            ${showsSubtitle ? this._renderSubtitleField() : nothing}
            ${textSchema.length > 0 ? html`
                <div class="date-field-container">
                    <ha-form
                        .hass=${this.hass}
                        .data=${displayCfg}
                        .schema=${textSchema}
                        @value-changed=${(e: CustomEvent) => this._formChanged(e)}
                        .computeLabel=${computeLabel}
                        .computeHelper=${computeHelper}
                    ></ha-form>
                    <div class="date-helper">
                        Wrap the automatic countdown, e.g. "in" 3 days "left". Ignored when you set a Subtitle.
                    </div>
                </div>
            ` : nothing}
            ${showsExpiredText ? this._renderExpiredTextField() : nothing}
            <ha-form
                .hass=${this.hass}
                .data=${displayCfg}
                .schema=${sectionsSchema}
                @value-changed=${(e: CustomEvent) => this._formChanged(e)}
                .computeLabel=${computeLabel}
                .computeHelper=${computeHelper}
            ></ha-form>
            </div>
        `;
    }

}

export default TimeFlowCardEditorBeta;
