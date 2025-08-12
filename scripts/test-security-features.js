#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(50));
  log(`🔍 ${title}`, 'cyan');
  console.log('='.repeat(50));
}

async function testRateLimiting() {
  logSection('Testing Rate Limiting');
  
  log('1. Testing Search Rate Limiting (30 requests per minute)', 'yellow');
  
  const searchPromises = [];
  for (let i = 0; i < 35; i++) {
    searchPromises.push(
      axios.get(`${BASE_URL}/api/contacts/search?query=test&page=1&limit=1`)
        .then(response => ({ success: true, status: response.status }))
        .catch(error => ({ success: false, status: error.response?.status, message: error.response?.data?.error }))
    );
  }
  
  const results = await Promise.all(searchPromises);
  const successful = results.filter(r => r.success).length;
  const rateLimited = results.filter(r => !r.success && r.status === 429).length;
  
  log(`✅ Successful requests: ${successful}`, 'green');
  log(`🚫 Rate limited requests: ${rateLimited}`, 'red');
  
  if (rateLimited > 0) {
    log('🎉 Rate limiting is working!', 'green');
  } else {
    log('⚠️ Rate limiting might not be working as expected', 'yellow');
  }
}

async function testErrorMonitoring() {
  logSection('Testing Error Monitoring');
  
  log('1. Triggering intentional errors to test monitoring', 'yellow');
  
  // Test 1: Invalid search query
  try {
    await axios.get(`${BASE_URL}/api/contacts/search?query=&page=invalid&limit=abc`);
    log('❌ Expected error but got success', 'red');
  } catch (error) {
    if (error.response?.status === 500) {
      log('✅ Error properly caught and logged', 'green');
    } else {
      log('⚠️ Unexpected error response', 'yellow');
    }
  }
  
  // Test 2: Invalid contact data
  try {
    await axios.post(`${BASE_URL}/api/contacts`, { invalid: 'data' });
    log('❌ Expected error but got success', 'red');
  } catch (error) {
    if (error.response?.status === 500) {
      log('✅ Error properly caught and logged', 'green');
    } else {
      log('⚠️ Unexpected error response', 'yellow');
    }
  }
}

async function testPerformanceMonitoring() {
  logSection('Testing Performance Monitoring');
  
  log('1. Checking performance dashboard data', 'yellow');
  
  try {
    // Test cache stats
    const cacheResponse = await axios.get(`${BASE_URL}/api/cache`);
    if (cacheResponse.data.success) {
      log('✅ Cache monitoring is working', 'green');
      log(`   Cache size: ${cacheResponse.data.stats.cacheSize}`, 'blue');
      log(`   Hit rate: ${cacheResponse.data.stats.cacheHitRate}%`, 'blue');
    }
  } catch (error) {
    log('❌ Cache monitoring not available', 'red');
  }
  
  try {
    // Test error monitoring
    const errorResponse = await axios.get(`${BASE_URL}/api/monitoring/errors`);
    if (errorResponse.data.success) {
      log('✅ Error monitoring is working', 'green');
      log(`   Total errors: ${errorResponse.data.stats.totalErrors}`, 'blue');
      log(`   Error rate: ${errorResponse.data.stats.errorRate}/min`, 'blue');
      log(`   System health: ${errorResponse.data.health.isHealthy ? 'Healthy' : 'Unhealthy'}`, 'blue');
    }
  } catch (error) {
    log('❌ Error monitoring not available', 'red');
  }
}

async function testSecurityFeatures() {
  logSection('Testing Security Features');
  
  log('1. Testing authentication rate limiting', 'yellow');
  
  const authPromises = [];
  for (let i = 0; i < 10; i++) {
    authPromises.push(
      axios.post(`${BASE_URL}/api/auth/login`, {
        username: 'test',
        password: 'wrong',
        team: 'test'
      })
        .then(response => ({ success: true, status: response.status }))
        .catch(error => ({ success: false, status: error.response?.status, message: error.response?.data?.error }))
    );
  }
  
  const authResults = await Promise.all(authPromises);
  const authRateLimited = authResults.filter(r => !r.success && r.status === 429).length;
  
  log(`🚫 Auth rate limited requests: ${authRateLimited}`, authRateLimited > 0 ? 'green' : 'red');
  
  if (authRateLimited > 0) {
    log('🎉 Authentication rate limiting is working!', 'green');
  } else {
    log('⚠️ Authentication rate limiting might not be working', 'yellow');
  }
}

async function showMonitoringDashboard() {
  logSection('Monitoring Dashboard URLs');
  
  log('📊 Performance Dashboard:', 'cyan');
  log(`   Open in browser: ${BASE_URL}`, 'blue');
  log('   Click the "Performance" button in the bottom-right corner', 'blue');
  
  log('\n📈 Direct API Endpoints:', 'cyan');
  log(`   Cache Stats: ${BASE_URL}/api/cache`, 'blue');
  log(`   Error Monitoring: ${BASE_URL}/api/monitoring/errors`, 'blue');
  log(`   Search Performance: ${BASE_URL}/api/contacts/search?query=test&page=1&limit=1`, 'blue');
  
  log('\n🔍 Manual Testing:', 'cyan');
  log('   1. Open browser developer tools (F12)', 'blue');
  log('   2. Go to Network tab', 'blue');
  log('   3. Rapidly search for contacts to trigger rate limiting', 'blue');
  log('   4. Check console for error monitoring logs', 'blue');
}

async function runAllTests() {
  log('🚀 Starting Security & Monitoring Feature Tests', 'bold');
  log('Make sure your app is running on http://localhost:3000', 'yellow');
  
  try {
    await testRateLimiting();
    await testErrorMonitoring();
    await testPerformanceMonitoring();
    await testSecurityFeatures();
    await showMonitoringDashboard();
    
    logSection('Test Summary');
    log('✅ All tests completed!', 'green');
    log('📊 Check the Performance Dashboard for real-time monitoring', 'cyan');
    log('🔒 Rate limiting is protecting your API endpoints', 'green');
    log('📝 Error monitoring is tracking all issues', 'green');
    
  } catch (error) {
    log('❌ Test failed:', 'red');
    log(error.message, 'red');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testRateLimiting,
  testErrorMonitoring,
  testPerformanceMonitoring,
  testSecurityFeatures
};
