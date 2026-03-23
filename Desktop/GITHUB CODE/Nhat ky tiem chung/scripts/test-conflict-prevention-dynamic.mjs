import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function testConflictPreventionDynamic() {
  const client = new pg.Client({
    connectionString: process.env.DIRECT_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🔌 Connected to DB');

    // Debug: Check tables
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables found:', tables.rows.map(r => r.table_name).join(', '));

    const babies = await client.query("SELECT id, user_id FROM public.babies LIMIT 1");
    if (babies.rows.length === 0) {
        console.log('❌ No babies found.');
        return;
    }
    console.log('✅ Found baby:', babies.rows[0].id);

    const res = await client.query(`
      SELECT vs.id, b.user_id 
      FROM public.vaccine_schedules vs 
      JOIN public.babies b ON vs.baby_id = b.id 
      LIMIT 1
    `);

    if (res.rows.length === 0) {
      console.log('❌ No schedules found linked to babies.');
      // Let's try to generate one if baby exists
      console.log('Attempting to generate schedules for baby:', babies.rows[0].id);
      await client.query('SELECT public.generate_vaccine_schedules_for_baby($1)', [babies.rows[0].id]);
      
      // Try again
      const resRetry = await client.query(`
        SELECT vs.id, b.user_id 
        FROM public.vaccine_schedules vs 
        JOIN public.babies b ON vs.baby_id = b.id 
        LIMIT 1
      `);
      if (resRetry.rows.length === 0) {
          console.log('❌ Still no schedules.');
          return;
      }
      res.rows = resRetry.rows;
    }

    const { id: scheduleId, user_id: userId } = res.rows[0];
    await client.query('DELETE FROM public.vaccine_history WHERE schedule_id = $1', [scheduleId]);
    await client.query('UPDATE public.vaccine_schedules SET status = $1 WHERE id = $2', ['pending', scheduleId]);

    console.log(`✅ IDs: Schedule=${scheduleId}, User=${userId}`);

    console.log(`\n🧪 STEP 1: First call...`);
    await client.query(
      'SELECT public.mark_vaccine_done_atomic($1, $2, $3, $4, $5, $6, $7)',
      [scheduleId, userId, '2026-03-21', 'B1', 'L1', 'N1', []]
    );
    console.log('✅ Success');

    console.log(`\n🧪 STEP 2: Second call (Duplicate)...`);
    try {
      await client.query(
        'SELECT public.mark_vaccine_done_atomic($1, $2, $3, $4, $5, $6, $7)',
        [scheduleId, userId, '2026-03-21', 'B2', 'L2', 'N2', []]
      );
      console.log('❌ FAIL');
    } catch (err) {
      console.log(`✅ SUCCESS: Rejected. Error: ${err.message}`);
    }

    const finalRes = await client.query('SELECT count(*) FROM public.vaccine_history WHERE schedule_id = $1', [scheduleId]);
    console.log(`\n📊 Count: ${finalRes.rows[0].count}`);

  } catch (err) {
    console.error('System error:', err.message);
  } finally {
    await client.end();
  }
}

testConflictPreventionDynamic();
