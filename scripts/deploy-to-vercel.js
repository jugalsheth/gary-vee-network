#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel deployment...');

// Check if Vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'pipe' });
  console.log('✅ Vercel CLI is installed');
} catch (error) {
  console.log('❌ Vercel CLI not found. Installing...');
  execSync('npm install -g vercel', { stdio: 'inherit' });
}

// Check if .env.local exists and create .env.production
const envLocalPath = path.join(process.cwd(), '.env.local');
const envProductionPath = path.join(process.cwd(), '.env.production');

if (fs.existsSync(envLocalPath)) {
  console.log('📁 Found .env.local, creating .env.production...');
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  fs.writeFileSync(envProductionPath, envContent);
  console.log('✅ Created .env.production');
} else {
  console.log('⚠️  No .env.local found. Please create one with your environment variables.');
}

// Build the project
console.log('🔨 Building project...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.log('❌ Build failed:', error.message);
  process.exit(1);
}

// Deploy to Vercel
console.log('🚀 Deploying to Vercel...');
try {
  execSync('vercel --prod', { stdio: 'inherit' });
  console.log('✅ Deployment completed successfully!');
} catch (error) {
  console.log('❌ Deployment failed:', error.message);
  process.exit(1);
}

console.log('🎉 Your Gary Vee Network is now live on Vercel!'); 