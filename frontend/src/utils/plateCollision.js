// คืน Set ของ plate_number ที่มีมากกว่า 1 vehicle_id ใช้ร่วมกันในรายการ — คือรถคนละคัน คนละจังหวัด ที่บังเอิญเลขทะเบียนตรงกัน
// (รถคันเดียวกันมักมีหลายแถวในหน้ารายการอยู่แล้ว เช่น 1 คันมี 2 ประเภทเอกสาร/หลายรายการฝ่าฝืน/หลายรอบซ่อมบำรุง
// ซึ่งไม่ใช่การชนกันของทะเบียน จึงต้องดูที่ vehicle_id ไม่ใช่แค่นับจำนวนแถวที่ plate_number ซ้ำ)
export function getDuplicatePlateNumbers(items) {
    const plateToVehicleIds = new Map();
    for (const item of items) {
        if (!item.plate_number) continue;
        const vehicleIds = plateToVehicleIds.get(item.plate_number) ?? new Set();
        vehicleIds.add(item.vehicle_id);
        plateToVehicleIds.set(item.plate_number, vehicleIds);
    }

    const duplicates = new Set();
    for (const [plateNumber, vehicleIds] of plateToVehicleIds) {
        if (vehicleIds.size > 1) duplicates.add(plateNumber);
    }
    return duplicates;
}
