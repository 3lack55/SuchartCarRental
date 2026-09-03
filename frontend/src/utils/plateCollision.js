// เทียบทะเบียนแบบไม่สนช่องว่าง เพราะผู้ใช้พิมพ์ "ทดสอบ888" กับ "ทดสอบ 888" ควรถือว่าเป็นทะเบียนเดียวกัน
function normalizePlate(plateNumber) {
    return plateNumber.replace(/\s+/g, '');
}

// คืน Set ของ plate_number (ค่าดิบตามที่เก็บไว้จริง) ที่มีมากกว่า 1 vehicle_id ใช้ทะเบียนเดียวกัน (เทียบแบบไม่สนช่องว่าง)
// ในรายการ — คือรถคนละคัน คนละจังหวัด ที่บังเอิญเลขทะเบียนตรงกัน (รถคันเดียวกันมักมีหลายแถวในหน้ารายการอยู่แล้ว
// เช่น 1 คันมี 2 ประเภทเอกสาร/หลายรายการฝ่าฝืน/หลายรอบซ่อมบำรุง ซึ่งไม่ใช่การชนกันของทะเบียน จึงต้องดูที่ vehicle_id
// ไม่ใช่แค่นับจำนวนแถวที่ plate_number ซ้ำ)
export function getDuplicatePlateNumbers(items) {
    const normalizedToRawPlates = new Map();
    const normalizedToVehicleIds = new Map();

    for (const item of items) {
        if (!item.plate_number) continue;
        const normalized = normalizePlate(item.plate_number);

        const rawPlates = normalizedToRawPlates.get(normalized) ?? new Set();
        rawPlates.add(item.plate_number);
        normalizedToRawPlates.set(normalized, rawPlates);

        const vehicleIds = normalizedToVehicleIds.get(normalized) ?? new Set();
        vehicleIds.add(item.vehicle_id);
        normalizedToVehicleIds.set(normalized, vehicleIds);
    }

    const duplicates = new Set();
    for (const [normalized, vehicleIds] of normalizedToVehicleIds) {
        if (vehicleIds.size > 1) {
            for (const rawPlate of normalizedToRawPlates.get(normalized)) duplicates.add(rawPlate);
        }
    }
    return duplicates;
}
