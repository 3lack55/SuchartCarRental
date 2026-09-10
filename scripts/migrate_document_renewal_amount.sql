-- Migration: เพิ่มคอลัมน์ยอดชำระ (amount) ให้ vehicle_act_tax และ vehicle_insurances
-- ใช้สรุปค่าใช้จ่ายต่ออายุเอกสารรายปีในหน้า "พ.ร.บ. ภาษี และประกัน"
-- ไม่บังคับกรอก (NULLABLE) โดยเจตนา — รอบก่อนหน้าเคยลบฟิลด์ยอดเงินออกเพราะบังคับกรอกแล้วลูกค้าไม่ต้องการ
-- record เก่าที่ไม่มี amount จะเป็น NULL (ไม่ backfill) และถูกนับเป็น 0 บาทตอนสรุปยอดรวมรายปี
-- สำรองฐานข้อมูลก่อนรันเสมอ

ALTER TABLE `vehicle_act_tax`
  ADD COLUMN `amount` decimal(10,2) NULL DEFAULT NULL AFTER `expire_date`,
  ADD CONSTRAINT `chk_act_tax_amount_nonnegative` CHECK (`amount` IS NULL OR `amount` >= 0);

ALTER TABLE `vehicle_insurances`
  ADD COLUMN `amount` decimal(10,2) NULL DEFAULT NULL AFTER `expire_date`,
  ADD CONSTRAINT `chk_insurance_amount_nonnegative` CHECK (`amount` IS NULL OR `amount` >= 0);
