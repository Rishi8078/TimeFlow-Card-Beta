import { LitElement, html, css, CSSResult, TemplateResult, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ListEntryConfig } from '../types/index';
import './ha-form-tf-template';
import './ha-form-tf-group';

/**
 * The repeatable list of countdowns pinned to a 'listy' card.
 *
 * ha-form has no repeater, so this is a custom form type -
 * `{ type: 'tf_countdowns', name: 'countdowns' }`. Deliberately *not*
 * flattened: ha-form then scopes the item's data to `data.countdowns` and wraps
 * whatever we emit back as `{ countdowns: [...] }`, which is exactly the shape
 * an array field needs.
 *
 * The panel-per-entry layout, the move/remove toolbar and the lazy content
 * follow Bubble Card's sub-button editor, which solves the same problem - see
 * EDITOR-CONFIG-MATRIX.md.
 */
export interface CountdownsFieldSchema {
  type: 'tf_countdowns';
  name: string;
}

export class HaFormTfCountdowns extends LitElement {
  @property({ attribute: false }) public hass: any;
  @property({ attribute: false }) public schema!: CountdownsFieldSchema;
  @property({ attribute: false }) public data?: ListEntryConfig[];
  @property({ type: Boolean }) public disabled = false;
  @property({ attribute: false }) public computeLabel?: (schema: any) => string;
  @property({ attribute: false }) public computeHelper?: (schema: any) => string | undefined;

  /**
   * Which panels are open, and which have ever been opened.
   *
   * Keyed by index, so both are rebuilt when entries are reordered - see
   * _reindex. Held here rather than in the config: a panel being open is not
   * something anyone wants saved to their dashboard.
   */
  @state() private _expanded: Record<number, boolean> = {};
  @state() private _loaded: Record<number, boolean> = {};

  private get _entries(): ListEntryConfig[] {
    return Array.isArray(this.data) ? this.data : [];
  }

  private _emit(entries: ListEntryConfig[]): void {
    this.dispatchEvent(new CustomEvent('value-changed', {
      // Undefined rather than [] so an emptied list leaves no key behind in the
      // user's YAML.
      detail: { value: entries.length > 0 ? entries : undefined },
      bubbles: true,
      composed: true,
    }));
  }

  private _add(): void {
    const entries = [...this._entries, { title: 'Countdown', target_date: '' }];
    this._expanded = { ...this._expanded, [entries.length - 1]: true };
    this._loaded = { ...this._loaded, [entries.length - 1]: true };
    this._emit(entries);
  }

  private _remove(index: number): void {
    const entries = this._entries.filter((_, i) => i !== index);
    this._reindex(index, null);
    this._emit(entries);
  }

  private _move(index: number, delta: number): void {
    const target = index + delta;
    if (target < 0 || target >= this._entries.length) return;

    const entries = [...this._entries];
    [entries[index], entries[target]] = [entries[target], entries[index]];
    this._reindex(index, target);
    this._emit(entries);
  }

  /**
   * Keeps the open/loaded flags with their entry when the list changes. Without
   * this, removing the first entry leaves the second wearing the first's open
   * state.
   */
  private _reindex(from: number, to: number | null): void {
    const remap = (record: Record<number, boolean>) => {
      const next: Record<number, boolean> = {};
      for (const [key, value] of Object.entries(record)) {
        const i = Number(key);
        if (to === null) {
          if (i === from) continue;
          next[i > from ? i - 1 : i] = value;
        } else {
          next[i === from ? to : i === to ? from : i] = value;
        }
      }
      return next;
    };
    this._expanded = remap(this._expanded);
    this._loaded = remap(this._loaded);
  }

  private _entryChanged(index: number, ev: CustomEvent): void {
    ev.stopPropagation();
    const entries = [...this._entries];
    entries[index] = { ...entries[index], ...(ev.detail?.value ?? {}) };
    this._emit(entries);
  }

  private _toggle(index: number, expanded: boolean): void {
    this._expanded = { ...this._expanded, [index]: expanded };
    // Once opened, the content stays rendered: rebuilding a nested form of this
    // size every time a panel reopens is wasted work.
    if (expanded && !this._loaded[index]) {
      this._loaded = { ...this._loaded, [index]: true };
    }
  }

