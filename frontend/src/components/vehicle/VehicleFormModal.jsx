import { useEffect, useState } from 'react';
import Modal from '../globals/Modal';
import { createVehicle, updateVehicle } from '../../services/vehicles/vehiclesAPI.js';
import { getProvinces, getVehicleTypes } from '../../services/lookups/lookupApi.js';
import { getDrivers } from '../../services/drivers/driversApi.js';
import { useAuth } from '../../context/auth/useAuth.js';

// vehicle: ส่งมาถ้าเป็นโหมดแก้ไข, ไม่ส่งมา = โหมดเพิ่มใหม่
export default function VehicleFormModal({ vehicle, onClose, onSaved }) {
  const isEdit = Boolean(vehicle);

  const [provinces, setProvinces] = useState([]);
  const [types, setTypes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [form, setForm] = useState({
    brand_model: vehicle?.brand_model ?? '',
    plate_number: vehicle?.plate_number ?? '',
    plate_province_id: vehicle?.plate_province_id ?? '',
    type_id: vehicle?.type?.type_id ?? '',
    driver_id: vehicle?.driver?.driver_id ?? '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const {user} = useAuth();

  // โหลดข้อมูล dropdown ทั้งหมดพร้อมกันตอนเปิดฟอร์ม
  useEffect(() => {
    let cancelled = false;
    if (!user?.token) {
      setLoadingOptions(false);
      return () => { cancelled = true; };
    }

    Promise.all([getProvinces(), getVehicleTypes(), getDrivers(user.token)])
      .then(([provinceData, typeData, driverData]) => {
        if (cancelled) return;
        setProvinces(provinceData.data || provinceData);
        setTypes(typeData.data || typeData);
        setDrivers(driverData.data || driverData);
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoadingOptions(false); });

    return () => { cancelled = true; };
  }, [user?.token]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        brand_model: form.brand_model || null,
        plate_number: form.plate_number,
        plate_province_id: Number(form.plate_province_id),
        type_id: form.type_id ? Number(form.type_id) : null,
        driver_id: form.driver_id ? Number(form.driver_id) : null,
      };
      const saved = isEdit
        ? await updateVehicle(user?.token, vehicle.vehicle_id, payload)
        : await createVehicle(user?.token, payload);
      const successMessage = isEdit ? 'แก้ไขข้อมูลรถเรียบร้อย' : 'เพิ่มรถเรียบร้อย';
      onSaved?.(saved, successMessage);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={isEdit ? 'แก้ไขข้อมูลรถ' : 'เพิ่มรถ'} onClose={onClose}>
      {loadingOptions ? (
        <div className="flex items-center justify-center p-16" style={{ color: 'var(--sub-text)' }}>กำลังโหลดข้อมูล...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--sub-text)' }}>รุ่นรถ</label>
            <input
              value={form.brand_model}
              onChange={(e) => handleChange('brand_model', e.target.value)}
              placeholder="เช่น Toyota Hilux Revo 2022"
              className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all"
              style={{ backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', borderColor: 'var(--surface-border)' }}
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--sub-text)' }}>ทะเบียน</label>
              <input
                required
                value={form.plate_number}
                onChange={(e) => handleChange('plate_number', e.target.value)}
                placeholder="เช่น 1กข1234"
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all"
                style={{ backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', borderColor: 'var(--surface-border)' }}
              />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--sub-text)' }}>จังหวัด</label>
              <select
                required
                value={form.plate_province_id}
                onChange={(e) => handleChange('plate_province_id', e.target.value)}
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all"
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
            <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--sub-text)' }}>ประเภทรถ</label>
            <select
              value={form.type_id}
              onChange={(e) => handleChange('type_id', e.target.value)}
              className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all"
              style={{ backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', borderColor: 'var(--surface-border)' }}
            >
              <option value="">ไม่ระบุ</option>
              {types.map((t) => (
                <option key={t.type_id} value={t.type_id}>{t.type_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--sub-text)' }}>คนขับประจำ</label>
            <select
              value={form.driver_id}
              onChange={(e) => handleChange('driver_id', e.target.value)}
              className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all"
              style={{ backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', borderColor: 'var(--surface-border)' }}
            >
              <option value="">ไม่มีคนขับประจำ</option>
              {drivers.map((d) => (
                <option key={d.driver_id} value={d.driver_id}>{d.prefix}{d.first_name} {d.last_name}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm" style={{ color: 'var(--status-danger)' }}>{error}</p>}

          <div className="flex gap-2 border-t pt-4" style={{ borderColor: 'var(--surface-border)' }}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors"
              style={{ backgroundColor: 'var(--surface-soft)', borderColor: 'var(--surface-border)', color: 'var(--page-text)' }}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl py-2.5 text-sm font-medium disabled:opacity-50"
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