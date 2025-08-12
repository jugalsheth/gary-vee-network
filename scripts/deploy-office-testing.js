#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(`🚀 ${title}`, 'cyan');
  console.log('='.repeat(60));
}

function generateEnvVars() {
  logSection('Environment Variables Setup');
  
  const envVars = {
    // Database (from your existing setup)
    SNOWFLAKE_ACCOUNT: 'jva07313.us-east-1',
    SNOWFLAKE_USERNAME: 'BIZ_APPS_TABLEAU_USER',
    SNOWFLAKE_ROLE: 'BIZ_APPS',
    SNOWFLAKE_WAREHOUSE: 'COMPUTE_WH',
    SNOWFLAKE_DATABASE: 'VXSFINANCE_CORE_DATA',
    SNOWFLAKE_SCHEMA: 'REPORTING_MODEL',
    SNOWFLAKE_PRIVATE_KEY: '[YOUR_BASE64_PRIVATE_KEY]',
    
    // Security
    TEST_PASSWORD: 'garyvee2024',
    WHITELISTED_IPS: '192.168.1.1,10.0.0.1', // Optional - office IPs
    
    // Environment
    NODE_ENV: 'production',
    
    // Optional
    CACHE_TTL: '900000',
    MAX_CACHE_SIZE: '500'
  };
  
  log('📋 Required Environment Variables for Vercel:', 'yellow');
  console.log('');
  
  Object.entries(envVars).forEach(([key, value]) => {
    log(`${key}=${value}`, 'blue');
  });
  
  console.log('');
  log('⚠️  IMPORTANT:', 'red');
  log('1. Replace [YOUR_BASE64_PRIVATE_KEY] with your actual base64-encoded private key', 'yellow');
  log('2. Update WHITELISTED_IPS with your office IP addresses (optional)', 'yellow');
  log('3. Set TEST_PASSWORD to a secure password for your team', 'yellow');
  
  return envVars;
}

function showDeploymentSteps() {
  logSection('Deployment Steps');
  
  log('1. 📦 Deploy to Vercel:', 'yellow');
  console.log('   npm i -g vercel');
  console.log('   vercel --prod');
  console.log('');
  
  log('2. 🔧 Set Environment Variables in Vercel Dashboard:', 'yellow');
  console.log('   - Go to https://vercel.com/dashboard');
  console.log('   - Select your project');
  console.log('   - Settings → Environment Variables');
  console.log('   - Add all variables from above');
  console.log('');
  
  log('3. 🔒 Test Password Protection:', 'yellow');
  console.log('   - Visit your deployed URL');
  console.log('   - You should see a login page');
  console.log('   - Enter the TEST_PASSWORD');
  console.log('');
  
  log('4. 📊 Verify Features:', 'yellow');
  console.log('   - Check Performance Dashboard');
  console.log('   - Test rate limiting');
  console.log('   - Verify error monitoring');
  console.log('');
}

function showUserInstructions() {
  logSection('Instructions for Office Users');
  
  log('🔗 Access Information:', 'yellow');
  console.log('   URL: https://your-app.vercel.app');
  console.log('   Password: garyvee2024 (or your custom password)');
  console.log('');
  
  log('📱 Testing Checklist:', 'yellow');
  console.log('   ✅ Search functionality');
  console.log('   ✅ Contact management');
  console.log('   ✅ Voice recording');
  console.log('   ✅ Mobile responsiveness');
  console.log('   ✅ Performance dashboard');
  console.log('');
  
  log('🚨 Security Features Active:', 'green');
  console.log('   🔒 Password protection');
  console.log('   🛡️ Rate limiting');
  console.log('   📊 Error monitoring');
  console.log('   🌐 IP whitelisting (optional)');
  console.log('');
}

function showMonitoringInfo() {
  logSection('Monitoring & Support');
  
  log('📊 Performance Dashboard:', 'yellow');
  console.log('   - Click the "Performance" button (bottom-right)');
  console.log('   - View real-time metrics');
  console.log('   - Monitor error rates');
  console.log('');
  
  log('🔍 API Endpoints:', 'yellow');
  console.log('   - /api/monitoring/errors - Error statistics');
  console.log('   - /api/cache - Cache performance');
  console.log('   - /api/contacts/analytics - Usage analytics');
  console.log('');
  
  log('📞 Troubleshooting:', 'yellow');
  console.log('   - Check error monitoring dashboard');
  console.log('   - Review rate limiting logs');
  console.log('   - Monitor cache hit rates');
  console.log('');
}

function main() {
  log('🔒 Office Testing Deployment Setup', 'bold');
  log('This will help you deploy your app with password protection for office testing', 'cyan');
  
  generateEnvVars();
  showDeploymentSteps();
  showUserInstructions();
  showMonitoringInfo();
  
  logSection('Next Steps');
  log('1. Deploy to Vercel using the steps above', 'green');
  log('2. Set environment variables in Vercel dashboard', 'green');
  log('3. Test password protection locally first', 'green');
  log('4. Share access with your office team', 'green');
  log('5. Monitor usage and gather feedback', 'green');
  
  console.log('');
  log('🎉 Your app will be ready for secure office testing!', 'bold');
}

if (require.main === module) {
  main();
}

module.exports = {
  generateEnvVars,
  showDeploymentSteps,
  showUserInstructions
};
