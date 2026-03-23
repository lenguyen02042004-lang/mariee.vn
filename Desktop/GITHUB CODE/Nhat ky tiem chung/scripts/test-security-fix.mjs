import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const client = new pg.Client({
    connectionString: process.env.DIRECT_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to DB');

    // Test data from previous step
    const scheduleId = 'f0b6e927-463d-4952-b430-6775837651c6';
    const userId = '60882f0a-7092-411a-8ce4-2df447385cdb';
    const fakeUrl = 'https://google.com/fake.jpg';

    console.log(`Testing with fake URL: ${fakeUrl}`);
    
    try {
      await client.query(
        'SELECT public.mark_vaccine_done_atomic($1, $2, $3, $4, $5, $6, $7)',
        [scheduleId, userId, '2026-03-21', null, null, 'Test security', [fakeUrl]]
      );
      console.log('❌ FAIL: RPC allowed fake URL');
    } catch (err) {
      console.log(`✅ PASS: RPC rejected fake URL. Error: ${err.message}`);
    }

    // Verify no image was inserted
    const res = await client.query(
      'SELECT * FROM public.vaccine_history_images vhi JOIN public.vaccine_history vh ON vhi.history_id = vh.id WHERE vh.schedule_id = $1',
      [scheduleId]
    );
    
    if (res.rows.length === 0) {
      console.log('✅ PASS: No images found for this schedule');
    } else {
      console.log('❌ FAIL: Images found in DB!');
    }

  } catch (err) {
    console.error('Connection error:', err.message);
  } finally {
    await client.end();
  }
}

test();
