import snowflake from 'snowflake-sdk';

interface SnowflakeConfig {
  account: string;
  username: string;
  role: string;
  warehouse: string;
  database: string;
  schema: string;
  privateKey: string; // Changed from privateKeyPath to privateKey
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

// --- Vercel-compatible SnowflakeManager ---
class SnowflakeManagerVercel {
  private pool: SnowflakeConnectionPool;
  private config: SnowflakeConfig;
  private privateKey: string = '';

  constructor() {
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
  }

  private loadPrivateKeyFromEnv(): void {
    try {
      // For Vercel, we'll use an environment variable for the private key
      const privateKeyEnv = process.env.SNOWFLAKE_PRIVATE_KEY;
      
      if (!privateKeyEnv) {
        throw new Error('SNOWFLAKE_PRIVATE_KEY environment variable is not set');
      }

      // The private key should be stored as a base64 encoded string in Vercel
      // Decode it and normalize line endings
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
              console.error('❌ Error:', err);
              reject(err);
            } else {
              console.log(`✅ SQL SUCCESS: ${rows?.length || 0} rows affected`);
              resolve(rows);
            }
          }
        });
      });
    } finally {
      this.pool.releaseConnection(conn);
    }
  }
}

// Export the Vercel-compatible manager
export const snowflakeManagerVercel = new SnowflakeManagerVercel();

console.log('Loaded SNOWFLAKE_USERNAME:', process.env.SNOWFLAKE_USERNAME); 