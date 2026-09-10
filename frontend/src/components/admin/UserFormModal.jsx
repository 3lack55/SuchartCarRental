import { useState } from 'react';
import Modal from '../globals/Modal.jsx';
import Select from '../globals/Select.jsx';
import { useCreateUser } from '../../services/users/usersQueries.js';

const labelStyle = { color: 'var(--sub-text)' };
const inputStyle = { backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', borderColor: 'var(--surface-border)' };
const errorInputStyle = { ...inputStyle, borderColor: 'var(--status-danger)' };

// ดอกจันแดงต่อท้ายลาเบลของฟิลด์ที่บังคับกรอก
function Required() {
    return <span aria-hidden="true" style={{ color: 'var(--status-danger)' }}> *</span>;
}

const ROLE_OPTIONS = [
    { value: 'staff', label: 'พนักงาน (Staff)' },
    { value: 'manager', label: 'ผู้จัดการ (Manager)' },
    { value: 'admin', label: 'ผู้ดูแลระบบ (Admin)' },
];

export default function UserFormModal({ onClose, onSaved }) {
    const [form, setForm] = useState({ username: '', password: '', role: 'staff' });
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState(null);

    const createUser = useCreateUser();

    function handleChange(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    }

    function validate() {
        const nextErrors = {};
        if (!form.username.trim()) {
            nextErrors.username = 'กรุณากรอก username';
        } else if (form.username.trim().length < 3) {
            nextErrors.username = 'username ต้องมีอย่างน้อย 3 ตัวอักษร';
        }
        if (!form.password) {
            nextErrors.password = 'กรุณากรอกรหัสผ่าน';
        } else if (form.password.length < 8) {
            nextErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
        }
        return nextErrors;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setFormError(null);

        const nextErrors = validate();
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        try {
            const saved = await createUser.mutateAsync({
                username: form.username.trim(),
                password: form.password,
                role: form.role,
            });
            onSaved?.(saved, 'เพิ่มผู้ใช้งานเรียบร้อย');
        } catch (err) {
            setFormError(err.message);
        }
    }

    return (
        <Modal title="เพิ่มผู้ใช้งาน" onClose={onClose}>
            <form onSubmit={handleSubmit} noValidate className="space-y-5 p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <label htmlFor="user-username" className="mb-1.5 block text-xs font-medium" style={labelStyle}>Username<Required /></label>
                        <input
                            id="user-username"
                            type="text"
                            autoComplete="off"
                            value={form.username}
                            onChange={(e) => handleChange('username', e.target.value)}
                            placeholder="เช่น john.doe"
                            className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                            style={errors.username ? errorInputStyle : inputStyle}
                        />
                        {errors.username && <p role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{errors.username}</p>}
                    </div>

                    <div>
                        <label htmlFor="user-role" className="mb-1.5 block text-xs font-medium" style={labelStyle}>สิทธิ์การใช้งาน<Required /></label>
                        <Select
                            id="user-role"
                            value={form.role}
                            onChange={(value) => handleChange('role', value)}
                            options={ROLE_OPTIONS}
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="user-password" className="mb-1.5 block text-xs font-medium" style={labelStyle}>รหัสผ่านเริ่มต้น<Required /></label>
                    <input
                        id="user-password"
                        type="password"
                        autoComplete="new-password"
                        value={form.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        placeholder="อย่างน้อย 8 ตัวอักษร"
                        className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                        style={errors.password ? errorInputStyle : inputStyle}
                    />
                    {errors.password && <p role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{errors.password}</p>}
                </div>

                {formError && (
                    <p role="alert" className="text-sm" style={{ color: 'var(--status-danger)' }}>{formError}</p>
                )}

                <div className="sticky bottom-0 -mx-5 -mb-5 flex gap-2 border-t px-5 py-4" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface)' }}>
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
                        disabled={createUser.isPending}
                        className="flex-1 cursor-pointer rounded-xl py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ backgroundColor: 'var(--primary-color)', color: 'var(--on-primary)' }}
                    >
                        {createUser.isPending ? 'กำลังบันทึก...' : 'เพิ่มผู้ใช้งาน'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
