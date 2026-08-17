import { useState } from 'react';
import Modal from '../globals/Modal';
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
    plate_province_id: vehicle?.plate_province_id ?? '',
    type_id: vehicle?.type?.type_id ?? '',
    driver_id: vehicle?.driver?.driver_id ?? '',
  });

  // เอกสารแนบตอนเพิ่มรถใหม่: กรอกได้ก็ต่อเมื่อมีข้อมูลจริง (ไม่บังคับ)
  const [act, setAct] = useState({ enabled: false, insurance_company: '', last_paid_date: '', expire_date: '', premium_amount: '' });
  const [tax, setTax] = useState({ enabled: false, last_paid_date: '', expire_date: '', fee_amount: '' });
  const [insurance, setInsurance] = useState({ enabled: false, insurance_company: '', last_paid_date: '', expire_date: '' });

  const [error, setError] = useState(null);

  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const submitting = createVehicle.isPending || updateVehicle.isPending;

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleDocChange(setter, field, value) {
    setter((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    try {
      const payload = {
        brand_model: form.brand_model || null,
        plate_number: form.plate_number,
        plate_province_id: Number(form.plate_province_id),
        type_id: form.type_id ? Number(form.type_id) : null,
        driver_id: form.driver_id ? Number(form.driver_id) : null,
      };

      if (!isEdit) {
        if (act.enabled) {
          payload.act = {
            insurance_company: act.insurance_company,
            last_paid_date: act.last_paid_date,
            expire_date: act.expire_date,
            premium_amount: Number(act.premium_amount),
          };
        }
        if (tax.enabled) {
          payload.tax = {
            last_paid_date: tax.last_paid_date,
            expire_date: tax.expire_date,
            fee_amount: Number(tax.fee_amount),
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
      setError(err.message);
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
                required
                value={form.plate_number}
                onChange={(e) => handleChange('plate_number', e.target.value)}
                placeholder="เช่น 1กข1234"
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                style={{ backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', borderColor: 'var(--surface-border)' }}
              />
            </div>
            <div className="flex-1">
              <label htmlFor="vehicle-plate-province" className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--sub-text)' }}>จังหวัด</label>
              <select
                id="vehicle-plate-province"
                required
                value={form.plate_province_id}
                onChange={(e) => handleChange('plate_province_id', e.target.value)}
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                style={{ backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', borderColor: 'var(--surface-border)' }}
              >
                <option value="" disabled>เลือกจังหวัด</option>
                {provinces?.map((p) => (
                  <option key={p.province_id} value={p.province_id}>{p.name_th}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="vehicle-type" className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--sub-text)' }}>ประเภทรถ</label>
            <select
              id="vehicle-type"
              value={form.type_id}
              onChange={(e) => handleChange('type_id', e.target.value)}
              className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
              style={{ backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', borderColor: 'var(--surface-border)' }}
            >
              <option value="">ไม่ระบุ</option>
              {types.map((t) => (
                <option key={t.type_id} value={t.type_id}>{t.type_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="vehicle-driver" className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--sub-text)' }}>คนขับประจำ</label>
            <select
              id="vehicle-driver"
              value={form.driver_id}
              onChange={(e) => handleChange('driver_id', e.target.value)}
              className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
              style={{ backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', borderColor: 'var(--surface-border)' }}
            >
              <option value="">ไม่มีคนขับประจำ</option>
              {drivers.map((d) => (
                <option key={d.driver_id} value={d.driver_id}>{d.prefix}{d.first_name} {d.last_name}</option>
              ))}
            </select>
          </div>

          {!isEdit && (
            <div className="space-y-3 border-t pt-4" style={{ borderColor: 'var(--surface-border)' }}>
              <p className="text-xs font-medium" style={{ color: 'var(--sub-text)' }}>เอกสารรถ (กรอกได้ถ้ามีข้อมูล)</p>

              <DocumentSection
                idPrefix="act"
                title="พรบ. (ประกันภาคบังคับ)"
                state={act}
                onChange={(field, value) => handleDocChange(setAct, field, value)}
                showCompany
                amountField={{ key: 'premium_amount', label: 'เบี้ยประกัน (บาท)' }}
              />
              <DocumentSection
                idPrefix="tax"
                title="ภาษีรถยนต์"
                state={tax}
                onChange={(field, value) => handleDocChange(setTax, field, value)}
                amountField={{ key: 'fee_amount', label: 'ค่าธรรมเนียม (บาท)' }}
              />
              <DocumentSection
                idPrefix="insurance"
                title="ประกันภาคสมัครใจ"
                state={insurance}
                onChange={(field, value) => handleDocChange(setInsurance, field, value)}
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
function DocumentSection({ idPrefix, title, state, onChange, showCompany = false, amountField }) {
  return (
    <div className="rounded-xl border p-3" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-soft)' }}>
      <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--page-text)' }}>
        <input
          type="checkbox"
          checked={state.enabled}
          onChange={(e) => onChange('enabled', e.target.checked)}
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
                required
                value={state.insurance_company}
                onChange={(e) => onChange('insurance_company', e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft)"
                style={inputStyle}
              />
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex-1">
              <label htmlFor={`${idPrefix}-last-paid-date`} className="mb-1 block text-xs" style={{ color: 'var(--sub-text)' }}>วันที่ชำระล่าสุด</label>
              <input
                id={`${idPrefix}-last-paid-date`}
                required
                type="date"
                value={state.last_paid_date}
                onChange={(e) => onChange('last_paid_date', e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft)"
                style={inputStyle}
              />
            </div>
            <div className="flex-1">
              <label htmlFor={`${idPrefix}-expire-date`} className="mb-1 block text-xs" style={{ color: 'var(--sub-text)' }}>วันหมดอายุ</label>
              <input
                id={`${idPrefix}-expire-date`}
                required
                type="date"
                value={state.expire_date}
                onChange={(e) => onChange('expire_date', e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft)"
                style={inputStyle}
              />
            </div>
          </div>

          {amountField && (
            <div>
              <label htmlFor={`${idPrefix}-amount`} className="mb-1 block text-xs" style={{ color: 'var(--sub-text)' }}>{amountField.label}</label>
              <input
                id={`${idPrefix}-amount`}
                required
                type="number"
                min="0"
                step="0.01"
                value={state[amountField.key]}
                onChange={(e) => onChange(amountField.key, e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft)"
                style={inputStyle}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}