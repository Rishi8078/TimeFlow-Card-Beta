import { HomeAssistant, TimeFlowCard } from '../types/index';

interface CacheEntry {
  result: any;
  timestamp: number;
}

/**
 * TemplateService - Handles Home Assistant template evaluation and caching
 * Provides efficient template processing with intelligent caching
 */
export class TemplateService {
  private templateResults: Map<string, CacheEntry>;
  private templateCacheLimit: number;
  public card?: TimeFlowCard;

  constructor() {
    this.templateResults = new Map();
    this.templateCacheLimit = 100;
  }

  /**
   * Evaluates a Home Assistant template using the correct API
   * @param {string} template - Template string to evaluate
   * @param {Object} hass - Home Assistant object
   * @returns {Promise<*>} - Evaluated template result
   */
  async evaluateTemplate(template: string, hass: HomeAssistant | null): Promise<any> {
    if (!hass || !template) {
      return template;
    }

    // Check cache first
    const cacheKey = template;
    if (this.templateResults.has(cacheKey)) {
      const cached = this.templateResults.get(cacheKey);
      // Use longer cache for date templates to prevent oscillation near expiration
      const cacheTimeout = this.isDateTemplate(template) ? 30000 : 5000; // 30s for dates, 5s for others
      if (cached && Date.now() - cached.timestamp < cacheTimeout) {
        return cached.result;
      }
    }

    try {
      // Validate template format before making API call
      if (!this.isValidTemplate(template)) {
        throw new Error('Invalid template format');
      }

      // Use callApi method like card-tools and button-card for HA templates
      const result = await hass.callApi('POST', 'template', { 
        template: template 
      });
      
      // Check if the template evaluation succeeded but returned 'unknown'
      if (result === 'unknown' || result === 'unavailable' || result === '' || result === null) {
        // Try to extract fallback from the template itself
        const fallback = this.extractFallbackFromTemplate(template);
        if (fallback && fallback !== template) {
          // Cache the fallback result
          this.templateResults.set(cacheKey, {
            result: fallback,
            timestamp: Date.now()
          });
          
          // Enforce cache size limits
          this.enforceTemplateCacheLimit();
          
          return fallback;
        }
      }
      
      // Cache the result
      this.templateResults.set(cacheKey, {
        result: result,
        timestamp: Date.now()
      });
      
      // Enforce cache size limits
      this.enforceTemplateCacheLimit();
      
      return result;
    } catch (error: any) {
      // Template evaluation failed, use fallback
      const fallback = this.extractFallbackFromTemplate(template);
      
      // Cache the fallback to prevent repeated failed calls
      this.templateResults.set(cacheKey, {
        result: fallback,
        timestamp: Date.now()
      });
      
      this.enforceTemplateCacheLimit();
      return fallback;
    }
  }

