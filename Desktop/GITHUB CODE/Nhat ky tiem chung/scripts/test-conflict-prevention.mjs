import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function testConflictPrevention() {
  const client = new pg.Client({
    connectionString: process.env.DIRECT_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🔌 Connected to DB');

    const scheduleId = 'b122718e-4903-4554-9494-0610f4435940';
    const userId = '60882f0a-7092-411a-8ce4-2df447385cdb';

    // 1. Ensure clean state
    await client.query('DELETE FROM public.vaccine_history WHERE schedule_id = $1', [scheduleId]);
    await client.query('UPDATE public.vaccine_schedules SET status = $1 WHERE id = $2', ['pending', scheduleId]);

    console.log(`\n🧪 STEP 1: Calling mark_vaccine_done_atomic (FIRST TIME)...`);
    const res1 = await client.query(
      'SELECT public.mark_vaccine_done_atomic($1, $2, $3, $4, $5, $6, $7)',
      [scheduleId, userId, '2026-03-21', 'BATCH-001', 'Clinic', 'First call', []]
    );
    console.log('✅ FIRST CALL SUCCESSFUL');

    console.log(`\n🧪 STEP 2: Calling mark_vaccine_done_atomic (SECOND TIME - DUPLICATE)...`);
    try {
      await client.query(
        'SELECT public.mark_vaccine_done_atomic($1, $2, $3, $4, $5, $6, $7)',
        [scheduleId, userId, '2026-03-21', 'BATCH-002', 'Clinic', 'Second call', []]
      );
      console.log('❌ FAIL: RPC allowed duplicate call!');
    } catch (err) {
      console.log(`✅ SUCCESS: RPC rejected second call. Error: ${err.message}`);
      // Check code if available
      if (err.code === '23505' || err.message.includes('Conflict')) {
        console.log('🎯 CONFIRMED: Error code 23505 (Conflict) detected.');
      }
    }

    console.log(`\n🧪 STEP 3: Verifying database consistency...`);
    const historyRes = await client.query(
      'SELECT count(*) FROM public.vaccine_history WHERE schedule_id = $1',
      [scheduleId]
    );
    console.log(`- Count in vaccine_history: ${historyRes.rows[0].count} (Expected: 1)`);

    if (historyRes.rows[0].count === '1') {
      console.log('\n🏆 CONFLICT PREVENTION TEST PASSED!');
    } else {
      console.log('\n💀 CONFLICT PREVENTION TEST FAILED!');
    }

  } catch (err) {
    console.error('Test error:', err.message);
  } finally {
    await client.end();
  }
}

testConflictPrevention();
