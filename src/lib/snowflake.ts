import snowflake from 'snowflake-sdk';
import * as fs from 'fs';

interface SnowflakeConfig {
  account: string;
  username: string;
  role: string;
  warehouse: string;
  database: string;
  schema: string;
  privateKeyPath: string;
}

class SnowflakeManager {
  private connection: snowflake.Connection | null = null;
  private isConnected: boolean = false;
  private privateKey: string = '';

  constructor(private config: SnowflakeConfig) {
    this.loadAndProcessPrivateKey();
  }

  private loadAndProcessPrivateKey(): void {
    try {
      console.log('🔐 Loading private key from:', this.config.privateKeyPath);
      // Read the private key file as a Buffer
      let privateKeyData = fs.readFileSync(this.config.privateKeyPath);
      // Convert to string and normalize line endings to LF
      let privateKeyString = privateKeyData.toString('utf8').replace(/\r\n/g, '\n');
      this.privateKey = privateKeyString;
      console.log('✅ Private key loaded successfully');
      console.log('🔍 Key preview:', this.privateKey.substring(0, 50) + '...');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('❌ Failed to load private key:', error);
        throw new Error(`Private key loading failed: ${error.message}`);
      }
    }
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;
    console.log('🔗 Connecting to Snowflake with BIZ_APPS role...');
    console.log('📊 Account:', this.config.account);
    console.log('👤 Username:', this.config.username);
    console.log('🎭 Role:', this.config.role);
    return new Promise((resolve, reject) => {
      this.connection = snowflake.createConnection({
        account: this.config.account,
        username: this.config.username,
        role: this.config.role,
        warehouse: this.config.warehouse,
        database: this.config.database,
        schema: this.config.schema,
        authenticator: 'SNOWFLAKE_JWT',
        privateKey: this.privateKey,
      });
      this.connection.connect((err: unknown, conn: unknown) => {
        if (err instanceof Error) {
          console.error('❌ Snowflake connection failed:', err.message);
          console.error('🔍 Error details:', err);
          reject(err);
        } else {
          console.log('✅ Connected to Snowflake with BIZ_APPS role!');
          console.log('🎭 Active role:', this.config.role);
          console.log('💾 Database access:', `${this.config.database}.${this.config.schema}`);
          this.isConnected = true;
          resolve();
        }
      });
    });
  }

  async execute(query: string, binds?: any[]): Promise<any> {
    if (!this.isConnected) {
      await this.connect();
    }
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
    return new Promise((resolve, reject) => {
      this.connection.execute({
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
  }
}

export const snowflakeManager = new SnowflakeManager({
  account: process.env.SNOWFLAKE_ACCOUNT!,
  username: process.env.SNOWFLAKE_USERNAME!,
  role: process.env.SNOWFLAKE_ROLE!,
  warehouse: process.env.SNOWFLAKE_WAREHOUSE!,
  database: process.env.SNOWFLAKE_DATABASE!,
  schema: process.env.SNOWFLAKE_SCHEMA!,
  privateKeyPath: process.env.PRIVATE_KEY_PATH!
});

console.log('Loaded SNOWFLAKE_USERNAME:', process.env.SNOWFLAKE_USERNAME); 