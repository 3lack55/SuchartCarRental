-- Preflight check: รันก่อน migrate_act_tax_merge_and_vehicle_type_color.sql เสมอ บน production จริง
-- ตรวจว่า vehicle_acts/vehicle_taxes ทุกแถวจับคู่กันได้สนิท (vehicle_id + last_paid_date + expire_date ตรงกัน)
-- ก่อนที่ migration จะ INNER JOIN แล้ว DROP ตารางเดิมทิ้ง — แถวที่ "จับคู่ไม่ได้" จะหายไปเงียบๆถ้าไม่เช็คก่อน
--
-- วิธีใช้: mysql -uroot -p<PASSWORD> car_company < scripts/preflight_check_act_tax_merge.sql
-- ผลลัพธ์ที่ต้องการ: unmatched_acts และ unmatched_taxes ต้องเป็น 0 ทั้งคู่ ถึงจะรัน migration ต่อได้อย่างปลอดภัย
-- ถ้าไม่เป็น 0 ให้ดูรายละเอียดแถวที่จับคู่ไม่ได้ (unmatched_act_rows / unmatched_tax_rows ด้านล่าง)
-- แล้วตัดสินใจก่อนว่าจะแก้ข้อมูลให้จับคู่ได้ (แก้วันที่ให้ตรงกัน) หรือจะจัดการแถวเหล่านั้นเป็นกรณีพิเศษ
-- ห้ามรัน migrate_act_tax_merge_and_vehicle_type_color.sql ต่อจนกว่าทั้งสองค่าจะเป็น 0

SELECT
    (SELECT COUNT(*) FROM vehicle_acts) AS total_acts,
    (SELECT COUNT(*) FROM vehicle_taxes) AS total_taxes,
    (SELECT COUNT(*) FROM vehicle_acts a WHERE NOT EXISTS (
        SELECT 1 FROM vehicle_taxes t
        WHERE t.vehicle_id = a.vehicle_id AND t.last_paid_date = a.last_paid_date AND t.expire_date = a.expire_date
    )) AS unmatched_acts,
    (SELECT COUNT(*) FROM vehicle_taxes t WHERE NOT EXISTS (
        SELECT 1 FROM vehicle_acts a
        WHERE a.vehicle_id = t.vehicle_id AND a.last_paid_date = t.last_paid_date AND a.expire_date = t.expire_date
    )) AS unmatched_taxes;

-- รายละเอียดแถว vehicle_acts ที่หาคู่ vehicle_taxes ไม่เจอ (ถ้ามี)
SELECT a.act_id, a.vehicle_id, a.insurance_company, a.last_paid_date, a.expire_date, a.premium_amount
FROM vehicle_acts a
WHERE NOT EXISTS (
    SELECT 1 FROM vehicle_taxes t
    WHERE t.vehicle_id = a.vehicle_id AND t.last_paid_date = a.last_paid_date AND t.expire_date = a.expire_date
);

-- รายละเอียดแถว vehicle_taxes ที่หาคู่ vehicle_acts ไม่เจอ (ถ้ามี)
SELECT t.tax_id, t.vehicle_id, t.last_paid_date, t.expire_date, t.fee_amount
FROM vehicle_taxes t
WHERE NOT EXISTS (
    SELECT 1 FROM vehicle_acts a
    WHERE a.vehicle_id = t.vehicle_id AND a.last_paid_date = t.last_paid_date AND a.expire_date = t.expire_date
);
