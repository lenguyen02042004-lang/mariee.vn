import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function testConflictPreventionFull() {
  const client = new pg.Client({
    connectionString: process.env.DIRECT_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🔌 Connected to DB');

    // 1. Setup: Create a test user-like ID if needed (or just use a random one)
    const testUserId = '60882f0a-7092-411a-8ce4-2df447385cdb';
    
    // 2. Create a test baby
    console.log('👶 Creating test baby...');
    const babyRes = await client.query(`
      INSERT INTO public.babies (name, dob, gender, user_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, ['Test Baby Atom', '2024-01-01', 'male', testUserId]);
    const babyId = babyRes.rows[0].id;
    console.log('✅ Baby created:', babyId);

    // 3. Generate schedules
    console.log('📅 Generating schedules...');
    await client.query('SELECT public.generate_vaccine_schedules_for_baby($1)', [babyId]);
    
    const scheduleRes = await client.query(`
      SELECT id FROM public.vaccine_schedules WHERE baby_id = $1 LIMIT 1
    `, [babyId]);
    const scheduleId = scheduleRes.rows[0].id;
    console.log('✅ Schedule found:', scheduleId);

    console.log(`\n🧪 STEP 1: Calling mark_vaccine_done_atomic (FIRST TIME)...`);
    await client.query(
      'SELECT public.mark_vaccine_done_atomic($1, $2, $3, $4, $5, $6, $7)',
      [scheduleId, testUserId, '2026-03-21', 'B1', 'L1', 'N1', []]
    );
    console.log('✅ FIRST CALL SUCCESSFUL');

    console.log(`\n🧪 STEP 2: Calling mark_vaccine_done_atomic (SECOND TIME - DUPLICATE)...`);
    try {
      await client.query(
        'SELECT public.mark_vaccine_done_atomic($1, $2, $3, $4, $5, $6, $7)',
        [scheduleId, testUserId, '2026-03-21', 'B2', 'L2', 'N2', []]
      );
      console.log('❌ FAIL: RPC allowed duplicate call!');
    } catch (err) {
      console.log(`✅ SUCCESS: RPC rejected second call as expected.`);
      console.log(`🔍 Error detail: ${err.message}`);
    }

    // 4. Verification
    const finalRes = await client.query('SELECT count(*) FROM public.vaccine_history WHERE schedule_id = $1', [scheduleId]);
    const count = finalRes.rows[0].count;
    console.log(`\n📊 Rows in vaccine_history: ${count} (Expected: 1)`);

    if (count === '1') {
      console.log('\n🏆 CONFLICT PREVENTION TEST PASSED!');
    } else {
      console.log('\n💀 CONFLICT PREVENTION TEST FAILED!');
    }

    // Cleanup (optional)
    await client.query('DELETE FROM public.babies WHERE id = $1', [babyId]);
    console.log('\n🧹 Cleanup done.');

  } catch (err) {
    console.error('System error:', err.message);
  } finally {
    await client.end();
  }
}

testConflictPreventionFull();
