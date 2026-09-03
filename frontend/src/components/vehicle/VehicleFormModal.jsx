import { useEffect, useState } from 'react';
import Modal from '../globals/Modal';
import Select from '../globals/Select.jsx';
import DatePicker from '../globals/DatePicker.jsx';
import { useCreateVehicle, useUpdateVehicle, useVehicle, useRestoreVehicle } from '../../services/vehicles/vehiclesQueries.js';
import { useProvinces, useVehicleTypes } from '../../services/lookups/lookupQueries.js';
import { useDrivers } from '../../services/drivers/driversQueries.js';
import { DOCUMENT_TYPE_META, documentStatusStyle } from '../documents/documentMeta.js';

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

const CURRENT_YEAR = new Date().getFullYear();
// ปีที่ซื้อ: เรียงจากใหม่ไปเก่า ตั้งแต่ปีหน้าย้อนไป 1980 (ตรงกับขอบเขตที่ backend ตรวจสอบ)
const PURCHASE_YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR + 1 - 1980 + 1 }, (_, i) => {
  const year = CURRENT_YEAR + 1 - i;
  return { value: String(year), label: String(year) };
});
const THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const THAI_MONTH_OPTIONS = THAI_MONTHS.map((label, i) => ({ value: String(i + 1), label }));

function buildFormState(vehicle) {
  return {
    brand_model: vehicle?.brand_model ?? '',
    plate_number: vehicle?.plate_number ?? '',
    plate_province_id: vehicle?.plate_province_id ? String(vehicle.plate_province_id) : '',
    type_id: vehicle?.type?.type_id ? String(vehicle.type.type_id) : '',
    driver_id: vehicle?.driver?.driver_id ? String(vehicle.driver.driver_id) : '',
    purchase_year: vehicle?.purchase_year ? String(vehicle.purchase_year) : '',
    purchase_month: vehicle?.purchase_month ? String(vehicle.purchase_month) : '',
  };
}

