-- Migration: เพิ่มปีที่ซื้อรถ + เดือนที่ซื้อรถ (optional) ให้ตาราง vehicles
-- ใช้คำนวณ "อายุรถ" แบบไม่เก็บซ้ำ (คำนวณจาก purchase_year/purchase_month ตอนแสดงผลเท่านั้น)
-- สำรองฐานข้อมูลก่อนรันเสมอ

ALTER TABLE `vehicles`
  ADD COLUMN `purchase_year` smallint DEFAULT NULL AFTER `type_id`,
  ADD COLUMN `purchase_month` tinyint DEFAULT NULL AFTER `purchase_year`;

-- ขอบเขตแบบ static เท่านั้น (CHECK constraint ของ MySQL ใช้ CURDATE()/YEAR(CURDATE()) ไม่ได้เพราะไม่ deterministic)
-- ขอบเขตจริงที่ขยับตามปีปัจจุบัน (ห้ามเกินปีหน้า) ไปบังคับที่ Joi ฝั่ง backend แทน
ALTER TABLE `vehicles`
  ADD CONSTRAINT `chk_purchase_year` CHECK (`purchase_year` IS NULL OR `purchase_year` BETWEEN 1980 AND 2100),
  ADD CONSTRAINT `chk_purchase_month` CHECK (`purchase_month` IS NULL OR `purchase_month` BETWEEN 1 AND 12);
