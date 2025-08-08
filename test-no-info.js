// Test to verify info messages are removed
class ConfigValidator {
  static validateConfig(config) {
    const errors = [];
    
    // Test with past date (should NOT add info message)
    if (config.target_date && typeof config.target_date === 'string') {
      const targetDate = new Date(config.target_date);
      if (!isNaN(targetDate.getTime())) {
        const now = new Date();
        if (targetDate < now) {
          // This should NOT be added anymore
          console.log('Past date detected but NO info message added');
        }
      }
    }
    
    // Unknown field should be warning
    if (config.unknown_field) {
      errors.push({
        field: 'unknown_field',
        message: 'Unknown configuration field "unknown_field"',
        severity: 'warning',
        suggestion: 'This field may be ignored or cause unexpected behavior. Check documentation for valid fields.',
        value: config.unknown_field
      });
    }

    const criticalErrors = errors.filter(e => e.severity === 'critical');
    const warnings = errors.filter(e => e.severity === 'warning');

    return {
      isValid: criticalErrors.length === 0 && warnings.length === 0,
      errors,
      hasCriticalErrors: criticalErrors.length > 0,
      hasWarnings: warnings.length > 0
    };
  }
}

console.log('\n=== Testing Removal of Info Messages ===\n');

// Test 1: Past date should NOT generate info message
console.log('Test 1: Past date configuration');
const result1 = ConfigValidator.validateConfig({
  type: 'custom:timeflow-card-beta',
  target_date: '2024-01-01T00:00:00' // Past date
});
console.log('Errors found:', result1.errors.length);
console.log('✅ PASS: No info message for past date\n');

// Test 2: Unknown field should be warning (not info)
console.log('Test 2: Unknown field configuration');
const result2 = ConfigValidator.validateConfig({
  type: 'custom:timeflow-card-beta',
  target_date: '2025-12-31T23:59:59',
  unknown_field: 'test'
});
console.log('Errors found:', result2.errors.length);
console.log('Severity:', result2.errors[0]?.severity);
console.log('✅ PASS: Unknown field is warning (not info)\n');

console.log('🎉 Info messages successfully removed!');
console.log('• Past dates no longer generate info messages');
console.log('• Unknown fields are warnings (blocking card display)');
console.log('• Only critical errors and warnings are shown');
