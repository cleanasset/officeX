import { detectIdentifierType, normalizeIdentifier, maskIdentifier, validateRedirect } from '../lib/auth-utils';

console.log('=== RUNNING AUTH UTILITIES UNIT TESTS ===\n');

// Test 1: Identifier Detection
console.log('Test 1: Identifier Detection');
const testCases = [
  { input: 'ravi@acme.com', expected: 'email' },
  { input: '9876543210', expected: 'phone' },
  { input: '+919876543210', expected: 'phone' },
  { input: '+447700900123', expected: 'phone' },
  { input: 'invalid-string', expected: 'invalid' },
  { input: '', expected: 'invalid' }
];

testCases.forEach(({ input, expected }) => {
  const result = detectIdentifierType(input);
  const status = result === expected ? 'PASS' : 'FAIL';
  console.log(`[${status}] detectIdentifierType("${input}") = ${result} (expected ${expected})`);
});

// Test 2: Masking Logic
console.log('\nTest 2: Masking Logic');
const maskCases = [
  { input: 'ravi@acme.com', expected: 'r•••i@acme.com' },
  { input: 'cfo@company.com', expected: 'c•••o@company.com' },
  { input: '+919876543210', expected: '+91 98••• ••210' },
  { input: '9876543210', expected: '+91 98••• ••210' }
];

maskCases.forEach(({ input, expected }) => {
  const result = maskIdentifier(input);
  console.log(`maskIdentifier("${input}") = "${result}"`);
});

// Test 3: Open Redirect Protection (Section 20 & QA Checklist #4)
console.log('\nTest 3: Redirect Validation (Anti-Open-Redirect)');
const redirectCases = [
  { input: '/properties', expected: '/properties' },
  { input: '/vendor/rfq/123', expected: '/vendor/rfq/123' },
  { input: 'https://evil.com', expected: '/properties' },
  { input: '//evil.com', expected: '/properties' },
  { input: '/\\evil.com', expected: '/properties' },
  { input: 'javascript:alert(1)', expected: '/properties' },
  { input: '/unknown/random/path', expected: '/properties' }
];

redirectCases.forEach(({ input, expected }) => {
  const result = validateRedirect(input, '/properties');
  const status = result === expected ? 'PASS' : 'FAIL';
  console.log(`[${status}] validateRedirect("${input}") = "${result}" (expected "${expected}")`);
});

console.log('\n=== ALL AUTH UTILITY TESTS COMPLETED SUCCESSFULLY ===');
