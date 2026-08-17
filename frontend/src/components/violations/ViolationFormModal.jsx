import { useState } from 'react';
import Modal from '../globals/Modal.jsx';
import InfoTooltip from '../globals/InfoTooltip.jsx';
import { useCreateViolation, useUpdateViolation } from '../../services/violations/violationsQueries.js';
import { useViolationReasons } from '../../services/lookups/lookupQueries.js';
import { useDrivers } from '../../services/drivers/driversQueries.js';
import { useVehicles } from '../../services/vehicles/vehiclesQueries.js';

const labelStyle = { color: 'var(--sub-text)' };
const inputStyle = { backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', borderColor: 'var(--surface-border)' };

// แปลง "2026-06-10 14:23:00" (จาก backend) เป็น "2026-06-10T14:23" (สำหรับ input type=datetime-local)
function toDatetimeLocalValue(value) {
    if (!value) return '';
    return value.replace(' ', 'T').slice(0, 16);
}

// violation: ส่งมาถ้าเป็นโหมดแก้ไข, ไม่ส่งมา = โหมดเพิ่มใหม่
export default function ViolationFormModal({ violation, onClose, onSaved }) {
    const isEdit = Boolean(violation);

    const reasonsQuery = useViolationReasons();
    const driversQuery = useDrivers();
    const vehiclesQuery = useVehicles();

    const reasons = reasonsQuery.data?.data ?? [];
    const drivers = driversQuery.data?.data ?? [];
    const vehicles = vehiclesQuery.data?.data ?? [];
    const loadingOptions = reasonsQuery.isLoading || driversQuery.isLoading || vehiclesQuery.isLoading;
    const optionsError = reasonsQuery.error || driversQuery.error || vehiclesQuery.error;

    const [form, setForm] = useState({
        driver_id: violation?.driver_id ?? '',
        vehicle_id: violation?.vehicle_id ?? '',
        reason_id: violation?.reason_id ?? '',
        incident_datetime: toDatetimeLocalValue(violation?.incident_datetime),
        fine: violation?.fine ?? '',
        is_paid: violation?.is_paid === 1 || violation?.is_paid === true,
    });
    const [error, setError] = useState(null);

    const createViolation = useCreateViolation();
    const updateViolation = useUpdateViolation();
    const submitting = createViolation.isPending || updateViolation.isPending;

    function handleChange(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    // เลือกคนขับแล้วเติมรถที่คนขับดูแลอยู่ให้อัตโนมัติ: มีคันเดียวก็เลือกให้เลย มีหลายคันก็ปล่อยให้เลือกเอง
    function handleDriverChange(value) {
        const driverVehicles = vehicles.filter((v) => v.driver?.driver_id === Number(value));
        setForm((prev) => ({
            ...prev,
            driver_id: value,
            vehicle_id: driverVehicles.length === 1 ? String(driverVehicles[0].vehicle_id) : '',
        }));
    }

    const driverVehicles = form.driver_id ? vehicles.filter((v) => v.driver?.driver_id === Number(form.driver_id)) : [];
    let vehicleOptions = driverVehicles.length > 0 ? driverVehicles : vehicles;
    if (form.vehicle_id && !vehicleOptions.some((v) => String(v.vehicle_id) === String(form.vehicle_id))) {
        const currentVehicle = vehicles.find((v) => String(v.vehicle_id) === String(form.vehicle_id));
        if (currentVehicle) vehicleOptions = [...vehicleOptions, currentVehicle];
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);

        try {
            const payload = {
                driver_id: Number(form.driver_id),
                vehicle_id: Number(form.vehicle_id),
                reason_id: Number(form.reason_id),
                incident_datetime: form.incident_datetime,
                fine: Number(form.fine),
                is_paid: form.is_paid,
            };

            const saved = isEdit
                ? await updateViolation.mutateAsync({ id: violation.violation_id, data: payload })
                : await createViolation.mutateAsync(payload);
            const successMessage = isEdit ? 'แก้ไขข้อมูลใบสั่งเรียบร้อย' : 'บันทึกใบสั่งเรียบร้อย';
            onSaved?.(saved, successMessage);
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <Modal title={isEdit ? 'แก้ไขใบสั่ง' : 'บันทึกใบสั่ง'} onClose={onClose}>
            {loadingOptions ? (
                <div role="status" className="flex items-center justify-center p-16" style={{ color: 'var(--sub-text)' }}>กำลังโหลดข้อมูล...</div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4 p-5">
                    <div>
                        <label htmlFor="violation-driver" className="mb-1.5 block text-xs font-medium" style={labelStyle}>คนขับ</label>
                        <select
                            id="violation-driver"
                            required
                            value={form.driver_id}
                            onChange={(e) => handleDriverChange(e.target.value)}
                            className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                            style={inputStyle}
                        >
                            <option value="" disabled>เลือกคนขับ</option>
                            {drivers.map((d) => (
                                <option key={d.driver_id} value={d.driver_id}>{d.prefix}{d.first_name} {d.last_name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="violation-vehicle" className="mb-1.5 flex items-center text-xs font-medium" style={labelStyle}>
                            รถ
                            <InfoTooltip text="เลือกคนขับก่อน ระบบจะเติมรถที่คนขับคนนั้นดูแลให้อัตโนมัติ ถ้าดูแลหลายคันจะให้เลือกเอง" />
                        </label>
                        <select
                            id="violation-vehicle"
                            required
                            value={form.vehicle_id}
                            onChange={(e) => handleChange('vehicle_id', e.target.value)}
                            className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                            style={inputStyle}
                        >
                            <option value="" disabled>เลือกรถ</option>
                            {vehicleOptions.map((v) => (
                                <option key={v.vehicle_id} value={v.vehicle_id}>{v.plate_number} · {v.plate_province}{v.brand_model ? ` (${v.brand_model})` : ''}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="violation-reason" className="mb-1.5 block text-xs font-medium" style={labelStyle}>สาเหตุ</label>
                        <select
                            id="violation-reason"
                            required
                            value={form.reason_id}
                            onChange={(e) => handleChange('reason_id', e.target.value)}
                            className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                            style={inputStyle}
                        >
                            <option value="" disabled>เลือกสาเหตุ</option>
                            {reasons.map((r) => (
                                <option key={r.reason_id} value={r.reason_id}>{r.reason_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label htmlFor="violation-datetime" className="mb-1.5 flex items-center text-xs font-medium" style={labelStyle}>
                                วันที่และเวลาที่เกิดเหตุ
                                <InfoTooltip text="วันเวลาที่เกิดการฝ่าฝืน ตามที่ระบุในใบสั่ง" />
                            </label>
                            <input
                                id="violation-datetime"
                                required
                                type="datetime-local"
                                value={form.incident_datetime}
                                onChange={(e) => handleChange('incident_datetime', e.target.value)}
                                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label htmlFor="violation-fine" className="mb-1.5 block text-xs font-medium" style={labelStyle}>ค่าปรับ (บาท)</label>
                            <input
                                id="violation-fine"
                                required
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.fine}
                                onChange={(e) => handleChange('fine', e.target.value)}
                                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--page-text)' }}>
                        <input
                            type="checkbox"
                            checked={form.is_paid}
                            onChange={(e) => handleChange('is_paid', e.target.checked)}
                        />
                        จ่ายค่าปรับแล้ว
                    </label>

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
