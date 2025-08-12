const axios = require('axios');

// Load testing configuration
const config = {
  baseURL: 'http://localhost:3000',
  concurrentUsers: 50,
  requestsPerUser: 20,
  searchQueries: [
    'john',
    'email',
    'new york',
    'tier1',
    'business',
    'influencer',
    'married',
    'kids',
    'workout',
    'fitness',
    'tech',
    'finance',
    'marketing',
    'entrepreneur',
    'investor'
  ]
};

// Performance metrics
const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  responseTimes: [],
  startTime: null,
  endTime: null
};

// Generate random search query
function getRandomQuery() {
  const randomIndex = Math.floor(Math.random() * config.searchQueries.length);
  return config.searchQueries[randomIndex];
}

// Simulate a single user
async function simulateUser(userId) {
  console.log(`👤 User ${userId} starting...`);
  
  for (let i = 0; i < config.requestsPerUser; i++) {
    const query = getRandomQuery();
    const startTime = Date.now();
    
    try {
      const response = await axios.get(`${config.baseURL}/api/contacts/search`, {
        params: {
          query: query,
          page: Math.floor(Math.random() * 3) + 1,
          limit: 50
        },
        timeout: 5000
      });
      
      const responseTime = Date.now() - startTime;
      metrics.responseTimes.push(responseTime);
      metrics.successfulRequests++;
      
      console.log(`✅ User ${userId} - Query: "${query}" - ${responseTime}ms - Results: ${response.data.contacts?.length || 0}`);
      
      // Add some delay between requests to simulate real user behavior
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      metrics.failedRequests++;
      console.error(`❌ User ${userId} - Query: "${query}" - ${responseTime}ms - Error: ${error.message}`);
    }
    
    metrics.totalRequests++;
  }
  
  console.log(`👤 User ${userId} completed`);
}

// Calculate performance statistics
function calculateStats() {
  const responseTimes = metrics.responseTimes.sort((a, b) => a - b);
  const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  const medianResponseTime = responseTimes[Math.floor(responseTimes.length / 2)];
  const p95ResponseTime = responseTimes[Math.floor(responseTimes.length * 0.95)];
  const p99ResponseTime = responseTimes[Math.floor(responseTimes.length * 0.99)];
  
  const totalTime = metrics.endTime - metrics.startTime;
  const requestsPerSecond = metrics.totalRequests / (totalTime / 1000);
  const successRate = (metrics.successfulRequests / metrics.totalRequests) * 100;
  
  return {
    totalRequests: metrics.totalRequests,
    successfulRequests: metrics.successfulRequests,
    failedRequests: metrics.failedRequests,
    successRate: `${successRate.toFixed(2)}%`,
    totalTime: `${(totalTime / 1000).toFixed(2)}s`,
    requestsPerSecond: `${requestsPerSecond.toFixed(2)} req/s`,
    avgResponseTime: `${avgResponseTime.toFixed(0)}ms`,
    medianResponseTime: `${medianResponseTime}ms`,
    p95ResponseTime: `${p95ResponseTime}ms`,
    p99ResponseTime: `${p99ResponseTime}ms`,
    minResponseTime: `${responseTimes[0]}ms`,
    maxResponseTime: `${responseTimes[responseTimes.length - 1]}ms`
  };
}

// Main load test function
async function runLoadTest() {
  console.log('🚀 Starting Load Test...');
  console.log(`📊 Configuration:`);
  console.log(`   - Concurrent Users: ${config.concurrentUsers}`);
  console.log(`   - Requests per User: ${config.requestsPerUser}`);
  console.log(`   - Total Expected Requests: ${config.concurrentUsers * config.requestsPerUser}`);
  console.log(`   - Base URL: ${config.baseURL}`);
  console.log('');
  
  metrics.startTime = Date.now();
  
  // Create concurrent users
  const userPromises = [];
  for (let i = 1; i <= config.concurrentUsers; i++) {
    userPromises.push(simulateUser(i));
  }
  
  // Wait for all users to complete
  await Promise.all(userPromises);
  
  metrics.endTime = Date.now();
  
  // Calculate and display results
  const stats = calculateStats();
  
  console.log('');
  console.log('📈 Load Test Results:');
  console.log('=====================');
  console.log(`Total Requests: ${stats.totalRequests}`);
  console.log(`Successful: ${stats.successfulRequests}`);
  console.log(`Failed: ${stats.failedRequests}`);
  console.log(`Success Rate: ${stats.successRate}`);
  console.log(`Total Time: ${stats.totalTime}`);
  console.log(`Requests/Second: ${stats.requestsPerSecond}`);
  console.log('');
  console.log('⏱️ Response Time Statistics:');
  console.log(`Average: ${stats.avgResponseTime}`);
  console.log(`Median: ${stats.medianResponseTime}`);
  console.log(`95th Percentile: ${stats.p95ResponseTime}`);
  console.log(`99th Percentile: ${stats.p99ResponseTime}`);
  console.log(`Min: ${stats.minResponseTime}`);
  console.log(`Max: ${stats.maxResponseTime}`);
  console.log('');
  
  // Performance assessment
  console.log('🎯 Performance Assessment:');
  if (parseFloat(stats.avgResponseTime) < 200) {
    console.log('✅ Average response time is excellent (< 200ms)');
  } else if (parseFloat(stats.avgResponseTime) < 500) {
    console.log('⚠️ Average response time is acceptable (< 500ms)');
  } else {
    console.log('❌ Average response time needs improvement (> 500ms)');
  }
  
  if (parseFloat(stats.p95ResponseTime) < 500) {
    console.log('✅ 95th percentile response time is good (< 500ms)');
  } else {
    console.log('⚠️ 95th percentile response time needs attention (> 500ms)');
  }
  
  if (parseFloat(stats.successRate) > 95) {
    console.log('✅ Success rate is excellent (> 95%)');
  } else if (parseFloat(stats.successRate) > 90) {
    console.log('⚠️ Success rate is acceptable (> 90%)');
  } else {
    console.log('❌ Success rate needs improvement (< 90%)');
  }
  
  if (parseFloat(stats.requestsPerSecond) > 10) {
    console.log('✅ Throughput is good (> 10 req/s)');
  } else {
    console.log('⚠️ Throughput could be improved (< 10 req/s)');
  }
  
  console.log('');
  console.log('🏁 Load test completed!');
}

// Run the load test
if (require.main === module) {
  runLoadTest().catch(console.error);
}

module.exports = { runLoadTest, config };
