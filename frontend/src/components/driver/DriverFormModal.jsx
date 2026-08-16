import { useState } from 'react';
import Modal from '../../components/globals/Modal';
import { useCreateDriver, useUpdateDriver } from '../../services/drivers/driversQueries.js';

const PREFIX_OPTIONS = ['นาย', 'นาง', 'นางสาว'];

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
    const [error, setError] = useState(null);

    const createDriver = useCreateDriver();
    const updateDriver = useUpdateDriver();
    const submitting = createDriver.isPending || updateDriver.isPending;

    function handleChange(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);

        try {
            const payload = { ...form, hire_date: form.hire_date || null };
            const saved = isEdit
                ? await updateDriver.mutateAsync({ id: driver.driver_id, data: payload })
                : await createDriver.mutateAsync(payload);
            const successMessage = isEdit ? 'แก้ไขข้อมูลคนขับเรียบร้อย' : 'เพิ่มคนขับเรียบร้อย';
            onSaved?.(saved, successMessage);
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <Modal title={isEdit ? 'แก้ไขข้อมูลคนขับ' : 'เพิ่มคนขับ'} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4 p-5">
                <div className="flex gap-3">
                    <div className="w-28">
                        <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--sub-text)' }}>คำนำหน้า</label>
                        <select
                            value={form.prefix}
                            onChange={(e) => handleChange('prefix', e.target.value)}
                            className="w-full rounded-xl border px-3 py-2 text-sm outline-none transition-all"
                            style={{ backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', borderColor: 'var(--surface-border)' }}
                        >
                            {PREFIX_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--sub-text)' }}>ชื่อ</label>
                        <input
                            required
                            value={form.first_name}
                            onChange={(e) => handleChange('first_name', e.target.value)}
                            className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all"
                            style={{ backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', borderColor: 'var(--surface-border)' }}
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--sub-text)' }}>นามสกุล</label>
                    <input
                        required
                        value={form.last_name}
                        onChange={(e) => handleChange('last_name', e.target.value)}
                        className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all"
                        style={{ backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', borderColor: 'var(--surface-border)' }}
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--sub-text)' }}>เบอร์โทร</label>
                    <input
                        required
                        pattern="[0-9]{10}"
                        title="เบอร์โทรต้องเป็นตัวเลข 10 หลัก"
                        value={form.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all"
                        style={{ backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', borderColor: 'var(--surface-border)' }}
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--sub-text)' }}>วันที่เริ่มงาน</label>
                    <input
                        type="date"
                        value={form.hire_date}
                        onChange={(e) => handleChange('hire_date', e.target.value)}
                        className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all"
                        style={{ backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', borderColor: 'var(--surface-border)' }}
                    />
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
        </Modal>
    );
}