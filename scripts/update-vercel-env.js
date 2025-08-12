const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔄 Updating Vercel environment variables with local values...');

// Read .env.local file
const envPath = '.env.local';
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

// Parse .env.local file
envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key] = valueParts.join('=');
    }
  }
});

console.log(`📋 Found ${Object.keys(envVars).length} environment variables in .env.local`);

// Variables to update
const variablesToUpdate = [
  'JWT_SECRET',
  'SNOWFLAKE_ACCOUNT',
  'SNOWFLAKE_USERNAME', 
  'SNOWFLAKE_ROLE',
  'SNOWFLAKE_WAREHOUSE',
  'SNOWFLAKE_DATABASE',
  'SNOWFLAKE_SCHEMA',
  'SNOWFLAKE_PRIVATE_KEY',
  'OPENAI_API_KEY'
];

console.log('\n🔄 Updating variables in Vercel...');

variablesToUpdate.forEach(varName => {
  if (envVars[varName]) {
    try {
      console.log(`📝 Updating ${varName}...`);
      
      // Remove existing variable first
      try {
        execSync(`vercel env rm ${varName} production --yes`, { stdio: 'pipe' });
        console.log(`🗑️  Removed existing ${varName}`);
      } catch (error) {
        // Variable might not exist, that's okay
      }
      
      // Add new variable
      const command = `vercel env add ${varName} production`;
      const child = execSync(command, { 
        input: envVars[varName] + '\n',
        stdio: ['pipe', 'pipe', 'pipe'],
        encoding: 'utf8'
      });
      
      console.log(`✅ Updated ${varName}`);
    } catch (error) {
      console.log(`❌ Failed to update ${varName}:`, error.message);
    }
  } else {
    console.log(`⚠️  ${varName} not found in .env.local`);
  }
});

console.log('\n🎉 Environment variables update completed!');
console.log('\n📋 Next steps:');
console.log('1. Redeploy your application: vercel --prod');
console.log('2. Test your application');
console.log('3. Check that authentication works');

console.log('\n🔗 Your app URL: https://gary-vee-network-j70f4ae13-jugalsheths-projects.vercel.app');
console.log('🧪 Test URL: https://gary-vee-network-j70f4ae13-jugalsheths-projects.vercel.app/test-auth');
