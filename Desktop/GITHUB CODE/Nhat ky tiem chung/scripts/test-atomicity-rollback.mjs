import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function testAtomicity() {
  const client = new pg.Client({
    connectionString: process.env.DIRECT_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🔌 Connected to DB');

    const scheduleId = '0da1c667-a5c9-4b68-b7ae-eeda0c159f81';
    const userId = '60882f0a-7092-411a-8ce4-2df447385cdb';
    const invalidPaths = ['malicious_path_without_prefix'];

    // Pre-check
    const checkRes = await client.query(
      'SELECT vs.id, b.user_id FROM public.vaccine_schedules vs JOIN public.babies b ON vs.baby_id = b.id WHERE vs.id = $1 AND b.user_id = $2',
      [scheduleId, userId]
    );
    if (checkRes.rows.length === 0) {
      console.log('⚠️ PRE-CHECK FAILED: Schedule and User pair not found or do not match in DB!');
      return;
    }
    console.log('✅ PRE-CHECK PASSED: IDs are correctly linked.');

    console.log(`\n🧪 STEP 1: Calling mark_vaccine_done_atomic with valid user/schedule but INVALID image path...`);
    try {
      await client.query(
        'SELECT public.mark_vaccine_done_atomic($1, $2, $3, $4, $5, $6, $7)',
        [scheduleId, userId, '2026-03-21', 'BATCH-ABC', 'CDC', 'Test atomicity', invalidPaths]
      );
      console.log('❌ FAIL: RPC allowed invalid paths incorrectly');
    } catch (err) {
      console.log(`✅ SUCCESS: RPC rejected call as expected.`);
      console.log(`🔍 Error detail: ${err.message}`);
    }

    console.log(`\n🧪 STEP 2: Verifying ROLLBACK (Atomicity)...`);
    
    // Check vaccine_history -> Should be EMPTY for this schedule
    const historyRes = await client.query(
      'SELECT * FROM public.vaccine_history WHERE schedule_id = $1',
      [scheduleId]
    );
    console.log(`- Rows in vaccine_history: ${historyRes.rows.length} (Expected: 0)`);

    // Check vaccine_schedules status -> Should still be 'pending'/'upcoming'
    const scheduleRes = await client.query(
      'SELECT status FROM public.vaccine_schedules WHERE id = $1',
      [scheduleId]
    );
    console.log(`- Schedule status: ${scheduleRes.rows[0]?.status} (Expected: NOT 'done')`);

    if (historyRes.rows.length === 0 && scheduleRes.rows[0]?.status !== 'done') {
      console.log('\n🏆 ATOMICITY TEST PASSED!');
      if (historyRes.rows.length === 0) console.log('   -> Vaccine history was rolled back.');
      if (scheduleRes.rows[0]?.status !== 'done') console.log('   -> Schedule status was NOT updated.');
    } else {
      console.log('\n💀 ATOMICITY TEST FAILED!');
    }

  } catch (err) {
    console.error('Test error:', err.message);
  } finally {
    await client.end();
  }
}

testAtomicity();
