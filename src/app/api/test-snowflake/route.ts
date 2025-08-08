import { snowflakeManager } from '@/lib/snowflake';

export async function GET() {
  try {
    console.log('🧪 Testing Snowflake connection with BIZ_APPS role...');
    const result = await snowflakeManager.execute('SELECT CURRENT_TIMESTAMP() as test_time, CURRENT_ROLE() as role');
    return Response.json({ 
      success: true, 
      message: 'Snowflake connection successful with BIZ_APPS role!',
      testTime: result[0]?.TEST_TIME,
      role: result[0]?.ROLE,
      database: process.env.SNOWFLAKE_DATABASE,
      schema: process.env.SNOWFLAKE_SCHEMA
    });
  } catch (error: any) {
    console.error('❌ Snowflake connection test failed:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 