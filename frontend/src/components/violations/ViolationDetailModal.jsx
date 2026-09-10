import { useState } from 'react';
import { User, Phone, Car, Wallet, CheckCircle2, XCircle, Pencil, Trash2 } from 'lucide-react';
import Modal from '../globals/Modal.jsx';
import ConfirmDialog from '../globals/ConfirmDialog.jsx';
import { useDeleteViolation, useUpdateViolation, useViolation } from '../../services/violations/violationsQueries.js';
import { formatPhone } from '../../utils/phone.js';

function formatDateTime(value) {
    if (!value) return '-';
    return new Date(value).toLocaleString('th-TH', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

export default function ViolationDetailModal({ violationId, onClose, onEdit, onDeleted }) {
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, isLoading, error: queryError } = useViolation(violationId);
    const violation = data?.data ?? null;
    const deleteViolation = useDeleteViolation();
    const updateViolation = useUpdateViolation();

    const loading = isLoading;
    const error = queryError?.message ?? null;
    const deleting = deleteViolation.isPending;
    const deleteError = deleteViolation.error?.message ?? null;
    const togglingPaid = updateViolation.isPending;

    async function handleDelete() {
        try {
            await deleteViolation.mutateAsync(violationId);
            onDeleted?.();
            onClose();
        } catch {
            // error is surfaced via deleteViolation.error
        }
    }

    async function handleTogglePaid() {
        if (!violation) return;
        try {
            await updateViolation.mutateAsync({ id: violationId, data: { is_paid: !violation.is_paid } });
        } catch {
            // error is surfaced via updateViolation.error
        }
    }

    return (
        <Modal title={loading ? 'กำลังโหลด...' : `ใบสั่ง #${violationId}`} onClose={onClose} maxWidth="max-w-lg">
            {loading && (
                <div role="status" className="flex items-center justify-center p-16" style={{ color: 'var(--sub-text)' }}>กำลังโหลดข้อมูล...</div>
            )}

            {error && (
                <div className="p-6">
                    <p className="text-sm" style={{ color: 'var(--status-danger)' }}>{error}</p>
                </div>
            )}

            {!loading && !error && violation && (
                <>
                    <div className="flex items-start justify-between border-b p-5" style={{ borderColor: 'var(--surface-border)' }}>
                        <div>
                            <p className="font-semibold" style={{ color: 'var(--page-text)' }}>{violation.reason_name}</p>
                            <p className="mt-0.5 text-sm" style={{ color: 'var(--sub-text)' }}>{formatDateTime(violation.incident_datetime)}</p>
                        </div>
                        <span
                            className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                            style={violation.is_paid
                                ? { backgroundColor: 'var(--status-success-soft)', color: 'var(--status-success)' }
                                : { backgroundColor: 'var(--status-danger-soft)', color: 'var(--status-danger)' }}
                        >
                            {violation.is_paid ? 'จ่ายแล้ว' : 'ยังไม่จ่าย'}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 border-b p-5 sm:grid-cols-2" style={{ borderColor: 'var(--surface-border)' }}>
                        <div>
                            <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--sub-text)' }}><User size={12} />คนขับ</p>
                            <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--page-text)' }}>{violation.driver_name}</p>
                        </div>
                        <div>
                            <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--sub-text)' }}><Phone size={12} />เบอร์โทร</p>
                            <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--page-text)' }}>{formatPhone(violation.driver_phone)}</p>
                        </div>
                        <div>
                            <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--sub-text)' }}><Car size={12} />รถ</p>
                            <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--page-text)' }}>{violation.plate_number} · {violation.plate_province}</p>
                        </div>
                        <div>
                            <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--sub-text)' }}><Wallet size={12} />ค่าปรับ</p>
                            <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--page-text)' }}>฿{Number(violation.fine).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 p-5">
                        <button
                            onClick={handleTogglePaid}
                            disabled={togglingPaid}
                            className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-medium transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                            style={violation.is_paid
                                ? { backgroundColor: 'var(--surface-soft)', borderColor: 'var(--surface-border)', color: 'var(--page-text)' }
                                : { backgroundColor: 'var(--status-success-soft)', borderColor: 'var(--status-success)', color: 'var(--status-success)' }}
                        >
                            {violation.is_paid ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                            {togglingPaid ? 'กำลังบันทึก...' : violation.is_paid ? 'ทำเครื่องหมายว่ายังไม่จ่าย' : 'ทำเครื่องหมายว่าจ่ายแล้ว'}
                        </button>

                        <div className="flex gap-2">
                            <button
                                onClick={() => onEdit(violation)}
                                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-medium transition-all hover:opacity-80"
                                style={{ backgroundColor: 'var(--surface-soft)', borderColor: 'var(--surface-border)', color: 'var(--page-text)' }}
                            >
                                <Pencil size={15} />
                                แก้ไข
                            </button>
                            <button
                                onClick={() => setShowConfirm(true)}
                                disabled={deleting}
                                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-medium transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                                style={{ backgroundColor: 'var(--status-danger-soft)', borderColor: 'var(--status-danger)', color: 'var(--status-danger)' }}
                            >
                                <Trash2 size={15} />
                                {deleting ? 'กำลังลบ...' : 'ลบ'}
                            </button>
                        </div>
                    </div>

                    {deleteError && <p className="px-5 pb-4 text-sm" style={{ color: 'var(--status-danger)' }}>{deleteError}</p>}
                </>
            )}

            {showConfirm && (
                <ConfirmDialog
                    title="ลบใบสั่ง"
                    message="ยืนยันการลบใบสั่งนี้? ไม่สามารถกู้คืนได้"
                    confirmLabel="ลบ"
                    loading={deleting}
                    onConfirm={handleDelete}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
        </Modal>
    );
}
