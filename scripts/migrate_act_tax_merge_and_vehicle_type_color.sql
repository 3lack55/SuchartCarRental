-- Migration: เพิ่มสีประเภทรถ + รวมตาราง vehicle_acts/vehicle_taxes เป็น vehicle_act_tax
-- รันกับฐานข้อมูลที่มีข้อมูลอยู่แล้ว (เช่น production ที่เคย deploy ไปแล้ว) ต้องทำตามลำดับนี้เสมอ:
--   1) mysqldump สำรองฐานข้อมูลทั้งฐานก่อนเสมอ (ห้ามข้ามขั้นตอนนี้)
--   2) รัน scripts/preflight_check_act_tax_merge.sql ก่อน — unmatched_acts และ unmatched_taxes ต้องเป็น 0 ทั้งคู่
--      ถ้าไม่เป็น 0 ห้ามรันไฟล์นี้ต่อ ต้องไปแก้ข้อมูลให้จับคู่ได้ก่อน (สคริปต์นี้มี guard กันไว้อีกชั้นด้านล่างอยู่แล้ว
--      แต่ preflight ช่วยให้เห็นรายละเอียดแถวที่มีปัญหาก่อนตัดสินใจ)
--   3) ค่อยรันไฟล์นี้ (migrate_act_tax_merge_and_vehicle_type_color.sql)
-- Guard ด้านล่าง: ถ้ามี vehicle_acts/vehicle_taxes แถวไหนจับคู่กันไม่ได้ (ตาม vehicle_id+last_paid_date+expire_date)
-- สคริปต์จะ abort ทันทีด้วย error ก่อนถึงขั้นตอน INSERT/DROP TABLE เพื่อไม่ให้ข้อมูลที่จับคู่ไม่ได้หายไปเงียบๆ

-- ยกเว้นเฉพาะ tax_id ที่รู้แล้วว่าไม่มี act คู่กันจริง (พ.ร.บ. ยังไม่ได้บันทึกเข้าระบบ) และตกลงกันแล้วว่า
-- จะข้ามไปก่อน ไปกรอก พ.ร.บ. ใหม่ผ่านหน้าเว็บทีหลัง — เพิ่ม/ลบ id ในลิสต์นี้ได้ตามที่ตรวจสอบจริงกับ preflight_check
-- แถวอื่นที่ไม่อยู่ในลิสต์นี้ยังต้องจับคู่กันได้ครบเหมือนเดิม guard จะยัง abort ถ้าไม่ครบ
SET @known_unmatched_tax_ids = '7,8';

DELIMITER $$
CREATE PROCEDURE `_assert_act_tax_pairable`()
BEGIN
    DECLARE unmatched INT;
    SET unmatched = (
        (SELECT COUNT(*) FROM vehicle_acts a WHERE NOT EXISTS (
            SELECT 1 FROM vehicle_taxes t
            WHERE t.vehicle_id = a.vehicle_id AND t.last_paid_date = a.last_paid_date AND t.expire_date = a.expire_date
        ))
        +
        (SELECT COUNT(*) FROM vehicle_taxes t
         WHERE FIND_IN_SET(t.tax_id, @known_unmatched_tax_ids) = 0
         AND NOT EXISTS (
            SELECT 1 FROM vehicle_acts a
            WHERE a.vehicle_id = t.vehicle_id AND a.last_paid_date = t.last_paid_date AND a.expire_date = t.expire_date
        ))
    );
    IF unmatched > 0 THEN
        -- MESSAGE_TEXT จำกัดไม่เกิน 128 ตัวอักษร ข้อความจึงต้องสั้นกระชับ (รายละเอียดดูได้จาก preflight_check_act_tax_merge.sql)
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ABORT: unmatched act/tax rows found. Run scripts/preflight_check_act_tax_merge.sql first.';
    END IF;
END$$
DELIMITER ;

CALL `_assert_act_tax_pairable`();
DROP PROCEDURE `_assert_act_tax_pairable`;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------- 1) สีประเภทรถ ----------

ALTER TABLE `vehicle_type` ADD COLUMN `color` VARCHAR(7) DEFAULT NULL AFTER `type_name`;

-- ตั้งสีเริ่มต้นให้ตรงชื่อประเภทรถของ dev/seed data เท่านั้น — บน production ที่มีชื่อประเภทรถของจริง
-- (ต่างจาก seed) UPDATE พวกนี้จะไม่ match อะไรเลย ซึ่งไม่เป็นไร แค่ปล่อยให้ color เป็น NULL แล้วไปตั้งสีทีหลัง
-- ผ่านหน้า Settings ในแอปได้ตามปกติ ไม่กระทบการรัน migration ส่วนอื่น
UPDATE `vehicle_type` SET `color` = '#f97316' WHERE `type_name` = 'รถกระบะ';
UPDATE `vehicle_type` SET `color` = '#3b82f6' WHERE `type_name` = 'รถตู้';
UPDATE `vehicle_type` SET `color` = '#10b981' WHERE `type_name` = 'รถเก๋ง';
UPDATE `vehicle_type` SET `color` = '#a855f7' WHERE `type_name` = 'รถ SUV';

