import readline from 'readline';
import bcrypt from 'bcryptjs';
import { getDb, persistDb } from '../server/db.ts';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log('====================================');
  console.log('   AZRYL STORE - SETUP AKUN ADMIN   ');
  console.log('====================================\n');

  const username = await ask('Masukkan Username Admin: ');
  if (!username.trim()) {
    console.error('Username tidak boleh kosong!');
    rl.close();
    process.exit(1);
  }

  const password = await ask('Masukkan Password Admin (minimal 6 karakter): ');
  if (!password || password.length < 6) {
    console.error('Password minimal 6 karakter!');
    rl.close();
    process.exit(1);
  }

  const db = await getDb();
  const passwordHash = bcrypt.hashSync(password, 10);
  const now = new Date().toISOString();
  const safeUsername = username.trim();

  // Check if user exists
  const existing = db.exec(`SELECT id FROM admins WHERE username = '${safeUsername.replace(/'/g, "''")}'`);
  if (existing && existing.length > 0 && existing[0].values.length > 0) {
    const adminId = existing[0].values[0][0];
    db.run(
      `UPDATE admins SET password_hash = ?, updated_at = ? WHERE id = ?`,
      [passwordHash, now, adminId]
    );
    console.log(`\nBerhasil memperbarui password untuk admin "${safeUsername}"!`);
  } else {
    const adminId = 'admin-' + Date.now();
    db.run(
      `INSERT INTO admins (id, username, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
      [adminId, safeUsername, passwordHash, now, now]
    );
    console.log(`\nBerhasil membuat akun admin baru "${safeUsername}"!`);
  }

  persistDb();
  console.log('Database tersimpan.');
  rl.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('Gagal:', err);
  rl.close();
  process.exit(1);
});
