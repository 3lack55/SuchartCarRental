-- Migration: เพิ่มคอลัมน์ยอดชำระ (amount) ให้ไหลผ่าน view chain ของเอกสาร
-- (view_document_expiry -> view_current_documents -> view_document_summary)
-- เพื่อให้หน้า "พ.ร.บ. ภาษี และประกัน" แสดง "ราคาต่ออายุล่าสุด" ในตารางสรุปได้
-- ต้องรันหลัง scripts/migrate_document_renewal_amount.sql (ที่เพิ่มคอลัมน์ amount ให้ตารางจริงแล้ว) เท่านั้น
-- เป็นแค่ CREATE OR REPLACE VIEW ไม่กระทบข้อมูล ไม่ต้องสำรองก่อนก็ได้ แต่แนะนำให้ทำเป็นนิสัยเสมอ
-- SET NAMES utf8mb4 จำเป็นตรงนี้: ถ้ารันผ่าน `docker exec -i mysql ... < file` โดยไม่ตั้งชุดอักขระของ session ก่อน
-- mysql client จะตีความ string literal ('act_tax'/'insurance') เป็น latin1 ตามค่าเริ่มต้น แล้วชนกับ
-- "collate utf8mb4_unicode_ci" ที่ระบุไว้ (ทำให้ error 1253) ต้องสั่ง SET NAMES ให้ตรงกับ collation ที่ใช้ก่อนเสมอ
SET NAMES utf8mb4;

CREATE OR REPLACE VIEW `view_document_expiry` AS
select 'act_tax' collate utf8mb4_unicode_ci as document_type, at.act_tax_id as document_id, at.vehicle_id as vehicle_id,
    v.plate_number as plate_number, p.name_th as plate_province, at.insurance_company as provider,
    at.last_paid_date as last_paid_date, at.expire_date as expire_date, at.amount as amount,
    (to_days(at.expire_date) - to_days(curdate())) as days_remaining
from vehicle_act_tax at
join vehicles v on v.vehicle_id = at.vehicle_id
join provinces p on p.province_id = v.plate_province_id
where v.deleted = 0
union all
select 'insurance' collate utf8mb4_unicode_ci as document_type, i.insurance_id as document_id, i.vehicle_id as vehicle_id,
    v.plate_number as plate_number, p.name_th as plate_province, i.insurance_company as provider,
    i.last_paid_date as last_paid_date, i.expire_date as expire_date, i.amount as amount,
    (to_days(i.expire_date) - to_days(curdate())) as days_remaining
from vehicle_insurances i
join vehicles v on v.vehicle_id = i.vehicle_id
join provinces p on p.province_id = v.plate_province_id
where v.deleted = 0;

CREATE OR REPLACE VIEW `view_current_documents` AS
select ranked.document_type, ranked.document_id, ranked.vehicle_id, ranked.plate_number, ranked.plate_province,
    ranked.provider, ranked.last_paid_date, ranked.expire_date, ranked.amount, ranked.days_remaining
from (
    select vde.document_type, vde.document_id, vde.vehicle_id, vde.plate_number, vde.plate_province,
        vde.provider, vde.last_paid_date, vde.expire_date, vde.amount, vde.days_remaining,
        row_number() OVER (PARTITION BY vde.document_type, vde.vehicle_id ORDER BY vde.expire_date desc) as rn
    from view_document_expiry vde
) ranked
where ranked.rn = 1;

CREATE OR REPLACE VIEW `view_document_summary` AS
select v.vehicle_id, v.plate_number, p.name_th as plate_province,
    at.document_id as act_tax_document_id, at.expire_date as act_tax_expire_date, at.amount as act_tax_amount, at.days_remaining as act_tax_days_remaining,
    ins.document_id as insurance_document_id, ins.expire_date as insurance_expire_date, ins.amount as insurance_amount, ins.days_remaining as insurance_days_remaining
from vehicles v
join provinces p on p.province_id = v.plate_province_id
left join view_current_documents at on (at.vehicle_id = v.vehicle_id and at.document_type = 'act_tax')
left join view_current_documents ins on (ins.vehicle_id = v.vehicle_id and ins.document_type = 'insurance')
where v.deleted = 0;
