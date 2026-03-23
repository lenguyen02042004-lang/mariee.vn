import pg from 'pg';

async function test() {
  const url = 'postgresql://postgres.wabgsytibsxmyyhesxdc:0918731411*Loi@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
  console.log('Testing connection with HARDCODED URL...');
  
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
