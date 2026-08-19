import { useState } from 'react';
import Modal from '../globals/Modal.jsx';
import InfoTooltip from '../globals/InfoTooltip.jsx';
import Select from '../globals/Select.jsx';
import DatePicker from '../globals/DatePicker.jsx';
import TimePicker from '../globals/TimePicker.jsx';
import { useCreateViolation, useUpdateViolation } from '../../services/violations/violationsQueries.js';
import { useViolationReasons, useCreateViolationReason } from '../../services/lookups/lookupQueries.js';
import { useDrivers } from '../../services/drivers/driversQueries.js';
import { useVehicles } from '../../services/vehicles/vehiclesQueries.js';

const labelStyle = { color: 'var(--sub-text)' };
const inputStyle = { backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', borderColor: 'var(--surface-border)' };
const errorInputStyle = { ...inputStyle, borderColor: 'var(--status-danger)' };

// แยก "2026-06-10 14:23:00" (จาก backend) เป็นวันที่ ("2026-06-10" ให้ DatePicker) กับเวลา ("14:23" ให้ TimePicker)
// เก็บเป็น field แยกกันในฟอร์ม ไม่รวมเป็น string เดียว เพื่อให้เลือกเวลาก่อนเลือกวันที่ได้โดยค่าไม่หาย
function splitIncidentDatetime(value) {
    if (!value) return { date: '', time: '' };
    const [date = '', time = ''] = value.replace(' ', 'T').slice(0, 16).split('T');
    return { date, time };
}

// violation: ส่งมาถ้าเป็นโหมดแก้ไข, ไม่ส่งมา = โหมดเพิ่มใหม่
export default function ViolationFormModal({ violation, onClose, onSaved }) {
    const isEdit = Boolean(violation);

    const reasonsQuery = useViolationReasons();
    const driversQuery = useDrivers();
    const vehiclesQuery = useVehicles();
    const createViolationReason = useCreateViolationReason();

    const reasons = reasonsQuery.data?.data ?? [];
    const drivers = driversQuery.data?.data ?? [];
    const vehicles = vehiclesQuery.data?.data ?? [];
    const loadingOptions = reasonsQuery.isLoading || driversQuery.isLoading || vehiclesQuery.isLoading;
    const optionsError = reasonsQuery.error || driversQuery.error || vehiclesQuery.error;

    const { date: initialIncidentDate, time: initialIncidentTime } = splitIncidentDatetime(violation?.incident_datetime);
    const [form, setForm] = useState({
        driver_id: violation?.driver_id ? String(violation.driver_id) : '',
        vehicle_id: violation?.vehicle_id ? String(violation.vehicle_id) : '',
        reason_id: violation?.reason_id ? String(violation.reason_id) : '',
        incident_date: initialIncidentDate,
        incident_time: initialIncidentTime,
        fine: violation?.fine ?? '',
        is_paid: violation?.is_paid === 1 || violation?.is_paid === true,
    });
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState(null);

    const createViolation = useCreateViolation();
    const updateViolation = useUpdateViolation();
    const submitting = createViolation.isPending || updateViolation.isPending;

    function handleChange(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
        // incident_date/incident_time ใช้ error message ร่วมกันตัวเดียว (incident_datetime) เพราะโชว์เป็นฟิลด์เดียวในสายตาผู้ใช้
        const errorKey = field === 'incident_date' || field === 'incident_time' ? 'incident_datetime' : field;
        setErrors((prev) => (prev[errorKey] ? { ...prev, [errorKey]: undefined } : prev));
    }

    // เลือกคนขับแล้วเติมรถที่คนขับดูแลอยู่ให้อัตโนมัติ: มีคันเดียวก็เลือกให้เลย มีหลายคันก็ปล่อยให้เลือกเอง
    function handleDriverChange(value) {
        const driverVehicles = vehicles.filter((v) => v.driver?.driver_id === Number(value));
        setForm((prev) => ({
            ...prev,
            driver_id: value,
            vehicle_id: driverVehicles.length === 1 ? String(driverVehicles[0].vehicle_id) : '',
        }));
        setErrors((prev) => ({ ...prev, driver_id: undefined, vehicle_id: undefined }));
    }

    // เพิ่มสาเหตุใหม่เข้ารายการได้ทันทีจาก dropdown โดยไม่ต้องออกไปหน้าตั้งค่า แล้วเลือกให้อัตโนมัติ
    async function handleCreateReason(name) {
        const result = await createViolationReason.mutateAsync(name);
        handleChange('reason_id', String(result.data.reason_id));
    }

    const driverVehicles = form.driver_id ? vehicles.filter((v) => v.driver?.driver_id === Number(form.driver_id)) : [];
    let vehicleOptions = driverVehicles.length > 0 ? driverVehicles : vehicles;
    if (form.vehicle_id && !vehicleOptions.some((v) => String(v.vehicle_id) === String(form.vehicle_id))) {
        const currentVehicle = vehicles.find((v) => String(v.vehicle_id) === String(form.vehicle_id));
        if (currentVehicle) vehicleOptions = [...vehicleOptions, currentVehicle];
    }

    function validate() {
        const nextErrors = {};
        if (!form.driver_id) nextErrors.driver_id = 'กรุณาเลือกคนขับ';
        if (!form.vehicle_id) nextErrors.vehicle_id = 'กรุณาเลือกรถ';
        if (!form.reason_id) nextErrors.reason_id = 'กรุณาเลือกสาเหตุ';
        if (!form.incident_date || !form.incident_time) nextErrors.incident_datetime = 'กรุณาระบุวันที่และเวลา';
        if (!String(form.fine).trim()) nextErrors.fine = 'กรุณากรอกค่าปรับ';
        return nextErrors;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setFormError(null);

        const nextErrors = validate();
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        try {
            const payload = {
                driver_id: Number(form.driver_id),
                vehicle_id: Number(form.vehicle_id),
                reason_id: Number(form.reason_id),
                incident_datetime: `${form.incident_date}T${form.incident_time}`,
                fine: Number(form.fine),
                is_paid: form.is_paid,
            };

            const saved = isEdit
                ? await updateViolation.mutateAsync({ id: violation.violation_id, data: payload })
                : await createViolation.mutateAsync(payload);
            const successMessage = isEdit ? 'แก้ไขข้อมูลใบสั่งเรียบร้อย' : 'บันทึกใบสั่งเรียบร้อย';
            onSaved?.(saved, successMessage);
        } catch (err) {
            setFormError(err.message);
        }
    }

    return (
        <Modal title={isEdit ? 'แก้ไขใบสั่ง' : 'บันทึกใบสั่ง'} onClose={onClose}>
            {loadingOptions ? (
                <div role="status" className="flex items-center justify-center p-16" style={{ color: 'var(--sub-text)' }}>กำลังโหลดข้อมูล...</div>
            ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-4 p-5">
                    <div>
                        <label htmlFor="violation-driver" className="mb-1.5 block text-xs font-medium" style={labelStyle}>คนขับ</label>
                        <Select
                            id="violation-driver"
                            value={form.driver_id}
                            onChange={handleDriverChange}
                            placeholder="เลือกคนขับ"
                            error={Boolean(errors.driver_id)}
                            options={drivers.map((d) => ({ value: String(d.driver_id), label: `${d.prefix}${d.first_name} ${d.last_name}` }))}
                        />
                        {errors.driver_id && <p role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{errors.driver_id}</p>}
                    </div>

                    <div>
                        <label htmlFor="violation-vehicle" className="mb-1.5 flex items-center text-xs font-medium" style={labelStyle}>
                            รถ
                            <InfoTooltip text="เลือกคนขับก่อน ระบบจะเติมรถที่คนขับคนนั้นดูแลให้อัตโนมัติ ถ้าดูแลหลายคันจะให้เลือกเอง" />
                        </label>
                        <Select
                            id="violation-vehicle"
                            value={form.vehicle_id}
                            onChange={(value) => handleChange('vehicle_id', value)}
                            placeholder="เลือกรถ"
                            error={Boolean(errors.vehicle_id)}
                            options={vehicleOptions.map((v) => ({ value: String(v.vehicle_id), label: `${v.plate_number} · ${v.plate_province}${v.brand_model ? ` (${v.brand_model})` : ''}` }))}
                        />
                        {errors.vehicle_id && <p role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{errors.vehicle_id}</p>}
                    </div>

                    <div>
                        <label htmlFor="violation-reason" className="mb-1.5 block text-xs font-medium" style={labelStyle}>สาเหตุ</label>
                        <Select
                            id="violation-reason"
                            value={form.reason_id}
                            onChange={(value) => handleChange('reason_id', value)}
                            onCreate={handleCreateReason}
                            placeholder="เลือกสาเหตุ"
                            error={Boolean(errors.reason_id)}
                            options={reasons.map((r) => ({ value: String(r.reason_id), label: r.reason_name }))}
                        />
                        {errors.reason_id && <p role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{errors.reason_id}</p>}
                    </div>

                    <div>
                        <label htmlFor="violation-date" className="mb-1.5 flex items-center text-xs font-medium" style={labelStyle}>
                            วันที่และเวลาที่เกิดเหตุ
                            <InfoTooltip text="วันเวลาที่เกิดการฝ่าฝืน ตามที่ระบุในใบสั่ง" />
                        </label>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <DatePicker
                                    id="violation-date"
                                    value={form.incident_date}
                                    onChange={(value) => handleChange('incident_date', value)}
                                    error={Boolean(errors.incident_datetime)}
                                />
                            </div>
                            <TimePicker
                                id="violation-time"
                                className="w-28"
                                value={form.incident_time}
                                onChange={(value) => handleChange('incident_time', value)}
                                error={Boolean(errors.incident_datetime)}
                            />
                        </div>
                        {errors.incident_datetime && <p role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{errors.incident_datetime}</p>}
                    </div>

                    <div>
                        <label htmlFor="violation-fine" className="mb-1.5 block text-xs font-medium" style={labelStyle}>ค่าปรับ (บาท)</label>
                        <input
                            id="violation-fine"
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.fine}
                            onChange={(e) => handleChange('fine', e.target.value)}
                            className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                            style={errors.fine ? errorInputStyle : inputStyle}
                        />
                        {errors.fine && <p role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{errors.fine}</p>}
                    </div>

                    <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--page-text)' }}>
                        <input
                            type="checkbox"
                            checked={form.is_paid}
                            onChange={(e) => handleChange('is_paid', e.target.checked)}
                            style={{ accentColor: 'var(--primary-color)' }}
                        />
                        จ่ายค่าปรับแล้ว
                    </label>

                    {(formError || optionsError) && (
                        <p role="alert" className="text-sm" style={{ color: 'var(--status-danger)' }}>{formError || optionsError.message}</p>
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
