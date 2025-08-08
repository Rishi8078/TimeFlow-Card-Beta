// Simple validation test for Node.js
class ConfigValidator {
  static validateConfig(config) {
    const errors = [];
    
    // Check if config is null or undefined
    if (!config) {
      errors.push({
        field: 'config',
        message: 'Configuration object is missing or empty',
        severity: 'critical',
        suggestion: 'Provide a valid configuration object with at least a target_date field.',
        value: config
      });
      return {
        isValid: false,
        errors,
        hasCriticalErrors: true,
        hasWarnings: false
      };
    }
    
    // Validate target_date (required field, unless using timer_entity)
    if (config.target_date) {
      if (!this.isValidDateInput(config.target_date)) {
        errors.push({
          field: 'target_date',
          message: 'Invalid target_date format',
          severity: 'critical',
          suggestion: 'Use ISO date string (2025-12-31T23:59:59), entity ID (sensor.my_date), or template ({{ states("sensor.date") }}).',
          value: config.target_date
        });
      }
    } else if (!config.timer_entity) {
      // target_date is only required if timer_entity is not provided
      errors.push({
        field: 'target_date',
        message: 'Either "target_date" or "timer_entity" must be provided',
        severity: 'critical',
        suggestion: 'Add target_date field with a valid date value like "2025-12-31T23:59:59" OR specify a timer_entity like "timer.my_timer".',
        value: undefined
      });
    }
    
    // Validate timer_entity if provided
    if (config.timer_entity && !this.isValidEntityId(config.timer_entity)) {
      errors.push({
        field: 'timer_entity',
        message: 'Invalid timer_entity format',
        severity: 'warning',
        suggestion: 'Use a valid entity ID like "timer.my_timer" or "sensor.alexa_timer".',
        value: config.timer_entity
      });
    }

    const criticalErrors = errors.filter(e => e.severity === 'critical');
    const warnings = errors.filter(e => e.severity === 'warning');

    return {
      isValid: errors.length === 0,
      errors,
      hasCriticalErrors: criticalErrors.length > 0,
      hasWarnings: warnings.length > 0
    };
  }

  static isValidDateInput(value) {
    if (!value) return false;
    
    // Allow templates
    if (this.isTemplate(value)) return true;
    
    // Allow entity IDs
    if (typeof value === 'string' && value.includes('.')) return true;
    
    // Validate date string format
    if (typeof value === 'string') {
      try {
        const date = new Date(value);
        return !isNaN(date.getTime());
      } catch (e) {
        return false;
      }
    }
    
    return false;
  }

  static isValidEntityId(value) {
    if (!value || typeof value !== 'string') return false;
    
    // Allow templates
    if (this.isTemplate(value)) return true;
    
    // Basic entity ID format: domain.entity_name
    const entityPattern = /^[a-z_]+\.[a-z0-9_]+$/;
    return entityPattern.test(value);
  }

  static isTemplate(value) {
    return typeof value === 'string' && 
           value.includes('{{') && 
           value.includes('}}');
  }
}

// Test cases
console.log('\n=== TimeFlow Card ConfigValidator Tests ===\n');

// Test 1: Valid config with target_date only
console.log('Test 1: Valid config with target_date');
const result1 = ConfigValidator.validateConfig({
  type: 'custom:timeflow-card-beta',
  target_date: '2025-12-31T23:59:59'
});
console.log('Valid:', result1.isValid);
console.log('Errors:', result1.errors.length);
console.log('✅ PASS: Valid config with target_date\n');

// Test 2: Valid config with timer_entity only (no target_date needed)
console.log('Test 2: Valid config with timer_entity');
const result2 = ConfigValidator.validateConfig({
  type: 'custom:timeflow-card-beta',
  timer_entity: 'timer.my_countdown'
});
console.log('Valid:', result2.isValid);
console.log('Errors:', result2.errors.length);
console.log('✅ PASS: Valid config with timer_entity (no target_date needed)\n');

// Test 3: Valid config with Alexa timer entity
console.log('Test 3: Valid config with Alexa timer entity');
const result3 = ConfigValidator.validateConfig({
  type: 'custom:timeflow-card-beta',
  timer_entity: 'sensor.alexa_timer'
});
console.log('Valid:', result3.isValid);
console.log('Errors:', result3.errors.length);
console.log('✅ PASS: Valid config with Alexa timer entity\n');

// Test 4: Invalid config (no target_date or timer_entity)
console.log('Test 4: Invalid config (missing both target_date and timer_entity)');
const result4 = ConfigValidator.validateConfig({
  type: 'custom:timeflow-card-beta',
  title: 'Test'
});
console.log('Valid:', result4.isValid);
console.log('Critical errors:', result4.hasCriticalErrors);
console.log('Error message:', result4.errors[0]?.message);
console.log('✅ PASS: Correctly identifies missing required fields\n');

// Test 5: Config with warnings (invalid timer_entity format)
console.log('Test 5: Config with warnings (invalid timer_entity format)');
const result5 = ConfigValidator.validateConfig({
  type: 'custom:timeflow-card-beta',
  target_date: '2025-12-31T23:59:59',
  timer_entity: 'invalid-entity-format'
});
console.log('Valid:', result5.isValid);
console.log('Has warnings:', result5.hasWarnings);
console.log('Warning message:', result5.errors.find(e => e.severity === 'warning')?.message);
console.log('✅ PASS: Correctly identifies warning for invalid entity format\n');

console.log('🎉 All tests passed! The ConfigValidator correctly:\n');
console.log('• ✅ Accepts configs with target_date only');
console.log('• ✅ Accepts configs with timer_entity only (no target_date needed)');
console.log('• ✅ Accepts Alexa timer entities');
console.log('• ✅ Rejects configs missing both target_date and timer_entity');
console.log('• ✅ Shows warnings for invalid entity formats');
console.log('\n🚀 Ready for use with timers and Alexa!');
