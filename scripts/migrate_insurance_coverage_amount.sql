-- Migration: เพิ่มคอลัมน์ทุนประกัน (coverage_amount) ให้ vehicle_insurances
-- ใช้แสดงวงเงินคุ้มครองของกรมธรรม์ประกันภาคสมัครใจแต่ละฉบับ (ไม่บังคับกรอก)
-- ไม่เพิ่มให้ vehicle_act_tax เพราะวงเงินคุ้มครองของ พ.ร.บ. กำหนดตายตัวตามกฎหมาย ไม่ใช่ข้อมูลที่กรอกรายฉบับ
-- สำรองฐานข้อมูลก่อนรันเสมอ

ALTER TABLE `vehicle_insurances`
  ADD COLUMN `coverage_amount` decimal(12,2) NULL DEFAULT NULL AFTER `amount`,
  ADD CONSTRAINT `chk_insurance_coverage_nonnegative` CHECK (`coverage_amount` IS NULL OR `coverage_amount` >= 0);
