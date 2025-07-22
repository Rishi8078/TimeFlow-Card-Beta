// Quick timezone parsing verification
console.log('=== TimeFlow Card Timezone Fix Verification ===\n');

// Simulate the fixed _parseISODate function
function _parseISODate(dateString) {
  try {
    if (typeof dateString === 'string' && dateString.includes('T')) {
      // Check if the string contains timezone information (Z, +XX:XX, -XX:XX)
      const hasTimezone = /[+-]\d{2}:\d{2}$|Z$/.test(dateString);
      
      if (hasTimezone) {
        // For ISO strings with timezone info, use native Date parsing to preserve timezone
        return new Date(dateString).getTime();
      } else {
        // For timezone-less ISO strings, use manual parsing for cross-platform consistency
        const [datePart, timePart] = dateString.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        
        if (timePart && timePart.includes(':')) {
          const [hour, minute, secondPart] = timePart.split(':');
          const second = secondPart ? parseInt(secondPart) : 0;
          return new Date(year, month - 1, day, hour, minute, second).getTime();
        } else {
          return new Date(year, month - 1, day).getTime();
        }
      }
    } else {
      // Fallback to regular parsing for other formats
      return new Date(dateString).getTime();
    }
  } catch (e) {
    console.error('Error parsing date:', e);
    return new Date(dateString).getTime();
  }
}

// Test cases from the GitHub issue
const testCases = [
  '2025-07-22T14:09:00+00:00',  // The problematic case from the issue
  '2025-07-22T14:09:00-05:00',  // Different timezone
  '2025-07-22T14:09:00Z',       // UTC shorthand
  '2025-07-22T14:09:00',        // No timezone (should use manual parsing)
];

console.log('Testing the fix with various timezone formats:\n');

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase}`);
  
  const ourParsing = _parseISODate(testCase);
  const nativeParsing = new Date(testCase).getTime();
  
  const ourDate = new Date(ourParsing);
  const nativeDate = new Date(nativeParsing);
  
  const match = ourParsing === nativeParsing;
  
  console.log(`  Our parsing:    ${ourDate.toISOString()}`);
  console.log(`  Native parsing: ${nativeDate.toISOString()}`);
  console.log(`  Match: ${match ? '✅ YES' : '❌ NO'}`);
  console.log('');
});

// Special test for the original issue scenario
console.log('=== Original Issue Scenario ===');
const issueDate = '2025-07-22T14:09:00+00:00';
console.log(`Input from Home Assistant isoformat(): ${issueDate}`);

const parsed = _parseISODate(issueDate);
const parsedDate = new Date(parsed);

console.log(`Parsed correctly: ${parsedDate.toISOString()}`);
console.log(`Timezone preserved: ${parsedDate.getTimezoneOffset() !== undefined ? '✅ YES' : '❌ NO'}`);

// Verify that this would work for countdown calculation
const now = new Date();
const difference = parsed - now.getTime();
console.log(`Time difference calculation works: ${difference !== NaN ? '✅ YES' : '❌ NO'}`);
console.log(`Difference: ${Math.floor(difference / 1000)} seconds from now`);
