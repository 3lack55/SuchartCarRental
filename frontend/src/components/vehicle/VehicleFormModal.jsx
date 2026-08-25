import { useState } from 'react';
import Modal from '../globals/Modal';
import Select from '../globals/Select.jsx';
import DatePicker from '../globals/DatePicker.jsx';
import { useCreateVehicle, useUpdateVehicle } from '../../services/vehicles/vehiclesQueries.js';
import { useProvinces, useVehicleTypes } from '../../services/lookups/lookupQueries.js';
import { useDrivers } from '../../services/drivers/driversQueries.js';

// vehicle: ส่งมาถ้าเป็นโหมดแก้ไข, ไม่ส่งมา = โหมดเพิ่มใหม่
export default function VehicleFormModal({ vehicle, onClose, onSaved }) {
  const isEdit = Boolean(vehicle);

  const provincesQuery = useProvinces();
  const typesQuery = useVehicleTypes();
  const driversQuery = useDrivers();

  const provinces = provincesQuery.data?.data ?? [];
  const types = typesQuery.data?.data ?? [];
  const drivers = driversQuery.data?.data ?? [];
  const loadingOptions = provincesQuery.isLoading || typesQuery.isLoading || driversQuery.isLoading;
  const optionsError = provincesQuery.error || typesQuery.error || driversQuery.error;

  const [form, setForm] = useState({
    brand_model: vehicle?.brand_model ?? '',
    plate_number: vehicle?.plate_number ?? '',
    plate_province_id: vehicle?.plate_province_id ? String(vehicle.plate_province_id) : '',
    type_id: vehicle?.type?.type_id ? String(vehicle.type.type_id) : '',
    driver_id: vehicle?.driver?.driver_id ? String(vehicle.driver.driver_id) : '',
  });

  // เอกสารแนบตอนเพิ่มรถใหม่: กรอกได้ก็ต่อเมื่อมีข้อมูลจริง (ไม่บังคับ)
  const [actTax, setActTax] = useState({ enabled: false, insurance_company: '', last_paid_date: '', expire_date: '', premium_amount: '', fee_amount: '' });
  const [insurance, setInsurance] = useState({ enabled: false, insurance_company: '', last_paid_date: '', expire_date: '' });

  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [docErrors, setDocErrors] = useState({ actTax: {}, insurance: {} });

  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const submitting = createVehicle.isPending || updateVehicle.isPending;

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
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
  function validateDocSection(state, { showCompany, amountFields = [] }) {
    if (!state.enabled) return {};
    const errors = {};
    if (showCompany && !state.insurance_company.trim()) errors.insurance_company = 'กรุณากรอกบริษัทประกัน';
    if (!state.last_paid_date) errors.last_paid_date = 'กรุณาเลือกวันที่ชำระล่าสุด';
    if (!state.expire_date) errors.expire_date = 'กรุณาเลือกวันหมดอายุ';
    else if (state.last_paid_date && state.expire_date <= state.last_paid_date) errors.expire_date = 'วันหมดอายุต้องหลังวันที่ชำระล่าสุด';
    amountFields.forEach((amountField) => {
      if (!String(state[amountField.key]).trim()) errors[amountField.key] = `กรุณากรอก${amountField.label}`;
    });
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
        actTax: validateDocSection(actTax, { showCompany: true, amountFields: [{ key: 'premium_amount', label: 'เบี้ยประกัน พ.ร.บ.' }, { key: 'fee_amount', label: 'ค่าธรรมเนียมภาษี' }] }),
        insurance: validateDocSection(insurance, { showCompany: true }),
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
      };

      if (!isEdit) {
        if (actTax.enabled) {
          payload.act_tax = {
            insurance_company: actTax.insurance_company,
            last_paid_date: actTax.last_paid_date,
            expire_date: actTax.expire_date,
            premium_amount: Number(actTax.premium_amount),
            fee_amount: Number(actTax.fee_amount),
          };
        }
        if (insurance.enabled) {
          payload.insurance = {
            insurance_company: insurance.insurance_company,
            last_paid_date: insurance.last_paid_date,
            expire_date: insurance.expire_date,
          };
        }
      }

      const saved = isEdit
        ? await updateVehicle.mutateAsync({ id: vehicle.vehicle_id, data: payload })
        : await createVehicle.mutateAsync(payload);
      const successMessage = isEdit ? 'แก้ไขข้อมูลรถเรียบร้อย' : 'เพิ่มรถเรียบร้อย';
      onSaved?.(saved, successMessage);
    } catch (err) {
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

          {!isEdit && (
            <div className="space-y-3 border-t pt-4" style={{ borderColor: 'var(--surface-border)' }}>
              <p className="text-xs font-medium" style={{ color: 'var(--sub-text)' }}>เอกสารรถ (กรอกได้ถ้ามีข้อมูล)</p>

              <DocumentSection
                idPrefix="act-tax"
                title="พ.ร.บ. และภาษีรถยนต์"
                state={actTax}
                errors={docErrors.actTax}
                onChange={(field, value) => handleDocChange('actTax', setActTax, field, value)}
                showCompany
                amountFields={[
                  { key: 'premium_amount', label: 'เบี้ยประกัน พ.ร.บ. (บาท)' },
                  { key: 'fee_amount', label: 'ค่าธรรมเนียมภาษี (บาท)' },
                ]}
              />
              <DocumentSection
                idPrefix="insurance"
                title="ประกันภาคสมัครใจ"
                state={insurance}
                errors={docErrors.insurance}
                onChange={(field, value) => handleDocChange('insurance', setInsurance, field, value)}
                showCompany
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
              {submitting ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

const inputStyle = { backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', borderColor: 'var(--surface-border)' };

// การ์ดเอกสารแบบเปิด/ปิดได้: ติ๊กเปิดเมื่อมีข้อมูลจริงเท่านั้น ค่อยแสดงช่องกรอกและบังคับกรอกครบ
function DocumentSection({ idPrefix, title, state, errors = {}, onChange, showCompany = false, amountFields = [] }) {
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
          {showCompany && (
            <div>
              <label htmlFor={`${idPrefix}-company`} className="mb-1 block text-xs" style={{ color: 'var(--sub-text)' }}>บริษัทประกัน</label>
              <input
                id={`${idPrefix}-company`}
                value={state.insurance_company}
                onChange={(e) => onChange('insurance_company', e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft)"
                style={{ ...inputStyle, borderColor: errors.insurance_company ? 'var(--status-danger)' : 'var(--surface-border)' }}
              />
              {errors.insurance_company && <p role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{errors.insurance_company}</p>}
            </div>
          )}

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

          {amountFields.map((amountField) => (
            <div key={amountField.key}>
              <label htmlFor={`${idPrefix}-${amountField.key}`} className="mb-1 block text-xs" style={{ color: 'var(--sub-text)' }}>{amountField.label}</label>
              <input
                id={`${idPrefix}-${amountField.key}`}
                type="number"
                min="0"
                step="0.01"
                value={state[amountField.key]}
                onChange={(e) => onChange(amountField.key, e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft)"
                style={{ ...inputStyle, borderColor: errors[amountField.key] ? 'var(--status-danger)' : 'var(--surface-border)' }}
              />
              {errors[amountField.key] && <p role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{errors[amountField.key]}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}