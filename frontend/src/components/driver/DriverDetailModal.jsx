import { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeleteDriver, useDriver, useRestoreDriver } from '../../services/drivers/driversQueries.js';
import { useAuth } from '../../context/auth/useAuth.js';
import { useModalA11y } from '../../hooks/useModalA11y.js';
import ConfirmDialog from '../globals/ConfirmDialog.jsx';
import PlateBadge from '../globals/PlateBadge.jsx';
import { formatPhone } from '../../utils/phone.js';

function initials(firstName, lastName) {
    return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
}

function formatDate(value) {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(value) {
    if (!value) return '-';
    return new Date(value).toLocaleString('th-TH', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

export default function DriverDetailModal({ driverId, onClose, onEdit, onDeleted }) {
    const [showConfirm, setShowConfirm] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    const titleId = useId();
    const panelRef = useModalA11y(onClose);

    const { data, isLoading, error: queryError } = useDriver(driverId);
    const driver = data?.data ?? null;
    const deleteDriver = useDeleteDriver();
    const restoreDriver = useRestoreDriver();

    const loading = isLoading;
    const error = queryError?.message ?? null;
    const deleting = deleteDriver.isPending;
    const restoring = restoreDriver.isPending;
    const deleteError = deleteDriver.error?.message ?? restoreDriver.error?.message ?? null;

    async function handleDelete() {
        if (!user?.token || !driverId) return;

        try {
            await deleteDriver.mutateAsync(driverId);
            onDeleted?.();
            onClose();
        } catch {
            // error is surfaced via deleteDriver.error
        }
    }

    async function handleRestore() {
        if (!user?.token || !driverId) return;

        try {
            await restoreDriver.mutateAsync(driverId);
        } catch {
            // error is surfaced via restoreDriver.error
        }
    }

    function goToVehicle(vehicleId) {
        onClose();
        navigate(`/vehicles?open=${vehicleId}`);
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border shadow-xl outline-none"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)', boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18)' }}
            >
                {loading && (
                    <div role="status" className="flex items-center justify-center p-16" style={{ color: 'var(--sub-text)' }}>กำลังโหลดข้อมูล...</div>
                )}

                {error && (
                    <div className="p-6">
                        <p className="text-sm" style={{ color: 'var(--status-danger)' }}>{error}</p>
                        <button onClick={onClose} className="mt-4 cursor-pointer text-sm underline transition-opacity hover:opacity-70" style={{ color: 'var(--sub-text)' }}>ปิด</button>
                    </div>
                )}

                {!loading && !error && driver && (
                    <>
                        <div className="flex items-start justify-between border-b p-5" style={{ borderColor: 'var(--surface-border)' }}>
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold" style={{ backgroundColor: 'var(--primary-color-soft)', color: 'var(--on-primary)' }}>
                                    {initials(driver.first_name, driver.last_name)}
                                </div>
                                <div>
                                    <p id={titleId} className="font-semibold" style={{ color: 'var(--page-text)' }}>
                                        {driver.prefix}{driver.first_name} {driver.last_name}
                                    </p>
                                    <span
                                        className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                                        style={driver.deleted ? { backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', opacity: 0.75 } : { backgroundColor: 'var(--status-success-soft)', color: 'var(--status-success)' }}
                                    >
                                        {driver.deleted ? 'พ้นสภาพ' : 'ทำงานอยู่'}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                aria-label="ปิด"
                                className="cursor-pointer rounded-lg p-1.5 transition-colors"
                                style={{ color: 'var(--icon-muted)', backgroundColor: 'transparent' }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-soft)'; e.currentTarget.style.color = 'var(--page-text)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--icon-muted)'; }}
                            >
                                ✕
                            </button>
                        </div>

                        <div className='p-5'>
                            <div className="grid grid-cols-1 gap-3 pb-3 text-sm sm:grid-cols-2">
                                <div>
                                    <p style={{ color: 'var(--sub-text)' }}>เบอร์โทร</p>
                                    <p className="mt-0.5 font-medium" style={{ color: 'var(--page-text)' }}>{formatPhone(driver.phone)}</p>
                                </div>
                                <div>
                                    <p style={{ color: 'var(--sub-text)' }}>วันที่เริ่มงาน</p>
                                    <p className="mt-0.5 font-medium" style={{ color: 'var(--page-text)' }}>{formatDate(driver.hire_date)}</p>
                                </div>
                            </div>

                            <div className="border-t py-3" style={{ borderColor: 'var(--surface-border)' }}>
                                <p className="mb-2 text-sm font-semibold" style={{ color: 'var(--sub-text)' }}>รถที่ดูแล</p>
                                {driver.vehicles.length === 0 ? (
                                    <p className="text-sm" style={{ color: 'var(--icon-muted)' }}>ไม่มีรถที่ดูแลอยู่ในขณะนี้</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {driver.vehicles.map((v) => (
                                            <li key={v.vehicle_id}>
                                                <button
                                                    type="button"
                                                    onClick={() => goToVehicle(v.vehicle_id)}
                                                    className="flex w-full cursor-pointer items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition-colors"
                                                    style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-soft)' }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary-color)'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--surface-border)'; }}
                                                >
                                                    <PlateBadge plateNumber={v.plate_number} plateProvince={v.plate_province} />
                                                    <span style={{ color: 'var(--sub-text)' }}>{v.brand_model}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="border-t py-3" style={{ borderColor: 'var(--surface-border)' }}>
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <p className="text-sm font-semibold" style={{ color: 'var(--sub-text)' }}>ประวัติการทำผิดกฎจราจร</p>
                                    {driver.unpaid_violations > 0 && (
                                        <span className="rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ backgroundColor: 'var(--status-danger-soft)', color: 'var(--status-danger)' }}>
                                            ค้างจ่าย {driver.unpaid_violations} รายการ
                                        </span>
                                    )}
                                </div>

                                {driver.violations.length === 0 ? (
                                    <p className="text-sm" style={{ color: 'var(--icon-muted)' }}>ไม่มีประวัติการทำผิดกฎจราจร</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {driver.violations.map((v) => (
                                            <li
                                                key={v.violation_id}
                                                className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm"
                                                style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-soft)' }}
                                            >
                                                <div>
                                                    <p style={{ color: 'var(--page-text)' }}>{v.reason_name}</p>
                                                    <p className="text-xs" style={{ color: 'var(--sub-text)' }}>
                                                        {formatDateTime(v.incident_datetime)} · {v.plate_number}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p style={{ color: 'var(--page-text)' }}>฿{Number(v.fine).toLocaleString()}</p>
                                                    <span className="text-xs font-medium" style={v.is_paid ? { color: 'var(--status-success)' } : { color: 'var(--status-danger)' }}>
                                                        {v.is_paid ? 'จ่ายแล้ว' : 'ยังไม่จ่าย'}
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="flex gap-2 border-t p-5" style={{ borderColor: 'var(--surface-border)' }}>
                                <button
                                    onClick={() => onEdit(driver)}
                                    className="flex-1 cursor-pointer rounded-xl border py-2.5 text-sm font-medium transition-all hover:opacity-80"
                                    style={{ backgroundColor: 'var(--surface-soft)', borderColor: 'var(--surface-border)', color: 'var(--page-text)' }}
                                >
                                    แก้ไข
                                </button>
                                {driver.deleted ? (
                                    <button
                                        onClick={handleRestore}
                                        disabled={restoring}
                                        className="flex-1 cursor-pointer rounded-xl border py-2.5 text-sm font-medium transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                                        style={{ backgroundColor: 'var(--status-success-soft)', borderColor: 'var(--status-success)', color: 'var(--status-success)' }}
                                    >
                                        {restoring ? 'กำลังกู้คืน...' : 'กู้คืนคนขับ'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setShowConfirm(true)}
                                        disabled={deleting}
                                        className="flex-1 cursor-pointer rounded-xl border py-2.5 text-sm font-medium transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                                        style={{ backgroundColor: 'var(--status-danger-soft)', borderColor: 'var(--status-danger)', color: 'var(--status-danger)' }}
                                    >
                                        {deleting ? 'กำลังลบ...' : 'ลบ'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {deleteError && <p className="px-5 pb-4 text-sm" style={{ color: 'var(--status-danger)' }}>{deleteError}</p>}
                    </>
                )}
            </div>

            {showConfirm && (
                <ConfirmDialog
                    title="ลบข้อมูลคนขับ"
                    message={`ยืนยันการลบ ${driver?.prefix}${driver?.first_name} ${driver?.last_name} ออกจากระบบ? ข้อมูลจะถูกซ่อนแต่ยังเก็บประวัติไว้ ไม่สามารถกู้คืนเองผ่านหน้าเว็บได้`}
                    confirmLabel="ลบ"
                    loading={deleting}
                    onConfirm={handleDelete}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
        </div>
    );
}