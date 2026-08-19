import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import Modal from '../../components/globals/Modal.jsx';
import ConfirmDialog from '../../components/globals/ConfirmDialog.jsx';
import Select from '../../components/globals/Select.jsx';
import Pagination from '../../components/globals/Pagination.jsx';
import UserFormModal from '../../components/admin/UserFormModal.jsx';
import ResetPasswordModal from '../../components/admin/ResetPasswordModal.jsx';
import { useUsers, useUpdateUserRole, useUpdateUserStatus } from '../../services/users/usersQueries.js';
import { usePagination } from '../../hooks/usePagination.js';
import { useAuth } from '../../context/auth/useAuth';

const ROLE_OPTIONS = [
    { value: 'staff', label: 'พนักงาน (Staff)' },
    { value: 'manager', label: 'ผู้จัดการ (Manager)' },
    { value: 'admin', label: 'ผู้ดูแลระบบ (Admin)' },
];

function formatDateTime(value) {
    if (!value) return '-';
    return new Date(value).toLocaleString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminUsersPage() {
    const { user: currentUser } = useAuth();
    const { data, isLoading, error } = useUsers();
    const users = data?.data ?? [];
    const { page, setPage, totalPages, pageItems: pagedUsers } = usePagination(users);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [statusTarget, setStatusTarget] = useState(null); // user แถวที่กำลังจะเปิด/ปิดใช้งาน
    const [resetTarget, setResetTarget] = useState(null); // user แถวที่กำลังจะรีเซ็ตรหัสผ่าน
    const [rowError, setRowError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const updateRole = useUpdateUserRole();
    const updateStatus = useUpdateUserStatus();

    async function handleRoleChange(targetUser, role) {
        setRowError('');
        try {
            await updateRole.mutateAsync({ id: targetUser.user_id, role });
        } catch (err) {
            setRowError(err.message);
        }
    }

    async function handleConfirmStatusChange() {
        if (!statusTarget) return;
        setRowError('');
        try {
            await updateStatus.mutateAsync({ id: statusTarget.user_id, is_active: !statusTarget.is_active });
            setStatusTarget(null);
        } catch (err) {
            setRowError(err.message);
            setStatusTarget(null);
        }
    }

    function handleCreated(_, message) {
        setShowCreateModal(false);
        setSuccessMessage(message || 'เพิ่มผู้ใช้งานเรียบร้อย');
    }

    function handleResetSaved(message) {
        setResetTarget(null);
        setSuccessMessage(message);
    }

    return (
        <div className="mx-auto max-w-5xl space-y-4">
            <header className="flex flex-col gap-4 rounded-2xl border p-5 shadow-sm md:flex-row md:items-center md:justify-between" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em]" style={{ color: 'var(--sub-text)' }}>Access Control</p>
                    <h1 className="mt-1 text-2xl font-semibold" style={{ color: 'var(--page-text)' }}>จัดการผู้ใช้งาน</h1>
                    <p className="mt-1 text-sm" style={{ color: 'var(--sub-text)' }}>เพิ่มผู้ใช้งานใหม่ กำหนดสิทธิ์ และเปิด/ปิดการใช้งานบัญชี</p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="cursor-pointer whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all hover:opacity-95"
                    style={{ backgroundColor: 'var(--primary-color)', color: 'var(--on-primary)', boxShadow: '0 8px 18px rgba(15, 23, 42, 0.08)' }}
                >
                    + เพิ่มผู้ใช้งาน
                </button>
            </header>

            {(error || rowError) && (
                <p role="alert" className="text-sm" style={{ color: 'var(--status-danger)' }}>{rowError || error.message}</p>
            )}

            <div className="overflow-x-auto rounded-2xl border shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                <table className="w-full min-w-160 text-sm" style={{ color: 'var(--page-text)' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'var(--surface-soft)', borderBottom: '1px solid var(--surface-border)' }}>
                            <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>Username</th>
                            <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>สิทธิ์การใช้งาน</th>
                            <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>เข้าสู่ระบบล่าสุด</th>
                            <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>สถานะ</th>
                            <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && (
                            <tr>
                                <td colSpan={5} role="status" className="px-4 py-10 text-center" style={{ color: 'var(--sub-text)', opacity: 0.75 }}>กำลังโหลด...</td>
                            </tr>
                        )}

                        {!isLoading && users.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-10 text-center" style={{ color: 'var(--sub-text)', opacity: 0.75 }}>ยังไม่มีผู้ใช้งานในระบบ</td>
                            </tr>
                        )}

                        {!isLoading && pagedUsers.map((u) => {
                            const isSelf = String(u.user_id) === String(currentUser?.user_id);
                            return (
                                <tr key={u.user_id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--page-text)' }}>
                                        {u.username}
                                        {isSelf && <span className="ml-2 text-xs" style={{ color: 'var(--sub-text)' }}>(คุณ)</span>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Select
                                            id={`role-${u.user_id}`}
                                            ariaLabel={`สิทธิ์การใช้งานของ ${u.username}`}
                                            value={u.role}
                                            onChange={(role) => handleRoleChange(u, role)}
                                            options={ROLE_OPTIONS}
                                            disabled={isSelf || updateRole.isPending}
                                            className="max-w-48"
                                        />
                                    </td>
                                    <td className="px-4 py-3" style={{ color: 'var(--sub-text)' }}>{formatDateTime(u.last_login)}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                                            style={
                                                u.is_active
                                                    ? { backgroundColor: 'var(--status-success-soft)', color: 'var(--status-success)' }
                                                    : { backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', opacity: 0.75 }
                                            }
                                        >
                                            {u.is_active ? 'ใช้งานอยู่' : 'ถูกระงับ'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setResetTarget(u)}
                                                aria-label={`รีเซ็ตรหัสผ่านของ ${u.username}`}
                                                title="รีเซ็ตรหัสผ่าน"
                                                className="flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
                                                style={{ backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', border: '1px solid var(--surface-border)' }}
                                            >
                                                <KeyRound size={13} />
                                                รีเซ็ตรหัสผ่าน
                                            </button>
                                            <button
                                                type="button"
                                                disabled={isSelf}
                                                onClick={() => setStatusTarget(u)}
                                                className="w-25 cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                                                style={
                                                    u.is_active
                                                        ? { backgroundColor: 'var(--status-danger-soft)', color: 'var(--status-danger)' }
                                                        : { backgroundColor: 'var(--status-success-soft)', color: 'var(--status-success)' }
                                                }
                                            >
                                                {u.is_active ? 'ระงับการใช้งาน' : 'เปิดใช้งาน'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

            {showCreateModal && (
                <UserFormModal onClose={() => setShowCreateModal(false)} onSaved={handleCreated} />
            )}

            {resetTarget && (
                <ResetPasswordModal
                    targetUser={resetTarget}
                    onClose={() => setResetTarget(null)}
                    onSaved={handleResetSaved}
                />
            )}

            {statusTarget && (
                <ConfirmDialog
                    title={statusTarget.is_active ? 'ระงับการใช้งานผู้ใช้งาน' : 'เปิดใช้งานผู้ใช้งาน'}
                    message={
                        statusTarget.is_active
                            ? `ยืนยันการระงับการใช้งานบัญชี "${statusTarget.username}"? ผู้ใช้งานนี้จะไม่สามารถเข้าสู่ระบบได้จนกว่าจะเปิดใช้งานอีกครั้ง`
                            : `ยืนยันการเปิดใช้งานบัญชี "${statusTarget.username}"?`
                    }
                    confirmLabel={statusTarget.is_active ? 'ระงับการใช้งาน' : 'เปิดใช้งาน'}
                    loadingLabel={statusTarget.is_active ? 'กำลังระงับ...' : 'กำลังเปิดใช้งาน...'}
                    loading={updateStatus.isPending}
                    onConfirm={handleConfirmStatusChange}
                    onCancel={() => setStatusTarget(null)}
                />
            )}

            {successMessage && (
                <Modal title="สำเร็จ" onClose={() => setSuccessMessage('')} maxWidth="max-w-md">
                    <div className="p-5">
                        <p className="text-sm" style={{ color: 'var(--page-text)' }}>{successMessage}</p>
                        <div className="mt-5 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setSuccessMessage('')}
                                className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
                                style={{ backgroundColor: 'var(--primary-color)', color: 'var(--on-primary)' }}
                            >
                                รับทราบ
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
