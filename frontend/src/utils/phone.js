// เบอร์โทรในระบบเก็บเป็นตัวเลขล้วน 10 หลัก (เช่น "0812345678") ฟังก์ชันนี้แปลงเป็น xxx-xxx-xxxx สำหรับแสดงผล
export function formatPhone(phone) {
    const digits = String(phone ?? '').replace(/\D/g, '');
    if (digits.length !== 10) return phone ?? '';
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}
