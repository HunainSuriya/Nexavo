require('dotenv').config();
const { createClient } = require('@libsql/client');

async function test() {
  const turso = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  try {
    // Test insert
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS test (
        id INTEGER PRIMARY KEY,
        name TEXT
      )
    `);
    
    await turso.execute({
      sql: 'INSERT INTO test (name) VALUES (?)',
      args: ['Nexavo Test']
    });
    
    const result = await turso.execute('SELECT * FROM test');
    console.log('✅ Database working! Result:', result.rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();