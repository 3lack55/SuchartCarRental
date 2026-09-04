-- Migration: เพิ่มสี (color) ให้ประเภทบริการซ่อมบำรุง (service_type) ตั้งค่าได้เหมือนประเภทรถ (vehicle_type)
-- สำรองฐานข้อมูลก่อนรันเสมอ

ALTER TABLE `service_type`
  ADD COLUMN `color` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `service_type_name`;
