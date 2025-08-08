import snowflake from 'snowflake-sdk';

interface SnowflakeConfig {
  account: string;
  username: string;
  role: string;
  warehouse: string;
  database: string;
  schema: string;
  privateKey: string;
}

// --- Connection Pool Implementation ---
class SnowflakeConnectionPool {
  private pool: snowflake.Connection[] = [];
  private maxConnections: number = 10;
  private config: SnowflakeConfig;
  private privateKey: string;

  constructor(config: SnowflakeConfig, privateKey: string) {
    this.config = config;
    this.privateKey = privateKey;
  }

  async getConnection(): Promise<snowflake.Connection> {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    // Create a new connection if under max limit
    return new Promise((resolve, reject) => {
      const connection = snowflake.createConnection({
        ...this.config,
        authenticator: 'SNOWFLAKE_JWT',
        privateKey: this.privateKey,
      });
      connection.connect((err: unknown) => {
        if (err instanceof Error) {
          reject(err);
        } else {
          resolve(connection);
        }
      });
    });
  }

  releaseConnection(conn: snowflake.Connection) {
    if (this.pool.length < this.maxConnections) {
      this.pool.push(conn);
    } else {
      // Optionally destroy connection if pool is full
      conn.destroy(() => {});
    }
  }
}

// --- Vercel Deployment SnowflakeManager ---
class SnowflakeManagerVercelDeploy {
  private pool: SnowflakeConnectionPool | null = null;
  private config: SnowflakeConfig | null = null;
  private privateKey: string = '';

  constructor() {
    // Only initialize if we're in a server environment and have the required env vars
    if (typeof window === 'undefined' && this.hasRequiredEnvVars()) {
      this.loadPrivateKeyFromEnv();
      this.config = {
        account: process.env.SNOWFLAKE_ACCOUNT!,
        username: process.env.SNOWFLAKE_USERNAME!,
        role: process.env.SNOWFLAKE_ROLE!,
        warehouse: process.env.SNOWFLAKE_WAREHOUSE!,
        database: process.env.SNOWFLAKE_DATABASE!,
        schema: process.env.SNOWFLAKE_SCHEMA!,
        privateKey: this.privateKey,
      };
      this.pool = new SnowflakeConnectionPool(this.config, this.privateKey);
      console.log('✅ SnowflakeManagerVercelDeploy initialized successfully');
    } else {
      console.warn('⚠️ SnowflakeManagerVercelDeploy not initialized: Missing environment variables or running in client context.');
    }
  }

  private hasRequiredEnvVars(): boolean {
    const required = [
      'SNOWFLAKE_ACCOUNT',
      'SNOWFLAKE_USERNAME', 
      'SNOWFLAKE_ROLE',
      'SNOWFLAKE_WAREHOUSE',
      'SNOWFLAKE_DATABASE',
      'SNOWFLAKE_SCHEMA',
      'SNOWFLAKE_PRIVATE_KEY'
    ];
    
    const missing = required.filter(env => !process.env[env]);
    if (missing.length > 0) {
      console.warn('⚠️ Missing environment variables:', missing);
      return false;
    }
    return true;
  }

  private loadPrivateKeyFromEnv(): void {
    try {
      const privateKeyEnv = process.env.SNOWFLAKE_PRIVATE_KEY;

      if (!privateKeyEnv) {
        throw new Error('SNOWFLAKE_PRIVATE_KEY environment variable is not set');
      }

      const privateKeyString = Buffer.from(privateKeyEnv, 'base64').toString('utf8').replace(/\r\n/g, '\n');
      this.privateKey = privateKeyString;

      console.log('✅ Private key loaded from environment variable');
      console.log('🔍 Key preview:', this.privateKey.substring(0, 50) + '...');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('❌ Failed to load private key from environment:', error);
        throw new Error(`Private key loading failed: ${error.message}`);
      }
    }
  }

  async execute(query: string, binds?: any[]): Promise<any> {
    if (!this.pool) {
      console.error('❌ Snowflake connection pool is not initialized. Cannot execute query.');
      throw new Error('Snowflake connection not available.');
    }
    
    const conn = await this.pool.getConnection();
    try {
      // LOG EVERY SINGLE SQL QUERY AND PARAMETER
      console.log('🔍 EXECUTING SQL QUERY:');
      console.log('📝 Query:', query);
      console.log('📊 Binds:', binds);
      // Check for VARIANT references in the query
      if (query.includes('interests') || query.includes('connections') || query.includes('voice_notes')) {
        console.error('🚨 FOUND VARIANT FIELD IN QUERY!');
        console.error('🚨 Query:', query);
        console.error('🚨 This is causing the VARIANT error!');
      }
      return await new Promise((resolve, reject) => {
        conn.execute({
          sqlText: query,
          binds: binds,
          complete: (err: any, stmt: any, rows: any) => {
            if (err) {
              console.error('❌ SQL EXECUTION FAILED:');
              console.error('❌ Query:', query);
              console.error('❌ Binds:', binds);
              console.error('❌ Error details:', err);
              return reject(err);
            }
            console.log('✅ SQL SUCCESS:', rows?.length || 0, 'rows affected');
            resolve(rows);
          },
        });
      });
    } finally {
      this.pool.releaseConnection(conn);
    }
  }

  async connect(): Promise<void> {
    if (!this.pool) {
      console.warn('⚠️ No pool to connect to - environment variables may be missing');
      return;
    }
    console.log('🔗 Snowflake connection established');
  }
}

export const snowflakeManagerVercelDeploy = new SnowflakeManagerVercelDeploy(); 