  /**
   * Extracts fallback value from template expressions with 'or' operator
   * @param {string} template - Template string
   * @returns {string} - Extracted fallback value
   */
  extractFallbackFromTemplate(template: string): string {
    if (!template || typeof template !== 'string') {
      return template;
    }

    try {
      // Remove the outer {{ }} to work with the inner expression
      const innerTemplate = template.replace(/^\{\{\s*/, '').replace(/\s*\}\}$/, '').trim();
      
      // Look for patterns like "states('entity') or 'fallback'"
      const simpleOrPattern = /^(.+?)\s+or\s+['"`]([^'"`]+)['"`]$/;
      const simpleOrMatch = innerTemplate.match(simpleOrPattern);
      
      if (simpleOrMatch && simpleOrMatch[2]) {
        return simpleOrMatch[2];
      }

      // Look for chained or patterns like "states('entity1') or states('entity2') or 'fallback'"
      const chainedOrPattern = /^(.+?)\s+or\s+(.+?)\s+or\s+['"`]([^'"`]+)['"`]$/;
      const chainedMatch = innerTemplate.match(chainedOrPattern);
      
      if (chainedMatch && chainedMatch[3]) {
        return chainedMatch[3];
      }

      // Look for conditional patterns like "'value' if condition else 'fallback'"
      const conditionalPattern = /^['"`]([^'"`]+)['"`]\s+if\s+(.+?)\s+else\s+['"`]([^'"`]+)['"`]$/;
      const conditionalMatch = innerTemplate.match(conditionalPattern);
      
      if (conditionalMatch && conditionalMatch[3]) {
        return conditionalMatch[3];
      }

      // Look for reverse conditional patterns like "condition if test else 'fallback'"
      const reverseConditionalPattern = /^(.+?)\s+if\s+(.+?)\s+else\s+['"`]([^'"`]+)['"`]$/;
      const reverseMatch = innerTemplate.match(reverseConditionalPattern);
      
      if (reverseMatch && reverseMatch[3]) {
        return reverseMatch[3];
      }

      // If no fallback pattern found, return a helpful message
      return 'Unavailable';
    } catch (error) {
      return 'Template Error';
    }
  }

  /**
   * Detects if a template is likely calculating dates/times
   * @param {string} template - Template to check
   * @returns {boolean} - Whether template appears to be date-related
   */
  isDateTemplate(template: string): boolean {
    if (!template || typeof template !== 'string') return false;
    
    // Look for common date/time functions and keywords
    const dateKeywords = [
      'as_datetime', 'timedelta', 'isoformat', 'strftime',
      'now()', 'today', 'utcnow', 'timestamp',
      'days=', 'hours=', 'minutes=', 'seconds='
    ];
    
    return dateKeywords.some(keyword => template.includes(keyword));
  }

  /**
   * Detects if a value contains Home Assistant templates
   * @param {*} value - Value to check
   * @returns {boolean} - Whether the value is a template
   */
  isTemplate(value: any): boolean {
    return typeof value === 'string' && 
           value.includes('{{') && 
           value.includes('}}');
  }

  /**
   * Validates template format to prevent bad API calls
   * @param {string} template - Template string to validate
   * @returns {boolean} - Whether template is valid
   */
  isValidTemplate(template: string): boolean {
    if (!template || typeof template !== 'string') return false;
    
    // Check for basic template format
    if (!template.includes('{{') || !template.includes('}}')) return false;
    
    // Check for balanced braces
    const openBraces = (template.match(/\{\{/g) || []).length;
    const closeBraces = (template.match(/\}\}/g) || []).length;
    if (openBraces !== closeBraces) return false;
    
    // Check for empty template
    const content = template.replace(/\{\{\s*/, '').replace(/\s*\}\}/, '').trim();
    if (!content) return false;
    
    return true;
  }

  /**
   * Enhanced value resolver that handles entities, templates, and plain strings
   * @param {*} value - Value to resolve
   * @returns {Promise<*>} - Resolved value
   */
  async resolveValue(value: string): Promise<string | undefined> {
    if (!value) return undefined;

    if (this.isTemplate(value)) {
      const hass = this.card?.hass || null;
      const result = await this.evaluateTemplate(value, hass);
      return result || undefined;
    }

    // Handle entity state
    const hass = this.card?.hass;
    if (typeof value === 'string' && value.includes('.') && hass && hass.states[value]) {
      const entity = hass.states[value];
      if (!entity) {
        return undefined;
      }
      return entity.state;
    }

    return value;
  }

  /**
   * Clears template cache when entities change
   */
  clearTemplateCache() {
    this.templateResults.clear();
  }

  /**
   * Enforces template cache size limits to prevent memory growth
   */
  enforceTemplateCacheLimit() {
    if (this.templateResults.size <= this.templateCacheLimit) {
      return;
    }

    // Convert to array and sort by timestamp (oldest first)
    const cacheEntries = Array.from(this.templateResults.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Remove oldest entries until we're under the limit
    const entriesToRemove = cacheEntries.length - this.templateCacheLimit;
    for (let i = 0; i < entriesToRemove; i++) {
      this.templateResults.delete(cacheEntries[i][0]);
    }
  }

  /**
   * Checks if the current config contains any templates
   * @param {Object} config - Configuration object
   * @returns {boolean} - Whether config contains templates
   */
  hasTemplatesInConfig(config: any): boolean {
    if (!config) return false;
    
    // Check common template-enabled properties
    const templateProperties = [
      'target_date', 'creation_date', 'title', 'subtitle',
      'color', 'background_color', 'progress_color', 'primary_color', 'secondary_color'
    ];
    
    return templateProperties.some(prop => 
      config[prop] && this.isTemplate(config[prop])
    );
  }

  /**
   * Escapes HTML special characters to prevent XSS and ensure proper display
   * @param {*} text - Text to escape
   * @returns {string} - Escaped text
   */
  escapeHtml(text: string): string {
    if (text == null || text === undefined) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}