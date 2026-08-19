import { useState } from 'react';
import Modal from '../globals/Modal.jsx';
import { useResetUserPassword } from '../../services/users/usersQueries.js';

const labelStyle = { color: 'var(--sub-text)' };
const inputStyle = { backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', borderColor: 'var(--surface-border)' };
const errorInputStyle = { ...inputStyle, borderColor: 'var(--status-danger)' };

export default function ResetPasswordModal({ targetUser, onClose, onSaved }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [formError, setFormError] = useState(null);

    const resetPassword = useResetUserPassword();

    function handleChange(value) {
        setPassword(value);
        if (error) setError('');
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setFormError(null);

        if (password.length < 8) {
            setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
            return;
        }

        try {
            await resetPassword.mutateAsync({ id: targetUser.user_id, newPassword: password });
            onSaved?.(`รีเซ็ตรหัสผ่านของ "${targetUser.username}" เรียบร้อย`);
        } catch (err) {
            setFormError(err.message);
        }
    }

    return (
        <Modal title={`รีเซ็ตรหัสผ่าน "${targetUser.username}"`} onClose={onClose} maxWidth="max-w-md">
            <form onSubmit={handleSubmit} noValidate className="space-y-4 p-5">
                <p className="text-sm" style={{ color: 'var(--sub-text)' }}>
                    ตั้งรหัสผ่านใหม่ให้ผู้ใช้งานคนนี้ แล้วแจ้งรหัสผ่านนี้ให้เขาทราบเอง
                </p>

                <div>
                    <label htmlFor="reset-password" className="mb-1.5 block text-xs font-medium" style={labelStyle}>รหัสผ่านใหม่</label>
                    <input
                        id="reset-password"
                        type="text"
                        autoComplete="off"
                        value={password}
                        onChange={(e) => handleChange(e.target.value)}
                        className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                        style={error ? errorInputStyle : inputStyle}
                    />
                    {error && <p role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{error}</p>}
                </div>

                {formError && (
                    <p role="alert" className="text-sm" style={{ color: 'var(--status-danger)' }}>{formError}</p>
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
                        disabled={resetPassword.isPending}
                        className="flex-1 cursor-pointer rounded-xl py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ backgroundColor: 'var(--primary-color)', color: 'var(--on-primary)' }}
                    >
                        {resetPassword.isPending ? 'กำลังบันทึก...' : 'รีเซ็ตรหัสผ่าน'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
