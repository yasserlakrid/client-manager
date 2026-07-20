import 'dotenv/config';
import pool from './db.js';

async function testDatabase() {
  console.log('Testing database connection...');
  const client = await pool.connect();
  
  try {
    // Test accounts table
    const accountsResult = await client.query('SELECT * FROM accounts');
    console.log('✅ Found', accountsResult.rows.length, 'account(s) in database');
    
    // Test network table
    const networkResult = await client.query('SELECT * FROM network');
    console.log('✅ Found', networkResult.rows.length, 'network relation(s) in database');
    
    // Test clients table
    const clientsResult = await client.query('SELECT * FROM clients');
    console.log('✅ Found', clientsResult.rows.length, 'client(s) in database');
    
    console.log('\n🎉 Database setup successful!');
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

testDatabase();
