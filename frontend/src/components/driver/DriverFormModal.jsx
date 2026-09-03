import { useEffect, useState } from 'react';
import Modal from '../../components/globals/Modal';
import InfoTooltip from '../../components/globals/InfoTooltip.jsx';
import Select from '../../components/globals/Select.jsx';
import DatePicker from '../../components/globals/DatePicker.jsx';
import { useCreateDriver, useUpdateDriver, useDriver, useRestoreDriver } from '../../services/drivers/driversQueries.js';
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

function buildFormState(driver) {
    return {
        prefix: driver?.prefix ?? PREFIX_OPTIONS[0],
        first_name: driver?.first_name ?? '',
        last_name: driver?.last_name ?? '',
        phone: driver?.phone ?? '',
        hire_date: driver?.hire_date ? driver.hire_date.slice(0, 10) : '',
    };
}

// driver: ส่งมาถ้าเป็นโหมดแก้ไข, ไม่ส่งมา (undefined) = โหมดเพิ่มใหม่
export default function DriverFormModal({ driver, onClose, onSaved }) {
    // แยกเป็น state ของตัวเอง (ไม่ใช้ prop ตรงๆ) เพราะถ้าเจอข้อมูลเดิมที่ถูกลบไปแล้ว (conflict) แล้วผู้ใช้กด
    // "ดูและแก้ไขข้อมูล" ฟอร์มนี้ต้องสลับไปเป็นโหมดแก้ไขของคนขับคนนั้นได้เอง (พร้อมข้อมูลเดิมที่ดึงมา)
    const [editingDriver, setEditingDriver] = useState(driver ?? null);
    const isEdit = Boolean(editingDriver);
    // true เมื่อกำลังแก้ไขคนขับที่ยัง "พ้นสภาพ" (soft-deleted) อยู่ — ต้องกู้คืนด้วยถึงจะใช้งานได้จริง
    const isRestoringEdit = isEdit && Boolean(editingDriver.deleted);

    const [form, setForm] = useState(() => buildFormState(editingDriver));
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState(null);
    const [conflictDriverId, setConflictDriverId] = useState(null); // driver_id ของข้อมูลเดิมที่ถูกลบไปแล้ว ถ้าเจอ (โชว์ modal แจ้งก่อน)
    const [viewingConflict, setViewingConflict] = useState(false); // true หลังกด "ดูและแก้ไขข้อมูล" ในตอนที่ยังโหลดข้อมูลเดิมอยู่

    const createDriver = useCreateDriver();
    const updateDriver = useUpdateDriver();
    const restoreDriver = useRestoreDriver();
    const conflictQuery = useDriver(conflictDriverId);
    const submitting = createDriver.isPending || updateDriver.isPending || restoreDriver.isPending;

    // พอโหลดข้อมูลคนขับที่ถูกลบไปแล้วเสร็จ (หลังกด "ดูและแก้ไขข้อมูล") ให้สลับฟอร์มไปโหมดแก้ไขด้วยข้อมูลนั้นทันที
    useEffect(() => {
        if (viewingConflict && conflictQuery.data?.data) {
            const fullDriver = conflictQuery.data.data;
            setEditingDriver(fullDriver);
            setForm(buildFormState(fullDriver));
            setErrors({});
            setFormError(null);
            setConflictDriverId(null);
            setViewingConflict(false);
        }
    }, [viewingConflict, conflictQuery.data]);

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
            let saved;
            if (isEdit) {
                // แก้ไขข้อมูลคนขับที่ยังพ้นสภาพอยู่ = กู้คืนให้กลับมาใช้งานได้พร้อมกันไปเลย ไม่ต้องกดกู้คืนแยก
                if (isRestoringEdit) await restoreDriver.mutateAsync(editingDriver.driver_id);
                saved = await updateDriver.mutateAsync({ id: editingDriver.driver_id, data: payload });
            } else {
                saved = await createDriver.mutateAsync(payload);
            }
            const successMessage = isEdit ? 'แก้ไขข้อมูลคนขับเรียบร้อย' : 'เพิ่มคนขับเรียบร้อย';
            onSaved?.(saved, successMessage);
        } catch (err) {
            if (err.data?.conflict === 'soft-deleted' && err.data.entity === 'driver') {
                setConflictDriverId(err.data.id);
                return;
            }
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
                        {submitting ? 'กำลังบันทึก...' : isRestoringEdit ? 'บันทึกและกู้คืน' : 'บันทึก'}
                    </button>
                </div>
            </form>

            {conflictDriverId && !viewingConflict && (
                <div
                    className="fixed inset-0 z-60 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)' }}
                    onClick={(e) => { if (e.target === e.currentTarget) setConflictDriverId(null); }}
                >
                    <div
                        role="alertdialog"
                        aria-modal="true"
                        className="w-full max-w-sm rounded-2xl border p-5 shadow-xl"
                        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)', boxShadow: '0 20px 40px rgba(15, 23, 42, 0.18)' }}
                    >
                        <p className="font-semibold" style={{ color: 'var(--page-text)' }}>พบข้อมูลที่เคยถูกลบ</p>
                        <p className="mt-1.5 text-sm" style={{ color: 'var(--sub-text)' }}>
                            เคยมีข้อมูลคนขับที่ตรงกับเบอร์โทร หรือ ชื่อ-นามสกุลนี้อยู่ในระบบแล้ว แต่ถูกลบไปก่อนหน้านี้ ต้องการดูและแก้ไขข้อมูลเดิมหรือไม่?
                        </p>
                        <div className="mt-5 flex gap-2">
                            <button
                                type="button"
                                onClick={() => setConflictDriverId(null)}
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
