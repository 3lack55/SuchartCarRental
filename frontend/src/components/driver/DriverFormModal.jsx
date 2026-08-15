import { useState } from 'react';
import Modal from '../../components/globals/Modal';
import { createDriver, updateDriver } from '../../services/drivers/driversApi';
import { useAuth } from '../../context/auth/useAuth';

const PREFIX_OPTIONS = ['นาย', 'นาง', 'นางสาว'];

// driver: ส่งมาถ้าเป็นโหมดแก้ไข, ไม่ส่งมา (undefined) = โหมดเพิ่มใหม่
export default function DriverFormModal({ driver, onClose, onSaved }) {
    const isEdit = Boolean(driver);
    const { user } = useAuth();

    const [form, setForm] = useState({
        prefix: driver?.prefix ?? PREFIX_OPTIONS[0],
        first_name: driver?.first_name ?? '',
        last_name: driver?.last_name ?? '',
        phone: driver?.phone ?? '',
        hire_date: driver?.hire_date ? driver.hire_date.slice(0, 10) : '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    function handleChange(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const payload = { ...form, hire_date: form.hire_date || null };
            const saved = isEdit
                ? await updateDriver(user?.token, driver.driver_id, payload)
                : await createDriver(user?.token, payload);
            const successMessage = isEdit ? 'แก้ไขข้อมูลคนขับเรียบร้อย' : 'เพิ่มคนขับเรียบร้อย';
            onSaved?.(saved, successMessage);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Modal title={isEdit ? 'แก้ไขข้อมูลคนขับ' : 'เพิ่มคนขับ'} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4 p-5">
                <div className="flex gap-3">
                    <div className="w-28">
                        <label className="mb-1 block text-xs font-medium text-stone-500">คำนำหน้า</label>
                        <select
                            value={form.prefix}
                            onChange={(e) => handleChange('prefix', e.target.value)}
                            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                        >
                            {PREFIX_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="mb-1 block text-xs font-medium text-stone-500">ชื่อ</label>
                        <input
                            required
                            value={form.first_name}
                            onChange={(e) => handleChange('first_name', e.target.value)}
                            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-1 block text-xs font-medium text-stone-500">นามสกุล</label>
                    <input
                        required
                        value={form.last_name}
                        onChange={(e) => handleChange('last_name', e.target.value)}
                        className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-medium text-stone-500">เบอร์โทร</label>
                    <input
                        required
                        pattern="[0-9]{10}"
                        title="เบอร์โทรต้องเป็นตัวเลข 10 หลัก"
                        value={form.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-medium text-stone-500">วันที่เริ่มงาน</label>
                    <input
                        type="date"
                        value={form.hire_date}
                        onChange={(e) => handleChange('hire_date', e.target.value)}
                        className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                    />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="flex gap-2 border-t border-stone-100 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-lg border border-stone-200 py-2 text-sm text-stone-600 hover:bg-stone-50"
                    >
                        ยกเลิก
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                        {submitting ? 'กำลังบันทึก...' : 'บันทึก'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}