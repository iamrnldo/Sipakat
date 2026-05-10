require("dotenv").config();
const { pool } = require("../config/database");

const createTables = async () => {
  const client = await pool.connect();

  try {
    console.log("🔄 Memulai migrasi database...");

    await client.query("BEGIN");

    // =====================
    // TABEL USERS
    // =====================
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nama_lengkap VARCHAR(100) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        jabatan VARCHAR(100),
        status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
        no_hp VARCHAR(20),
        alamat TEXT,
        foto VARCHAR(255),
        hak_akses VARCHAR(20) DEFAULT 'user' CHECK (hak_akses IN ('admin', 'user', 'viewer')),
        catatan TEXT,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Tabel users dibuat");

    // =====================
    // TABEL LOGIN HISTORY
    // =====================
    await client.query(`
      CREATE TABLE IF NOT EXISTS login_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        ip_address VARCHAR(50),
        device_info TEXT,
        browser VARCHAR(100),
        os VARCHAR(100),
        status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Tabel login_history dibuat");

    // =====================
    // TABEL ARSIP PERENCANAAN
    // =====================
    await client.query(`
      CREATE TABLE IF NOT EXISTS arsip_perencanaan (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nama_dokumen VARCHAR(255) NOT NULL,
        jenis_dokumen VARCHAR(100) NOT NULL,
        tahun VARCHAR(4) NOT NULL,
        tanggal DATE NOT NULL,
        deskripsi TEXT,
        file_path VARCHAR(500),
        file_name VARCHAR(255),
        file_size INTEGER,
        file_type VARCHAR(100),
        status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'arsip', 'hapus')),
        dibuat_oleh UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Tabel arsip_perencanaan dibuat");

    // =====================
    // TABEL KEPEGAWAIAN APARATUR
    // =====================
    await client.query(`
      CREATE TABLE IF NOT EXISTS kepegawaian_aparatur (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nama VARCHAR(100) NOT NULL,
        nip VARCHAR(30) UNIQUE,
        jabatan VARCHAR(100) NOT NULL,
        foto VARCHAR(255),
        status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif', 'pensiun')),
        no_hp VARCHAR(20),
        email VARCHAR(100),
        alamat TEXT,
        tanggal_lahir DATE,
        tanggal_bergabung DATE,
        pendidikan VARCHAR(100),
        golongan VARCHAR(20),
        keterangan TEXT,
        dibuat_oleh UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Tabel kepegawaian_aparatur dibuat");

    // =====================
    // TABEL KEUANGAN DESA
    // =====================
    await client.query(`
      CREATE TABLE IF NOT EXISTS keuangan_desa (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nama_dokumen VARCHAR(255) NOT NULL,
        jenis_dokumen VARCHAR(100) NOT NULL,
        tahun VARCHAR(4) NOT NULL,
        tanggal DATE NOT NULL,
        nominal DECIMAL(15, 2),
        deskripsi TEXT,
        file_path VARCHAR(500),
        file_name VARCHAR(255),
        file_size INTEGER,
        file_type VARCHAR(100),
        status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'arsip', 'hapus')),
        dibuat_oleh UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Tabel keuangan_desa dibuat");

    // =====================
    // TABEL ACTIVITY LOG
    // =====================
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        aksi VARCHAR(100) NOT NULL,
        modul VARCHAR(50) NOT NULL,
        deskripsi TEXT,
        ip_address VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Tabel activity_log dibuat");

    // =====================
    // INDEXES
    // =====================
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_arsip_tahun ON arsip_perencanaan(tahun);
      CREATE INDEX IF NOT EXISTS idx_arsip_jenis ON arsip_perencanaan(jenis_dokumen);
      CREATE INDEX IF NOT EXISTS idx_keuangan_tahun ON keuangan_desa(tahun);
      CREATE INDEX IF NOT EXISTS idx_kepegawaian_status ON kepegawaian_aparatur(status);
      CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_log(user_id);
      CREATE INDEX IF NOT EXISTS idx_login_user ON login_history(user_id);
    `);
    console.log("✅ Index dibuat");

    // =====================
    // TRIGGER UPDATE TIMESTAMP
    // =====================
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    const tablesWithUpdatedAt = [
      "users",
      "arsip_perencanaan",
      "kepegawaian_aparatur",
      "keuangan_desa",
    ];
    for (const table of tablesWithUpdatedAt) {
      await client.query(`
        DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
        CREATE TRIGGER update_${table}_updated_at
          BEFORE UPDATE ON ${table}
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `);
    }
    console.log("✅ Triggers dibuat");

    // =====================
    // DEFAULT ADMIN USER
    // =====================
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await client.query(
      `
      INSERT INTO users (nama_lengkap, username, email, password, jabatan, hak_akses, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (username) DO NOTHING;
    `,
      [
        "Administrator SIPAKAT",
        "admin",
        "admin@sipakat.id",
        hashedPassword,
        "Administrator",
        "admin",
        "aktif",
      ],
    );

    console.log(
      "✅ Default admin user dibuat (username: admin, password: admin123)",
    );

    await client.query("COMMIT");
    console.log("\n🎉 Migrasi database berhasil!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Migrasi gagal:", err.message);
    throw err;
  } finally {
    client.release();
    pool.end();
  }
};

createTables();
