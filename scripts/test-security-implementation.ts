/**
 * Test script to verify security implementations
 */

import { 
  isValidObjectId, 
  validateSessionCompletionRequest, 
  containsSqlInjectionPatterns,
  containsNoSqlInjectionPatterns,
  sanitizeString 
} from '../lib/input-validation';

console.log('🔒 Testing Security Implementation...\n');

// Test 1: ObjectId validation
console.log('1. Testing ObjectId validation:');
console.log('  Valid ObjectId:', isValidObjectId('507f1f77bcf86cd799439011')); // Should be true
console.log('  Invalid ObjectId:', isValidObjectId('invalid-id')); // Should be false
console.log('  Empty string:', isValidObjectId('')); // Should be false

// Test 2: Session completion request validation
console.log('\n2. Testing session completion request validation:');
const validRequest = {
  sessionId: '507f1f77bcf86cd799439011',
  stationId: '507f1f77bcf86cd799439012'
};
const validResult = validateSessionCompletionRequest(validRequest);
console.log('  Valid request:', validResult.isValid); // Should be true

const invalidRequest = { sessionId: 'invalid' };
const invalidResult = validateSessionCompletionRequest(invalidRequest);
console.log('  Invalid request:', invalidResult.isValid); // Should be false
console.log('  Error message:', invalidResult.error);

// Test 3: SQL injection detection
console.log('\n3. Testing SQL injection detection:');
console.log('  Malicious input:', containsSqlInjectionPatterns("'; DROP TABLE users; --")); // Should be true
console.log('  Safe input:', containsSqlInjectionPatterns("normal text")); // Should be false

// Test 4: NoSQL injection detection
console.log('\n4. Testing NoSQL injection detection:');
console.log('  Malicious object:', containsNoSqlInjectionPatterns({ $where: "function() { return true; }" })); // Should be true
console.log('  Safe object:', containsNoSqlInjectionPatterns({ name: "Station 1" })); // Should be false

// Test 5: String sanitization
console.log('\n5. Testing string sanitization:');
console.log('  Sanitized HTML:', sanitizeString('<script>alert("xss")</script>')); // Should be empty
console.log('  Sanitized text:', sanitizeString('<div>Hello World</div>')); // Should be "Hello World"

console.log('\n✅ Security implementation tests completed!');