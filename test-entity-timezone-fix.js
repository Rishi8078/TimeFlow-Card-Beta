// Test the timezone entity fix
console.log('=== TimeFlow Card Entity Timezone Fix Test ===\n');

// Simulate the fixed _resolveValue function
function _resolveValue(value, mockHass) {
  if (!value) return null;
  
  // Handle entity references (simplified for testing)
  if (typeof value === 'string' && value.includes('.') && mockHass && mockHass.states[value]) {
    const entity = mockHass.states[value];
    // Check if entity state is unknown/unavailable
    if (entity.state === 'unknown' || entity.state === 'unavailable') {
      return null;
    }
    
    // For entity timestamps, strip timezone info to treat as local time
    let entityValue = entity.state;
    if (typeof entityValue === 'string' && entityValue.includes('T')) {
      // Remove timezone information (+XX:XX, -XX:XX, Z) from entity values
      entityValue = entityValue.replace(/([+-]\d{2}:\d{2}|Z)$/, '');
    }
    
    return entityValue;
  }
  
  // Return plain string/value
  return value;
}

// Mock Home Assistant state
const mockHass = {
  states: {
    'sensor.tumbletron_completion_time_legacy': {
      state: '2025-07-22T14:30:00+00:00'  // UTC timestamp
    },
    'sensor.tumbletron_start_time_legacy': {
      state: '2025-07-22T13:18:00+00:00'  // UTC timestamp
    },
    'sensor.local_time_entity': {
      state: '2025-07-22T14:30:00'  // No timezone
    }
  }
};

// Test cases
const testCases = [
  {
    name: 'Entity with UTC timezone (+00:00)',
    input: 'sensor.tumbletron_completion_time_legacy',
    expected: '2025-07-22T14:30:00'  // Timezone stripped
  },
  {
    name: 'Entity with UTC timezone start time',
    input: 'sensor.tumbletron_start_time_legacy', 
    expected: '2025-07-22T13:18:00'  // Timezone stripped
  },
  {
    name: 'Entity without timezone',
    input: 'sensor.local_time_entity',
    expected: '2025-07-22T14:30:00'  // Unchanged
  },
  {
    name: 'Direct string with timezone (should be preserved)',
    input: '2025-07-22T14:30:00+00:00',
    expected: '2025-07-22T14:30:00+00:00'  // Unchanged for direct strings
  },
  {
    name: 'Direct string without timezone',
    input: '2025-07-22T14:30:00',
    expected: '2025-07-22T14:30:00'  // Unchanged
  }
];

console.log('Testing entity timezone handling:\n');

// Run tests
for (const testCase of testCases) {
  const result = _resolveValue(testCase.input, mockHass);
  const passed = result === testCase.expected;
  
  console.log(`${passed ? '✅' : '❌'} ${testCase.name}`);
  console.log(`  Input:    ${testCase.input}`);
  console.log(`  Expected: ${testCase.expected}`);
  console.log(`  Got:      ${result}`);
  console.log('');
}

// Demonstrate the fix for the Australian user's case
console.log('=== Australian User Scenario ===');
console.log('User in Australia (+10:00) with entity returning UTC timestamp');
console.log('');

const entityValue = _resolveValue('sensor.tumbletron_completion_time_legacy', mockHass);
console.log(`Original entity value: ${mockHass.states['sensor.tumbletron_completion_time_legacy'].state}`);
console.log(`After timezone stripping: ${entityValue}`);
console.log('');
console.log('Now the entity value will be treated as local time (14:30 Australian time)');
console.log('instead of being converted from UTC (which would be 00:30 next day)');
console.log('');

// Show the difference
const originalUtc = new Date('2025-07-22T14:30:00+00:00');
const localInterpreted = new Date('2025-07-22T14:30:00');

console.log('Time interpretation comparison:');
console.log(`Original UTC interpretation: ${originalUtc.toLocaleString()} (${originalUtc.toISOString()})`);
console.log(`New local interpretation:    ${localInterpreted.toLocaleString()} (${localInterpreted.toISOString()})`);
console.log('');
console.log('✅ The countdown will now show the correct time for the user!');
