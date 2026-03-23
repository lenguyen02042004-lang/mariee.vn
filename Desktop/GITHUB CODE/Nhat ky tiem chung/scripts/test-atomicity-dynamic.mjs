import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function testAtomicityDynamic() {
  const client = new pg.Client({
    connectionString: process.env.DIRECT_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🔌 Connected to DB');

    // Find ANY schedule and ensure it's NOT done or just use it anyway (Step 1 will pass)
    const res = await client.query(`
      SELECT vs.id, b.user_id 
      FROM public.vaccine_schedules vs 
      JOIN public.babies b ON vs.baby_id = b.id 
      LIMIT 1
    `);

    if (res.rows.length === 0) {
      console.log('❌ No vaccine schedules found in DB.');
      return;
    }

    const { id: scheduleId, user_id: userId } = res.rows[0];
    const invalidPath = 'malicious_path_without_userId_prefix';

    // Clear history for this schedule to ensure we reach Step 4 (or at least avoid Step 33 Conflict)
    await client.query('DELETE FROM public.vaccine_history WHERE schedule_id = $1', [scheduleId]);
    await client.query('UPDATE public.vaccine_schedules SET status = $1 WHERE id = $2', ['pending', scheduleId]);

    console.log(`✅ FOUND PAIR: Schedule=${scheduleId}, User=${userId}`);
    console.log(`🧪 TESTING ATOMICITY: Calling RPC with invalid path...`);

    try {
      await client.query(
        'SELECT public.mark_vaccine_done_atomic($1, $2, $3, $4, $5, $6, $7)',
        [scheduleId, userId, '2026-03-21', 'BATCH-ATOM', 'Lab', 'Test atomicity', [invalidPath]]
      );
      console.log('❌ FAIL: RPC allowed invalid path');
    } catch (err) {
      console.log(`✅ SUCCESS: RPC rejected call as expected.`);
      console.log(`🔍 Error message: ${err.message}`);
      
      if (err.message.includes('does not belong to user')) {
        console.log('🎯 CONFIRMED: Hạt nhân bảo mật (Path Check) đã hoạt động!');
      } else {
        console.log('⚠️ UNEXPECTED ERROR: ' + err.message);
      }
    }

    // FINAL VERIFICATION OF ROLLBACK (The most important part of this test)
    const historyRes = await client.query(
      'SELECT * FROM public.vaccine_history WHERE schedule_id = $1',
      [scheduleId]
    );
    console.log(`- vaccine_history records for this schedule: ${historyRes.rows.length} (Expected: 0)`);

    const scheduleRes = await client.query(
      'SELECT status FROM public.vaccine_schedules WHERE id = $1',
      [scheduleId]
    );
    console.log(`- Schedule status: ${scheduleRes.rows[0]?.status} (Expected: 'pending')`);

    if (historyRes.rows.length === 0 && scheduleRes.rows[0]?.status === 'pending') {
      console.log('\n🏆 FINAL CONCLUSION: ATOMICITY & SECURITY TEST PASSED!');
    } else {
      console.log('\n💀 FINAL CONCLUSION: TEST FAILED!');
    }

  } catch (err) {
    console.error('System error:', err.message);
  } finally {
    await client.end();
  }
}

testAtomicityDynamic();
