#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Script to prepare environment variables for Vercel deployment
console.log('🔧 Preparing environment variables for Vercel deployment...\n');

// Read the private key file
const privateKeyPath = process.env.PRIVATE_KEY_PATH || '/Users/jugal.sheth/Desktop/Python/Pricing/snowflakekey/snowflake_x509_key copy.p8';

try {
  if (!fs.existsSync(privateKeyPath)) {
    console.error('❌ Private key file not found at:', privateKeyPath);
    console.log('Please set the correct PRIVATE_KEY_PATH environment variable');
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
  console.log(`SNOWFLAKE_DATABASE=${process.env.SNOWFLAKE_DATABASE || 'VXSFINANCE_CORE_DATA_TEST'}`);
  console.log(`SNOWFLAKE_SCHEMA=${process.env.SNOWFLAKE_SCHEMA || 'REPORTING_MODEL'}`);
  console.log(`SNOWFLAKE_PRIVATE_KEY=${base64Key}`);
  console.log(`OPENAI_API_KEY=${process.env.OPENAI_API_KEY || 'your-openai-api-key'}`);
  console.log('\n📝 Instructions:');
  console.log('1. Copy these environment variables to your Vercel project settings');
  console.log('2. Go to your Vercel dashboard → Project Settings → Environment Variables');
  console.log('3. Add each variable with the exact name and value shown above');
  console.log('4. Make sure to set them for Production, Preview, and Development environments');
  console.log('\n⚠️  Important: Keep your private key secure and never commit it to version control!');

} catch (error) {
  console.error('❌ Error preparing environment variables:', error.message);
  process.exit(1);
} 