  /** The fields of one entry. Mirrors how the card resolves them. */
  private _entrySchema(entry: ListEntryConfig): any[] {
    const countUp = entry.mode === 'count_up';

    return [
      { type: 'tf_template', name: 'title', plainSelector: { text: {} } },
      {
        type: 'tf_template',
        name: 'target_date',
        plainSelector: { datetime: {} },
        plainLabel: 'Picker',
        plainIcon: 'mdi:calendar',
        format: 'datetime',
      },
      {
        name: 'mode',
        selector: {
          select: {
            options: [
              { value: 'count_down', label: 'Count Down' },
              { value: 'count_up', label: 'Count Up' },
            ],
            mode: 'dropdown',
          },
        },
      },
      countUp
        ? {
            type: 'tf_template',
            name: 'count_up_goal_date',
            plainSelector: { datetime: {} },
            plainLabel: 'Picker',
            plainIcon: 'mdi:calendar',
            format: 'datetime',
          }
        : {
            type: 'tf_template',
            name: 'creation_date',
            plainSelector: { datetime: {} },
            plainLabel: 'Picker',
            plainIcon: 'mdi:calendar',
            format: 'datetime',
          },
      { type: 'tf_template', name: 'subtitle', plainSelector: { text: {} } },
      {
        type: 'tf_group',
        name: 'group_entry_appearance',
        flatten: true,
        title: 'Appearance',
        schema: [
          { type: 'tf_template', name: 'header_icon', plainSelector: { icon: {} }, plainLabel: 'Icon', plainIcon: 'mdi:emoticon-outline' },
          { type: 'tf_template', name: 'header_icon_color', plainSelector: { text: {} } },
          { type: 'tf_template', name: 'header_icon_background', plainSelector: { text: {} } },
          { type: 'tf_template', name: 'background_color', plainSelector: { text: {} } },
          { type: 'tf_template', name: 'text_color', plainSelector: { text: {} } },
          { type: 'tf_template', name: 'progress_color', plainSelector: { text: {} } },
        ],
      },
    ];
  }

  protected render(): TemplateResult {
    const entries = this._entries;

    return html`
      <div class="list">
        ${entries.map((entry, index) => this._renderEntry(entry, index, entries.length))}

        ${entries.length === 0
          ? html`<div class="empty">No countdowns pinned yet.</div>`
          : nothing}

        <button type="button" class="add" ?disabled=${this.disabled} @click=${this._add}>
          <ha-icon icon="mdi:plus"></ha-icon>
          Add countdown
        </button>
      </div>
    `;
  }

  private _renderEntry(entry: ListEntryConfig, index: number, total: number): TemplateResult {
    const name = entry.title?.trim() || 'Untitled';

    return html`
      <ha-expansion-panel
        outlined
        .expanded=${!!this._expanded[index]}
        @expanded-changed=${(e: CustomEvent) => this._toggle(index, (e.target as any).expanded)}
      >
        <div slot="header" class="entry-header">
          <span class="entry-title">${index + 1}. ${name}</span>
          <span class="entry-actions">
            <ha-icon-button
              .path=${'M7,15L12,10L17,15H7Z'}
              label="Move up"
              ?disabled=${index === 0 || this.disabled}
              @click=${(e: Event) => { e.stopPropagation(); this._move(index, -1); }}
            ></ha-icon-button>
            <ha-icon-button
              .path=${'M7,10L12,15L17,10H7Z'}
              label="Move down"
              ?disabled=${index === total - 1 || this.disabled}
              @click=${(e: Event) => { e.stopPropagation(); this._move(index, 1); }}
            ></ha-icon-button>
            <ha-icon-button
              .path=${'M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z'}
              label="Remove"
              ?disabled=${this.disabled}
              @click=${(e: Event) => { e.stopPropagation(); this._remove(index); }}
            ></ha-icon-button>
          </span>
        </div>

        <div class="entry-body">
          ${this._loaded[index]
            ? html`
              <ha-form
                .hass=${this.hass}
                .data=${entry}
                .schema=${this._entrySchema(entry)}
                .disabled=${this.disabled}
                .computeLabel=${this.computeLabel}
                .computeHelper=${this.computeHelper}
                @value-changed=${(e: CustomEvent) => this._entryChanged(index, e)}
              ></ha-form>
            `
            : nothing}
        </div>
      </ha-expansion-panel>
    `;
  }

  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
      }
      .list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      ha-expansion-panel {
        --expansion-panel-content-padding: 0;
        border-radius: 6px;
      }
      .entry-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        width: 100%;
        min-width: 0;
      }
      .entry-title {
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .entry-actions {
        display: flex;
        flex-shrink: 0;
        --mdc-icon-button-size: 32px;
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color);
      }
      .entry-body {
        padding: 12px;
      }
      .empty {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .add {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 8px 12px;
        border: 1px dashed var(--divider-color);
        border-radius: 8px;
        background: none;
        color: var(--primary-color);
        font-size: 14px;
        cursor: pointer;
      }
      .add:hover:not([disabled]) {
        background: rgba(127, 127, 127, 0.08);
        background: color-mix(in srgb, currentColor 8%, transparent);
      }
      .add[disabled] {
        color: var(--disabled-text-color);
        cursor: default;
      }
      .add ha-icon {
        --mdc-icon-size: 18px;
      }
    `;
  }
}

if (!customElements.get('ha-form-tf_countdowns')) {
  customElements.define('ha-form-tf_countdowns', HaFormTfCountdowns);
}
