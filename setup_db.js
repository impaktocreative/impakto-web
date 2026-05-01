const { Client } = require('pg');
const fs = require('fs');

const connectionString = 'postgresql://postgres:mbzNcxrbtWJ8FrAD@db.gqzjidmqehdvvbwerqfm.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
});

async function run() {
  try {
    await client.connect();
    const sql = fs.readFileSync('./supabase_schema.sql', 'utf8');
    await client.query(sql);
    console.log('✅ Base de datos configurada correctamente.');
  } catch (err) {
    console.error('❌ Error al configurar la base de datos:', err);
  } finally {
    await client.end();
  }
}

run();
