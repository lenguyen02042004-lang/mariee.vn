/**
 * Migration runner - Nhật Ký Tiêm Chủng
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, '..', 'supabase', 'migrations');

async function runMigrations() {
  // Ưu tiên DIRECT_URL (Port 5432) cho migrations, fallback sang DATABASE_URL (Port 6543)
  const urls = [process.env.DIRECT_URL, process.env.DATABASE_URL].filter(Boolean);
  
  if (urls.length === 0) {
    console.error('❌ Thiếu biến môi trường DIRECT_URL hoặc DATABASE_URL trong .env');
    process.exit(1);
  }

  let client = null;
  for (const url of urls) {
    const hostInfo = url.split('@')[1] ? url.split('@')[1].split(':')[0] : 'Database';
    console.log(`🔌 Thử kết nối tới: ${hostInfo}...`);
    
    // Xóa các biến môi trường PG mặc định có thể gây nhiễu use-case của node-postgres
    delete process.env.PGUSER;
    delete process.env.PGPASSWORD;
    delete process.env.PGHOST;
    delete process.env.PGPORT;
    delete process.env.PGDATABASE;

    const testClient = new pg.Client({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });

    try {
      await testClient.connect();
      console.log('✅ Kết nối thành công!');
      client = testClient;
      break;
    } catch (err) {
      console.error(`❌ Lỗi kết nối: ${err.message}`);
      await testClient.end().catch(() => {});
    }
  }

  if (!client) {
    console.error('\n❌ Không thể thiết lập kết nối tới Supabase. Kiểm tra lại thông tin và quyền truy cập network.');
    process.exit(1);
  }

  try {
    const files = readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`\n📋 Tìm thấy ${files.length} file migration. Bắt đầu chạy...\n`);

    let success = 0;
    let skipped = 0;
    let failed = 0;

    for (const file of files) {
      const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8');
      process.stdout.write(`⏳ Đang chạy ${file}...`);

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        console.log(' ✅ Hoàn tất');
        success++;
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        const msg = err.message || '';
        const isAlreadyExists = [
          'already exists',
          'already has a column',
          'conflicts with existing constraint',
          'multiple primary keys'
        ].some(term => msg.toLowerCase().includes(term));

        if (isAlreadyExists) {
          console.log(' ⚠️ Bỏ qua (đã tồn tại)');
          skipped++;
        } else {
          console.log(' ❌ Lỗi');
          console.error(`   👉 Lỗi chi tiết: ${msg}`);
          failed++;
        }
      }
    }

    console.log('\n' + '='.repeat(40));
    console.log(`📊 BÁO CÁO MIGRATION:`);
    console.log(`✅ Thành công: ${success}`);
    console.log(`⚠️ Bỏ qua:     ${skipped}`);
    console.log(`❌ Thất bại:   ${failed}`);
    console.log('='.repeat(40));

    if (failed === 0) {
      console.log('\n🎉 Tuyệt vời! Tất cả database đã được thiết lập xong.');
    } else {
      console.log('\n⚠️ Có một số lỗi xảy ra, vui lòng kiểm tra lại.');
      process.exit(1);
    }

  } catch (err) {
    console.error(`\n❌ Lỗi hệ thống: ${err.message}`);
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

runMigrations();
