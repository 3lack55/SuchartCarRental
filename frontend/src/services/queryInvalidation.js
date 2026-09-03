// ข้อมูลคนขับ/รถ/เอกสาร/ซ่อมบำรุง/ผิดกฎจราจร โยงถึงกันหมด (เช่น ลบคนขับ -> รถที่เคยมีคนขับคนนั้นต้องอัพเดท,
// เพิ่ม/ลบเอกสาร -> สถานะ "เอกสารไม่สมบูรณ์" ในหน้ารถและการ์ดสรุปหน้าภาพรวมต้องอัพเดท ฯลฯ)
// ทุก mutation ของ 5 module นี้เรียก invalidate แบบกว้างๆ ตัวเดียวกันแทนการไล่เดาทีละจุดว่าอันไหนกระทบอันไหนบ้าง
// เพื่อกันพลาด (ต้นทุนของการ invalidate เกินจำเป็นถูกกว่าต้นทุนของการโชว์ข้อมูลค้าง/ผิดมาก)
export function invalidateFleetQueries(queryClient) {
    queryClient.invalidateQueries({ queryKey: ['drivers'] });
    queryClient.invalidateQueries({ queryKey: ['driver'] });
    queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    queryClient.invalidateQueries({ queryKey: ['vehicle'] });
    queryClient.invalidateQueries({ queryKey: ['documents'] });
    queryClient.invalidateQueries({ queryKey: ['document-summary'] });
    queryClient.invalidateQueries({ queryKey: ['document'] });
    queryClient.invalidateQueries({ queryKey: ['document-history'] });
    queryClient.invalidateQueries({ queryKey: ['maintenances'] });
    queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    queryClient.invalidateQueries({ queryKey: ['violations'] });
    queryClient.invalidateQueries({ queryKey: ['violation'] });
    queryClient.invalidateQueries({ queryKey: ['overview'] });
}
