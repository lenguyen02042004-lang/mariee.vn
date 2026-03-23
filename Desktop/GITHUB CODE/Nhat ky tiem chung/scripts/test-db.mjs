import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not defined in .env');
    return;
  }
  const maskedUrl = url.replace(/:[^@]+@/, ':***@');
  console.log('Testing connection with DATABASE_URL:', maskedUrl);
  
  const client = new pg.Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('SUCCESS!');
    await client.end();
  } catch (err) {
    console.error('FAILED:', err.message);
  }
}

test();
