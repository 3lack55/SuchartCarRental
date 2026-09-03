-- Migration: ผู้ให้บริการ (insurance_company) ไม่บังคับกรอกอีกต่อไป + เพิ่ม view สรุปเอกสาร 1 แถวต่อรถ
-- สำรองฐานข้อมูลก่อนรันเสมอ

-- 1) provider ไม่บังคับกรอกอีกต่อไป (ของเก่าที่มีค่าอยู่แล้วไม่ลบ/ไม่ backfill)
ALTER TABLE `vehicle_act_tax` MODIFY COLUMN `insurance_company` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;
ALTER TABLE `vehicle_insurances` MODIFY COLUMN `insurance_company` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;

-- 2) 1 แถวต่อรถ: pivot ของ view_current_documents ที่มีอยู่แล้ว (reuse การกรอง "renewal ล่าสุด" ของมันตรงๆ)
DROP VIEW IF EXISTS `view_document_summary`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_document_summary` AS
SELECT
  v.`vehicle_id` AS `vehicle_id`,
  v.`plate_number` AS `plate_number`,
  p.`name_th` AS `plate_province`,
  at.`document_id` AS `act_tax_document_id`,
  at.`expire_date` AS `act_tax_expire_date`,
  at.`days_remaining` AS `act_tax_days_remaining`,
  ins.`document_id` AS `insurance_document_id`,
  ins.`expire_date` AS `insurance_expire_date`,
  ins.`days_remaining` AS `insurance_days_remaining`
FROM `vehicles` v
JOIN `provinces` p ON p.`province_id` = v.`plate_province_id`
LEFT JOIN `view_current_documents` at ON at.`vehicle_id` = v.`vehicle_id` AND at.`document_type` = 'act_tax'
LEFT JOIN `view_current_documents` ins ON ins.`vehicle_id` = v.`vehicle_id` AND ins.`document_type` = 'insurance'
WHERE v.`deleted` = 0;
