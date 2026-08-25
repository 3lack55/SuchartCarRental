const HOST = import.meta.env.VITE_API_HOST;
const PORT = import.meta.env.VITE_API_PORT || "3000";
const API_PROTOCOL = import.meta.env.VITE_API_PROTOCOL || "http";

// ไม่ตั้ง VITE_API_HOST (ตอน build production ผ่าน nginx) -> ใช้ path สัมพัทธ์ "/api" แทน absolute URL
// เพราะ nginx proxy /api/ ไปที่ backend ให้อยู่แล้ว จึงใช้ได้ไม่ว่าเข้าเว็บผ่าน origin ไหน (Tailscale IP หรือ Cloudflare Tunnel)
// โดยไม่ต้อง build frontend ใหม่ทุกครั้งที่ได้ URL ใหม่ — dev ยังตั้ง VITE_API_HOST ปกติเพราะเรียกข้าม origin ตรง ไม่ผ่าน nginx
export const API_BASE_URL = HOST ? `${API_PROTOCOL}://${HOST}:${PORT}` : "";
