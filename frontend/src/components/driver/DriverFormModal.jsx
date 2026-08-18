import { useState } from 'react';
import Modal from '../../components/globals/Modal';
import InfoTooltip from '../../components/globals/InfoTooltip.jsx';
import Select from '../../components/globals/Select.jsx';
import DatePicker from '../../components/globals/DatePicker.jsx';
import { useCreateDriver, useUpdateDriver } from '../../services/drivers/driversQueries.js';
import { formatPhone } from '../../utils/phone.js';

const PREFIX_OPTIONS = ['นาย', 'นาง', 'นางสาว'];

const FIELD_ERROR_ID = {
    first_name: 'driver-first-name-error',
    last_name: 'driver-last-name-error',
    phone: 'driver-phone-error',
};

function validate(form) {
    const errors = {};
    if (!form.first_name.trim()) errors.first_name = 'กรุณากรอกชื่อ';
    if (!form.last_name.trim()) errors.last_name = 'กรุณากรอกนามสกุล';
    if (form.phone.length !== 10) errors.phone = 'เบอร์โทรต้องเป็นตัวเลข 10 หลัก';
    return errors;
}

// เดารู้ field จากข้อความ error ที่ backend ส่งมา (ซ้ำเบอร์โทร / ซ้ำชื่อ-นามสกุล) เพื่อโชว์ใต้ช่องนั้นแทนข้อความรวมท้ายฟอร์ม
function fieldFromServerMessage(message) {
    if (!message) return null;
    if (message.includes('เบอร์โทร')) return 'phone';
    if (message.includes('ชื่อ-นามสกุล')) return 'last_name';
    return null;
}

// driver: ส่งมาถ้าเป็นโหมดแก้ไข, ไม่ส่งมา (undefined) = โหมดเพิ่มใหม่
export default function DriverFormModal({ driver, onClose, onSaved }) {
    const isEdit = Boolean(driver);

    const [form, setForm] = useState({
        prefix: driver?.prefix ?? PREFIX_OPTIONS[0],
        first_name: driver?.first_name ?? '',
        last_name: driver?.last_name ?? '',
        phone: driver?.phone ?? '',
        hire_date: driver?.hire_date ? driver.hire_date.slice(0, 10) : '',
    });
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState(null);

    const createDriver = useCreateDriver();
    const updateDriver = useUpdateDriver();
    const submitting = createDriver.isPending || updateDriver.isPending;

    function handleChange(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    }

    function handlePhoneChange(value) {
        const digits = value.replace(/\D/g, '').slice(0, 10);
        handleChange('phone', digits);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setFormError(null);

        const nextErrors = validate(form);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        try {
            const payload = { ...form, hire_date: form.hire_date || null };
            const saved = isEdit
                ? await updateDriver.mutateAsync({ id: driver.driver_id, data: payload })
                : await createDriver.mutateAsync(payload);
            const successMessage = isEdit ? 'แก้ไขข้อมูลคนขับเรียบร้อย' : 'เพิ่มคนขับเรียบร้อย';
            onSaved?.(saved, successMessage);
        } catch (err) {
            const field = fieldFromServerMessage(err.message);
            if (field) {
                setErrors((prev) => ({ ...prev, [field]: err.message }));
            } else {
                setFormError(err.message);
            }
        }
    }

    return (
        <Modal title={isEdit ? 'แก้ไขข้อมูลคนขับ' : 'เพิ่มคนขับ'} onClose={onClose} maxWidth="max-w-xl">
            <form onSubmit={handleSubmit} noValidate className="space-y-4 p-5">
                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="sm:w-28">
                        <label htmlFor="driver-prefix" className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--sub-text)' }}>คำนำหน้า</label>
                        <Select
                            id="driver-prefix"
                            value={form.prefix}
                            onChange={(value) => handleChange('prefix', value)}
                            options={PREFIX_OPTIONS}
                        />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="driver-first-name" className="mb-1.5 flex items-center text-xs font-medium" style={{ color: 'var(--sub-text)' }}>
                            ชื่อ
                            <InfoTooltip text="ชื่อ-นามสกุลต้องไม่ซ้ำกับคนขับคนอื่นในระบบ" />
                        </label>
                        <input
                            id="driver-first-name"
                            aria-invalid={Boolean(errors.first_name)}
                            aria-describedby={errors.first_name ? FIELD_ERROR_ID.first_name : undefined}
                            value={form.first_name}
                            onChange={(e) => handleChange('first_name', e.target.value)}
                            className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                            style={{ backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', borderColor: errors.first_name ? 'var(--status-danger)' : 'var(--surface-border)' }}
                        />
                        {errors.first_name && <p id={FIELD_ERROR_ID.first_name} role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{errors.first_name}</p>}
                    </div>
                    <div className="flex-1">
                        <label htmlFor="driver-last-name" className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--sub-text)' }}>นามสกุล</label>
                        <input
                            id="driver-last-name"
                            aria-invalid={Boolean(errors.last_name)}
                            aria-describedby={errors.last_name ? FIELD_ERROR_ID.last_name : undefined}
                            value={form.last_name}
                            onChange={(e) => handleChange('last_name', e.target.value)}
                            className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                            style={{ backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', borderColor: errors.last_name ? 'var(--status-danger)' : 'var(--surface-border)' }}
                        />
                        {errors.last_name && <p id={FIELD_ERROR_ID.last_name} role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{errors.last_name}</p>}
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="flex-1">
                        <label htmlFor="driver-phone" className="mb-1.5 flex items-center text-xs font-medium" style={{ color: 'var(--sub-text)' }}>
                            เบอร์โทร
                            <InfoTooltip text="ตัวเลข 10 หลัก และต้องไม่ซ้ำกับคนขับคนอื่นในระบบ" />
                        </label>
                        <input
                            id="driver-phone"
                            inputMode="numeric"
                            placeholder="081-234-5678"
                            aria-invalid={Boolean(errors.phone)}
                            aria-describedby={errors.phone ? FIELD_ERROR_ID.phone : undefined}
                            value={formatPhone(form.phone)}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                            style={{ backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', borderColor: errors.phone ? 'var(--status-danger)' : 'var(--surface-border)' }}
                        />
                        {errors.phone && <p id={FIELD_ERROR_ID.phone} role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{errors.phone}</p>}
                    </div>
                    <div className="flex-1">
                        <label htmlFor="driver-hire-date" className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--sub-text)' }}>วันที่เริ่มงาน</label>
                        <DatePicker
                            id="driver-hire-date"
                            value={form.hire_date}
                            onChange={(value) => handleChange('hire_date', value)}
                        />
                    </div>
                </div>

                {formError && <p role="alert" className="text-sm" style={{ color: 'var(--status-danger)' }}>{formError}</p>}

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
        </Modal>
    );
}
