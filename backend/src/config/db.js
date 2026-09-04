import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'car_company',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

// ค่า default ของ MySQL (1024 ไบต์) ตัดข้อความสั้นเกินไปสำหรับ GROUP_CONCAT ที่ใช้สรุปรายการซ่อมบำรุง
// (view_maintenance_summary: item_names/item_type_names) เมื่อใบซ่อมมีหลายรายการ ขยายเป็น 8192 ไบต์ต่อ connection กันตัดข้อความ
pool.on('connection', (connection) => {
  connection.query('SET SESSION group_concat_max_len = 8192');
});

export async function testConnection() {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
    console.log('[db] MySQL connected');
  } finally {
    conn.release();
  }
}

export default pool;