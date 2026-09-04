-- Migration: เพิ่มสรุปรายการซ่อมย่อยใน view_maintenance_summary สำหรับหน้ารายการซ่อมบำรุง
-- - type_breakdown: จำนวนรายการแยกตามประเภท เช่น "เปลี่ยน 2, ซ่อม 3" (คอลัมน์ "รายการซ่อม")
-- - item_names: รายชื่อรายการย่อยจริง (service_item_name) คั่นด้วยจุลภาค ไม่รวมประเภท/หมวดหมู่ (คอลัมน์ "รายละเอียด")
-- - item_type_names: ประเภทของแต่ละรายการย่อย เรียงลำดับตรงกับ item_names (index ต่อ index) ใช้ไปหาสีมาระบายข้อความแต่ละบรรทัด
-- ทั้ง item_names/item_type_names เรียงตาม service_type_id ก่อน (แล้วค่อย detail_id) ให้ลำดับประเภทตรงกับ type_breakdown เป๊ะ
-- (ไม่งั้นรายการซ่อมจะโชว์ "ซ่อม, เปลี่ยน" แต่รายละเอียดโชว์ "เปลี่ยน, ซ่อม" สลับกัน ดูไม่สัมพันธ์กัน)
-- สำรองฐานข้อมูลก่อนรันเสมอ

DROP VIEW IF EXISTS `view_maintenance_summary`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_maintenance_summary` AS
SELECT
  m.`maintenance_id` AS `maintenance_id`,
  m.`vehicle_id` AS `vehicle_id`,
  v.`plate_number` AS `plate_number`,
  v.`brand_model` AS `model`,
  p.`name_th` AS `plate_province`,
  m.`service_date` AS `service_date`,
  m.`garage_name` AS `garage_name`,
  m.`garage_type` AS `garage_type`,
  m.`receipt_number` AS `receipt_number`,
  m.`mileage` AS `mileage`,
  m.`next_service_mileage` AS `next_service_mileage`,
  COUNT(md.`detail_id`) AS `total_items`,
  COALESCE(SUM(md.`quantity` * md.`unit_price`), 0) AS `total_cost`,
  type_counts.`type_breakdown` AS `type_breakdown`,
  GROUP_CONCAT(si.`service_item_name` ORDER BY st2.`service_type_id`, md.`detail_id` SEPARATOR ', ') AS `item_names`,
  GROUP_CONCAT(st2.`service_type_name` ORDER BY st2.`service_type_id`, md.`detail_id` SEPARATOR ', ') AS `item_type_names`
FROM `maintenances` m
JOIN `vehicles` v ON v.`vehicle_id` = m.`vehicle_id`
JOIN `provinces` p ON p.`province_id` = v.`plate_province_id`
LEFT JOIN `maintenance_details` md ON md.`maintenance_id` = m.`maintenance_id`
LEFT JOIN `service_items` si ON si.`service_item_id` = md.`service_item_id`
LEFT JOIN `service_category` sc2 ON sc2.`service_category_id` = si.`service_category_id`
LEFT JOIN `service_type` st2 ON st2.`service_type_id` = sc2.`service_type_id`
LEFT JOIN (
  SELECT cnt.`maintenance_id`,
    GROUP_CONCAT(CONCAT(st.`service_type_name`, ' ', cnt.`item_count`) ORDER BY st.`service_type_id` SEPARATOR ', ') AS `type_breakdown`
  FROM (
    SELECT md2.`maintenance_id`, sc.`service_type_id`, COUNT(*) AS `item_count`
    FROM `maintenance_details` md2
    JOIN `service_items` si2 ON si2.`service_item_id` = md2.`service_item_id`
    JOIN `service_category` sc ON sc.`service_category_id` = si2.`service_category_id`
    GROUP BY md2.`maintenance_id`, sc.`service_type_id`
  ) cnt
  JOIN `service_type` st ON st.`service_type_id` = cnt.`service_type_id`
  GROUP BY cnt.`maintenance_id`
) type_counts ON type_counts.`maintenance_id` = m.`maintenance_id`
GROUP BY m.`maintenance_id`, m.`vehicle_id`, v.`plate_number`, v.`brand_model`, p.`name_th`,
  m.`service_date`, m.`garage_name`, m.`garage_type`, m.`receipt_number`, m.`mileage`, m.`next_service_mileage`,
  type_counts.`type_breakdown`;