// vehicle: ส่งมาถ้าเป็นโหมดแก้ไข, ไม่ส่งมา = โหมดเพิ่มใหม่
export default function VehicleFormModal({ vehicle, onClose, onSaved }) {
  // แยกเป็น state ของตัวเอง (ไม่ใช้ prop ตรงๆ) เพราะถ้าเจอข้อมูลเดิมที่ถูกลบไปแล้ว (conflict) แล้วผู้ใช้กด
  // "ดูและแก้ไขข้อมูล" ฟอร์มนี้ต้องสลับไปเป็นโหมดแก้ไขของรถคันนั้นได้เอง (พร้อมข้อมูลเดิมที่ดึงมา)
  const [editingVehicle, setEditingVehicle] = useState(vehicle ?? null);
  const isEdit = Boolean(editingVehicle);
  // true เมื่อกำลังแก้ไขรถที่ยัง "ปลดระวาง" (soft-deleted) อยู่ — ต้องกู้คืนด้วยถึงจะใช้งานได้จริง
  const isRestoringEdit = isEdit && Boolean(editingVehicle.deleted);

  const provincesQuery = useProvinces();
  const typesQuery = useVehicleTypes();
  const driversQuery = useDrivers();

  const provinces = provincesQuery.data?.data ?? [];
  const types = typesQuery.data?.data ?? [];
  const drivers = driversQuery.data?.data ?? [];
  const loadingOptions = provincesQuery.isLoading || typesQuery.isLoading || driversQuery.isLoading;
  const optionsError = provincesQuery.error || typesQuery.error || driversQuery.error;

  const [form, setForm] = useState(() => buildFormState(editingVehicle));

  // เอกสารแนบตอนเพิ่มรถใหม่: กรอกได้ก็ต่อเมื่อมีข้อมูลจริง (ไม่บังคับ)
  const [actTax, setActTax] = useState({ enabled: false, insurance_company: '', last_paid_date: '', expire_date: '' });
  const [insurance, setInsurance] = useState({ enabled: false, insurance_company: '', last_paid_date: '', expire_date: '' });

  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [docErrors, setDocErrors] = useState({ actTax: {}, insurance: {} });
  const [conflictVehicleId, setConflictVehicleId] = useState(null); // vehicle_id ของข้อมูลเดิมที่ถูกลบไปแล้ว ถ้าเจอ (โชว์ modal แจ้งก่อน)
  const [viewingConflict, setViewingConflict] = useState(false); // true หลังกด "ดูและแก้ไขข้อมูล" ในตอนที่ยังโหลดข้อมูลเดิมอยู่

  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const restoreVehicle = useRestoreVehicle();
  const conflictQuery = useVehicle(conflictVehicleId);
  const submitting = createVehicle.isPending || updateVehicle.isPending || restoreVehicle.isPending;

  // พอโหลดข้อมูลรถที่ถูกลบไปแล้วเสร็จ (หลังกด "ดูและแก้ไขข้อมูล") ให้สลับฟอร์มไปโหมดแก้ไขด้วยข้อมูลนั้นทันที
  useEffect(() => {
    if (viewingConflict && conflictQuery.data?.data) {
      const fullVehicle = conflictQuery.data.data;
      setEditingVehicle(fullVehicle);
      setForm(buildFormState(fullVehicle));
      setFieldErrors({});
      setError(null);
      setConflictVehicleId(null);
      setViewingConflict(false);
    }
  }, [viewingConflict, conflictQuery.data]);

  function handleChange(field, value) {
    // เคลียร์เดือนที่ซื้อไปด้วยถ้าล้างปีที่ซื้อ กันเดือนค้างอยู่แบบไม่มีปีคู่กัน
    setForm((prev) => ({ ...prev, [field]: value, ...(field === 'purchase_year' && !value ? { purchase_month: '' } : {}) }));
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  function handleDocChange(key, setter, field, value) {
    setter((prev) => ({ ...prev, [field]: value }));
    setDocErrors((prev) => (prev[key][field] ? { ...prev, [key]: { ...prev[key], [field]: undefined } } : prev));
  }

  function validate() {
    const errors = {};
    if (!form.plate_number.trim()) errors.plate_number = 'กรุณากรอกทะเบียนรถ';
    if (!form.plate_province_id) errors.plate_province_id = 'กรุณาเลือกจังหวัด';
    return errors;
  }

  // เช็คเฉพาะการ์ดเอกสารที่ติ๊กเปิดไว้ (enabled) เท่านั้น การ์ดที่ปิดอยู่ไม่ต้องกรอกอะไร
  function validateDocSection(state) {
    if (!state.enabled) return {};
    const errors = {};
    if (!state.last_paid_date) errors.last_paid_date = 'กรุณาเลือกวันที่ชำระล่าสุด';
    if (!state.expire_date) errors.expire_date = 'กรุณาเลือกวันหมดอายุ';
    else if (state.last_paid_date && state.expire_date <= state.last_paid_date) errors.expire_date = 'วันหมดอายุต้องหลังวันที่ชำระล่าสุด';
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const nextErrors = validate();
    setFieldErrors(nextErrors);

    let hasDocErrors = false;
    if (!isEdit) {
      const nextDocErrors = {
        actTax: validateDocSection(actTax),
        insurance: validateDocSection(insurance),
      };
      setDocErrors(nextDocErrors);
      hasDocErrors = Object.values(nextDocErrors).some((e) => Object.keys(e).length > 0);
    }

    if (Object.keys(nextErrors).length > 0 || hasDocErrors) return;

    try {
      const payload = {
        brand_model: form.brand_model || null,
        plate_number: form.plate_number,
        plate_province_id: Number(form.plate_province_id),
        type_id: form.type_id ? Number(form.type_id) : null,
        driver_id: form.driver_id ? Number(form.driver_id) : null,
        purchase_year: form.purchase_year ? Number(form.purchase_year) : null,
        purchase_month: form.purchase_month ? Number(form.purchase_month) : null,
      };

      if (!isEdit) {
        if (actTax.enabled) {
          payload.act_tax = {
            insurance_company: actTax.insurance_company.trim() || null,
            last_paid_date: actTax.last_paid_date,
            expire_date: actTax.expire_date,
          };
        }
        if (insurance.enabled) {
          payload.insurance = {
            insurance_company: insurance.insurance_company.trim() || null,
            last_paid_date: insurance.last_paid_date,
            expire_date: insurance.expire_date,
          };
        }
      }

      let saved;
      if (isEdit) {
        // แก้ไขข้อมูลรถที่ยังปลดระวางอยู่ = กู้คืนให้กลับมาใช้งานได้พร้อมกันไปเลย ไม่ต้องกดกู้คืนแยก
        if (isRestoringEdit) await restoreVehicle.mutateAsync(editingVehicle.vehicle_id);
        saved = await updateVehicle.mutateAsync({ id: editingVehicle.vehicle_id, data: payload });
      } else {
        saved = await createVehicle.mutateAsync(payload);
      }
      const successMessage = isEdit ? 'แก้ไขข้อมูลรถเรียบร้อย' : 'เพิ่มรถเรียบร้อย';
      onSaved?.(saved, successMessage);
    } catch (err) {
      if (err.data?.conflict === 'soft-deleted' && err.data.entity === 'vehicle') {
        setConflictVehicleId(err.data.id);
        return;
      }
      if (err.message.includes('ทะเบียนรถ')) {
        setFieldErrors((prev) => ({ ...prev, plate_number: err.message }));
      } else {
        setError(err.message);
      }
    }
  }

  return (
    <Modal title={isEdit ? 'แก้ไขข้อมูลรถ' : 'เพิ่มรถ'} onClose={onClose}>
      {loadingOptions ? (
        <div role="status" className="flex items-center justify-center p-16" style={{ color: 'var(--sub-text)' }}>กำลังโหลดข้อมูล...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label htmlFor="vehicle-brand-model" className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--sub-text)' }}>รุ่นรถ</label>
            <input
              id="vehicle-brand-model"
              value={form.brand_model}
              onChange={(e) => handleChange('brand_model', e.target.value)}
              placeholder="เช่น Toyota Hilux Revo 2022"
              className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
              style={{ backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', borderColor: 'var(--surface-border)' }}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <label htmlFor="vehicle-plate-number" className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--sub-text)' }}>ทะเบียน</label>
              <input
                id="vehicle-plate-number"
                aria-invalid={Boolean(fieldErrors.plate_number)}
                value={form.plate_number}
                onChange={(e) => handleChange('plate_number', e.target.value)}
                placeholder="เช่น 1กข1234"
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                style={{ backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', borderColor: fieldErrors.plate_number ? 'var(--status-danger)' : 'var(--surface-border)' }}
              />
              {fieldErrors.plate_number && <p role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{fieldErrors.plate_number}</p>}
            </div>
            <div className="flex-1">
              <label htmlFor="vehicle-plate-province" className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--sub-text)' }}>จังหวัด</label>
              <Select
                id="vehicle-plate-province"
                value={form.plate_province_id}
                onChange={(value) => handleChange('plate_province_id', value)}
                placeholder="เลือกจังหวัด"
                error={Boolean(fieldErrors.plate_province_id)}
                options={provinces.map((p) => ({ value: String(p.province_id), label: p.name_th }))}
              />
              {fieldErrors.plate_province_id && <p role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{fieldErrors.plate_province_id}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <label htmlFor="vehicle-type" className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--sub-text)' }}>ประเภทรถ</label>
              <Select
                id="vehicle-type"
                value={form.type_id}
                onChange={(value) => handleChange('type_id', value)}
                options={[{ value: '', label: 'ไม่ระบุ' }, ...types.map((t) => ({ value: String(t.type_id), label: t.type_name }))]}
              />
            </div>
            <div className="flex-1">
              <label htmlFor="vehicle-driver" className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--sub-text)' }}>คนขับประจำ</label>
              <Select
                id="vehicle-driver"
                value={form.driver_id}
                onChange={(value) => handleChange('driver_id', value)}
                options={[{ value: '', label: 'ไม่มีคนขับประจำ' }, ...drivers.map((d) => ({ value: String(d.driver_id), label: `${d.prefix}${d.first_name} ${d.last_name}` }))]}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <label htmlFor="vehicle-purchase-year" className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--sub-text)' }}>ปีที่ซื้อ</label>
              <Select
                id="vehicle-purchase-year"
                value={form.purchase_year}
                onChange={(value) => handleChange('purchase_year', value)}
                placeholder="ไม่ระบุ"
                options={[{ value: '', label: 'ไม่ระบุ' }, ...PURCHASE_YEAR_OPTIONS]}
              />
            </div>
            <div className="flex-1">
              <label htmlFor="vehicle-purchase-month" className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--sub-text)' }}>เดือนที่ซื้อ</label>
              <Select
                id="vehicle-purchase-month"
                value={form.purchase_month}
                onChange={(value) => handleChange('purchase_month', value)}
                placeholder="ไม่ระบุ"
                disabled={!form.purchase_year}
                options={[{ value: '', label: 'ไม่ระบุ' }, ...THAI_MONTH_OPTIONS]}
              />
            </div>
          </div>

          {isRestoringEdit && (
            <div className="space-y-2 rounded-xl border p-3" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-soft)' }}>
              <p className="text-xs font-medium" style={{ color: 'var(--sub-text)' }}>เอกสารที่มีอยู่เดิม (พ.ร.บ./ภาษี/ประกัน)</p>
              {editingVehicle.documents.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--icon-muted)' }}>ยังไม่มีข้อมูลเอกสาร</p>
              ) : (
                <ul className="space-y-1.5">
                  {editingVehicle.documents.map((doc) => {
                    const status = documentStatusStyle(doc.days_remaining);
                    return (
                      <li
                        key={doc.document_type}
                        className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                        style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface)' }}
                      >
                        <div>
                          <p style={{ color: 'var(--page-text)' }}>{DOCUMENT_TYPE_META[doc.document_type]?.label ?? doc.document_type}</p>
                          <p className="text-xs" style={{ color: 'var(--sub-text)' }}>หมดอายุ {formatDate(doc.expire_date)}</p>
                        </div>
                        <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ backgroundColor: status.bg, color: status.color }}>
                          {status.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
              <p className="text-xs" style={{ color: 'var(--sub-text)' }}>แก้ไขเอกสารเหล่านี้ได้ที่หน้า "พ.ร.บ. ภาษี และประกัน" หลังกู้คืนรถคันนี้แล้ว</p>
            </div>
          )}

          {!isEdit && (
            <div className="space-y-3 border-t pt-4" style={{ borderColor: 'var(--surface-border)' }}>
              <p className="text-xs font-medium" style={{ color: 'var(--sub-text)' }}>เอกสารรถ (กรอกได้ถ้ามีข้อมูล)</p>

              <DocumentSection
                idPrefix="act-tax"
                title="พ.ร.บ. และภาษีรถยนต์"
                state={actTax}
                errors={docErrors.actTax}
                onChange={(field, value) => handleDocChange('actTax', setActTax, field, value)}
              />
              <DocumentSection
                idPrefix="insurance"
                title="ประกันภาคสมัครใจ"
                state={insurance}
                errors={docErrors.insurance}
                onChange={(field, value) => handleDocChange('insurance', setInsurance, field, value)}
              />
            </div>
          )}

          {(error || optionsError) && (
            <p role="alert" className="text-sm" style={{ color: 'var(--status-danger)' }}>{error || optionsError.message}</p>
          )}

          <div className="flex gap-2 border-t pt-4" style={{ borderColor: 'var(--surface-border)' }}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 cursor-pointer rounded-xl border py-2.5 text-sm font-medium transition-all hover:opacity-80"
              style={{ backgroundColor: 'var(--surface-soft)', borderColor: 'var(--surface-border)', color: 'var(--page-text)' }}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 cursor-pointer rounded-xl py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: 'var(--primary-color)', color: 'var(--on-primary)' }}
            >
              {submitting ? 'กำลังบันทึก...' : isRestoringEdit ? 'บันทึกและกู้คืน' : 'บันทึก'}
            </button>
          </div>
        </form>
      )}

      {conflictVehicleId && !viewingConflict && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setConflictVehicleId(null); }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-2xl border p-5 shadow-xl"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)', boxShadow: '0 20px 40px rgba(15, 23, 42, 0.18)' }}
          >
            <p className="font-semibold" style={{ color: 'var(--page-text)' }}>พบข้อมูลที่เคยถูกลบ</p>
            <p className="mt-1.5 text-sm" style={{ color: 'var(--sub-text)' }}>
              เคยมีข้อมูลรถทะเบียนนี้อยู่ในระบบแล้ว แต่ถูกลบไปก่อนหน้านี้ ต้องการดูและแก้ไขข้อมูลเดิมหรือไม่?
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setConflictVehicleId(null)}
                className="flex-1 cursor-pointer rounded-xl border py-2.5 text-sm font-medium transition-all hover:opacity-80"
                style={{ backgroundColor: 'var(--surface-soft)', borderColor: 'var(--surface-border)', color: 'var(--page-text)' }}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => setViewingConflict(true)}
                className="flex-1 cursor-pointer rounded-xl py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--primary-color)', color: 'var(--on-primary)' }}
              >
                ดูและแก้ไขข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingConflict && conflictQuery.isLoading && (
        <div className="fixed inset-0 z-60 flex items-center justify-center" style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)' }}>
          <div className="rounded-2xl border px-6 py-4 text-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)', color: 'var(--sub-text)' }}>
            กำลังโหลดข้อมูลเดิม...
          </div>
        </div>
      )}
    </Modal>
  );
}