-- ---------- 2) รวม vehicle_acts + vehicle_taxes -> vehicle_act_tax ----------

CREATE TABLE `vehicle_act_tax` (
  `act_tax_id` int NOT NULL AUTO_INCREMENT,
  `vehicle_id` int NOT NULL,
  `insurance_company` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_paid_date` date NOT NULL,
  `expire_date` date NOT NULL,
  `premium_amount` decimal(8,2) NOT NULL,
  `fee_amount` decimal(8,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`act_tax_id`),
  KEY `vehicle_id` (`vehicle_id`),
  KEY `idx_act_tax_expire` (`expire_date`),
  CONSTRAINT `vehicle_act_tax_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_act_tax_dates` CHECK ((`expire_date` > `last_paid_date`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- จับคู่ act+tax เดิมของรถคันเดียวกันที่มีวันที่ตรงกัน (คือรอบต่ออายุเดียวกัน) มารวมเป็นแถวเดียว
-- tax_id ใน @known_unmatched_tax_ids (ตอนนี้คือ 7, 8) จะไม่ถูกดึงมาด้วยเพราะไม่มี act คู่กัน (ตามที่ยืนยันแล้วว่ายอมรับได้
-- จะไปกรอก พ.ร.บ. ใหม่ผ่านหน้าเว็บทีหลัง) ข้อมูลค่าธรรมเนียมของ tax_id เหล่านี้จะหายไปพร้อมกับ DROP TABLE vehicle_taxes ด้านล่าง
INSERT INTO `vehicle_act_tax`
  (`vehicle_id`, `insurance_company`, `last_paid_date`, `expire_date`, `premium_amount`, `fee_amount`, `created_at`, `updated_at`)
SELECT a.`vehicle_id`, a.`insurance_company`, a.`last_paid_date`, a.`expire_date`, a.`premium_amount`, t.`fee_amount`, a.`created_at`, a.`updated_at`
FROM `vehicle_acts` a
JOIN `vehicle_taxes` t
  ON t.`vehicle_id` = a.`vehicle_id`
  AND t.`last_paid_date` = a.`last_paid_date`
  AND t.`expire_date` = a.`expire_date`;

DROP TABLE `vehicle_acts`;
DROP TABLE `vehicle_taxes`;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------- 3) rebuild views ----------

DROP VIEW IF EXISTS `view_dashboard_overview`;
DROP VIEW IF EXISTS `view_current_documents`;
DROP VIEW IF EXISTS `view_document_expiry`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_document_expiry` AS
SELECT 'act_tax' COLLATE utf8mb4_unicode_ci AS `document_type`,
  at.`act_tax_id` AS `document_id`, at.`vehicle_id` AS `vehicle_id`,
  v.`plate_number` AS `plate_number`, p.`name_th` AS `plate_province`,
  at.`insurance_company` AS `provider`, at.`last_paid_date` AS `last_paid_date`, at.`expire_date` AS `expire_date`,
  (TO_DAYS(at.`expire_date`) - TO_DAYS(CURDATE())) AS `days_remaining`
FROM (`vehicle_act_tax` at JOIN `vehicles` v ON (v.`vehicle_id` = at.`vehicle_id`)) JOIN `provinces` p ON (p.`province_id` = v.`plate_province_id`)
WHERE (v.`deleted` = 0)
UNION ALL
SELECT 'insurance' COLLATE utf8mb4_unicode_ci AS `document_type`,
  i.`insurance_id` AS `document_id`, i.`vehicle_id` AS `vehicle_id`,
  v.`plate_number` AS `plate_number`, p.`name_th` AS `plate_province`,
  i.`insurance_company` AS `provider`, i.`last_paid_date` AS `last_paid_date`, i.`expire_date` AS `expire_date`,
  (TO_DAYS(i.`expire_date`) - TO_DAYS(CURDATE())) AS `days_remaining`
FROM (`vehicle_insurances` i JOIN `vehicles` v ON (v.`vehicle_id` = i.`vehicle_id`)) JOIN `provinces` p ON (p.`province_id` = v.`plate_province_id`)
WHERE (v.`deleted` = 0);

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_current_documents` AS
SELECT `ranked`.`document_type` AS `document_type`, `ranked`.`document_id` AS `document_id`, `ranked`.`vehicle_id` AS `vehicle_id`,
  `ranked`.`plate_number` AS `plate_number`, `ranked`.`plate_province` AS `plate_province`, `ranked`.`provider` AS `provider`,
  `ranked`.`last_paid_date` AS `last_paid_date`, `ranked`.`expire_date` AS `expire_date`, `ranked`.`days_remaining` AS `days_remaining`
FROM (
  SELECT `vde`.`document_type` AS `document_type`, `vde`.`document_id` AS `document_id`, `vde`.`vehicle_id` AS `vehicle_id`,
    `vde`.`plate_number` AS `plate_number`, `vde`.`plate_province` AS `plate_province`, `vde`.`provider` AS `provider`,
    `vde`.`last_paid_date` AS `last_paid_date`, `vde`.`expire_date` AS `expire_date`, `vde`.`days_remaining` AS `days_remaining`,
    ROW_NUMBER() OVER (PARTITION BY `vde`.`document_type`, `vde`.`vehicle_id` ORDER BY `vde`.`expire_date` DESC) AS `rn`
  FROM `view_document_expiry` `vde`
) `ranked`
WHERE (`ranked`.`rn` = 1);

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_dashboard_overview` AS
SELECT
  (SELECT COUNT(0) FROM `vehicles` WHERE (`vehicles`.`deleted` = 0)) AS `total_vehicles`,
  (SELECT COUNT(0) FROM `drivers` WHERE (`drivers`.`deleted` = 0)) AS `total_drivers`,
  (SELECT COUNT(0) FROM `vehicles` WHERE ((`vehicles`.`deleted` = 0) AND (`vehicles`.`driver_id` IS NULL))) AS `vehicles_without_driver`,
  (SELECT COUNT(0) FROM `vehicles` `v` WHERE ((`v`.`deleted` = 0) AND EXISTS(SELECT 1 FROM `vehicle_insurances` `vi` WHERE (`vi`.`vehicle_id` = `v`.`vehicle_id`)) IS FALSE)) AS `vehicles_without_insurance`,
  (SELECT COUNT(0) FROM `view_current_documents` WHERE ((`view_current_documents`.`document_type` = 'act_tax') AND (`view_current_documents`.`days_remaining` BETWEEN 0 AND 30))) AS `act_tax_expiring_30d`,
  (SELECT COUNT(0) FROM `view_current_documents` WHERE ((`view_current_documents`.`document_type` = 'act_tax') AND (`view_current_documents`.`days_remaining` < 0))) AS `act_tax_expired`,
  (SELECT COUNT(0) FROM `view_current_documents` WHERE ((`view_current_documents`.`document_type` = 'insurance') AND (`view_current_documents`.`days_remaining` BETWEEN 0 AND 30))) AS `insurance_expiring_30d`,
  (SELECT COUNT(0) FROM `view_current_documents` WHERE ((`view_current_documents`.`document_type` = 'insurance') AND (`view_current_documents`.`days_remaining` < 0))) AS `insurance_expired`,
  (SELECT COUNT(0) FROM `view_current_documents` WHERE (`view_current_documents`.`days_remaining` BETWEEN 0 AND 30)) AS `documents_expiring_30d_total`,
  (SELECT COUNT(0) FROM `view_current_documents` WHERE (`view_current_documents`.`days_remaining` < 0)) AS `documents_expired_total`,
  (SELECT COUNT(0) FROM `violations` WHERE (`violations`.`is_paid` = 0)) AS `unpaid_violations_count`,
  (SELECT COALESCE(SUM(`violations`.`fine`), 0) FROM `violations` WHERE (`violations`.`is_paid` = 0)) AS `unpaid_violations_total_fine`,
  (SELECT COUNT(0) FROM `violations` WHERE ((YEAR(`violations`.`incident_datetime`) = YEAR(CURDATE())) AND (MONTH(`violations`.`incident_datetime`) = MONTH(CURDATE())))) AS `violations_this_month`,
  (SELECT COUNT(0) FROM `maintenances` WHERE ((YEAR(`maintenances`.`service_date`) = YEAR(CURDATE())) AND (MONTH(`maintenances`.`service_date`) = MONTH(CURDATE())))) AS `maintenances_this_month`,
  (SELECT COALESCE(SUM((`md`.`quantity` * `md`.`unit_price`)), 0) FROM (`maintenances` `m` JOIN `maintenance_details` `md` ON ((`md`.`maintenance_id` = `m`.`maintenance_id`))) WHERE ((YEAR(`m`.`service_date`) = YEAR(CURDATE())) AND (MONTH(`m`.`service_date`) = MONTH(CURDATE())))) AS `maintenance_cost_this_month`;
