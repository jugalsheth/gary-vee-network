#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Gary Vee Network - Vercel Deployment Setup');
console.log('=============================================\n');

// Read the private key file
const privateKeyPath = process.env.PRIVATE_KEY_PATH || '/Users/jugal.sheth/Desktop/Python/Pricing/snowflakekey/snowflake_x509_key copy.p8';

try {
  if (!fs.existsSync(privateKeyPath)) {
    console.error('❌ Private key file not found at:', privateKeyPath);
    console.log('\nPlease set the correct PRIVATE_KEY_PATH environment variable');
    console.log('Example: export PRIVATE_KEY_PATH="/path/to/your/snowflake_key.p8"');
    process.exit(1);
  }

  const privateKeyContent = fs.readFileSync(privateKeyPath, 'utf8');
  const base64Key = Buffer.from(privateKeyContent).toString('base64');

  console.log('✅ Private key converted to base64 successfully!');
  console.log('\n📋 Environment variables for Vercel:');
  console.log('=====================================');
  console.log(`SNOWFLAKE_ACCOUNT=${process.env.SNOWFLAKE_ACCOUNT || 'jva07313.us-east-1'}`);
  console.log(`SNOWFLAKE_USERNAME=${process.env.SNOWFLAKE_USERNAME || 'BIZ_APPS_TABLEAU_USER'}`);
  console.log(`SNOWFLAKE_ROLE=${process.env.SNOWFLAKE_ROLE || 'BIZ_APPS'}`);
  console.log(`SNOWFLAKE_WAREHOUSE=${process.env.SNOWFLAKE_WAREHOUSE || 'COMPUTE_WH'}`);
  console.log(`SNOWFLAKE_DATABASE=${process.env.SNOWFLAKE_DATABASE || 'VXSFINANCE_CORE_DATA'}`);
  console.log(`SNOWFLAKE_SCHEMA=${process.env.SNOWFLAKE_SCHEMA || 'REPORTING_MODEL'}`);
  console.log(`SNOWFLAKE_PRIVATE_KEY=${base64Key}`);
  console.log(`OPENAI_API_KEY=${process.env.OPENAI_API_KEY || 'your-openai-api-key'}`);
  
  console.log('\n📝 Deployment Instructions:');
  console.log('==========================');
  console.log('1. Go to your Vercel dashboard: https://vercel.com/dashboard');
  console.log('2. Select your project (gary-vee-network)');
  console.log('3. Go to Settings → Environment Variables');
  console.log('4. Add each variable above with the exact name and value');
  console.log('5. Make sure to set them for Production, Preview, and Development environments');
  console.log('6. Deploy your application');
  
  console.log('\n🔧 Alternative: Use Vercel CLI');
  console.log('============================');
  console.log('1. Install Vercel CLI: npm i -g vercel');
  console.log('2. Run: vercel env add SNOWFLAKE_ACCOUNT');
  console.log('3. Repeat for each environment variable');
  console.log('4. Deploy: vercel --prod');
  
  console.log('\n⚠️  Security Notes:');
  console.log('==================');
  console.log('• Keep your private key secure and never commit it to version control');
  console.log('• The base64 key above is for Vercel environment variables only');
  console.log('• Your local development will continue using the file-based key');
  
  console.log('\n✅ Your working code is safe on the main branch!');
  console.log('This deployment setup is on the deployment-setup branch.');

} catch (error) {
  console.error('❌ Error preparing deployment:', error.message);
  process.exit(1);
} 