const inputStyle = { backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', borderColor: 'var(--surface-border)' };

// การ์ดเอกสารแบบเปิด/ปิดได้: ติ๊กเปิดเมื่อมีข้อมูลจริงเท่านั้น ค่อยแสดงช่องกรอกและบังคับกรอกครบ
function DocumentSection({ idPrefix, title, state, errors = {}, onChange }) {
  return (
    <div className="rounded-xl border p-3" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-soft)' }}>
      <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--page-text)' }}>
        <input
          type="checkbox"
          checked={state.enabled}
          onChange={(e) => onChange('enabled', e.target.checked)}
          style={{ accentColor: 'var(--primary-color)' }}
        />
        {title}
      </label>

      {state.enabled && (
        <div className="mt-3 space-y-2">
          <div>
            <label htmlFor={`${idPrefix}-company`} className="mb-1 block text-xs" style={{ color: 'var(--sub-text)' }}>บริษัทประกัน</label>
            <input
              id={`${idPrefix}-company`}
              value={state.insurance_company}
              onChange={(e) => onChange('insurance_company', e.target.value)}
              placeholder="ไม่บังคับกรอก"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft)"
              style={{ ...inputStyle, borderColor: errors.insurance_company ? 'var(--status-danger)' : 'var(--surface-border)' }}
            />
            {errors.insurance_company && <p role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{errors.insurance_company}</p>}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex-1">
              <label htmlFor={`${idPrefix}-last-paid-date`} className="mb-1 block text-xs" style={{ color: 'var(--sub-text)' }}>วันที่ชำระล่าสุด</label>
              <DatePicker
                id={`${idPrefix}-last-paid-date`}
                value={state.last_paid_date}
                onChange={(value) => onChange('last_paid_date', value)}
                error={Boolean(errors.last_paid_date)}
              />
              {errors.last_paid_date && <p role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{errors.last_paid_date}</p>}
            </div>
            <div className="flex-1">
              <label htmlFor={`${idPrefix}-expire-date`} className="mb-1 block text-xs" style={{ color: 'var(--sub-text)' }}>วันหมดอายุ</label>
              <DatePicker
                id={`${idPrefix}-expire-date`}
                value={state.expire_date}
                onChange={(value) => onChange('expire_date', value)}
                min={state.last_paid_date || undefined}
                error={Boolean(errors.expire_date)}
              />
              {errors.expire_date && <p role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{errors.expire_date}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}