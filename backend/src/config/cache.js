import NodeCache from 'node-cache';

// stdTTL: อายุ cache เริ่มต้น (วินาที) ถ้า set() โดยไม่ระบุ ttl เอง จะใช้ค่านี้
// checkperiod: ความถี่ที่ node-cache จะเช็คและลบ key ที่หมดอายุทิ้งอัตโนมัติ
const cache = new NodeCache({
  stdTTL: 60, // 1 นาที — เหมาะกับ view_document_expiry ที่ข้อมูลไม่ต้อง realtime เป๊ะ
  checkperiod: 120,
});

// helper: cache-aside pattern — เช็ค cache ก่อน ถ้าไม่มีค่อยเรียก fetchFn แล้วเก็บเข้า cache
export async function getOrSetCache(key, ttlSeconds, fetchFn) {
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const fresh = await fetchFn();
  cache.set(key, fresh, ttlSeconds);
  return fresh;
}

// helper: ใช้ตอนข้อมูลถูกแก้ไข (เช่น เพิ่ม/แก้เอกสารรถ) ต้องล้าง cache ที่เกี่ยวข้องทิ้ง
export function invalidateCache(key) {
  cache.del(key);
}

export default cache;