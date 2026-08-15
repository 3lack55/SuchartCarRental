import { useEffect, useState } from 'react';
import { deleteDriver, getDriverById } from '../../services/drivers/driversApi.js';
import { useAuth } from '../../context/auth/useAuth.js';
import ConfirmDialog from '../globals/ConfirmDialog.jsx';

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
    const [driver, setDriver] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        getDriverById(user.token, driverId)
            .then((data) => { if (!cancelled) setDriver(data.data); })
            .catch((err) => { if (!cancelled) setError(err.message); })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [driverId, user?.token]);

    async function handleDelete() {
        if (!user?.token || !driverId) return;

        setDeleting(true);
        setDeleteError(null);

        try {
            await deleteDriver(user.token, driverId);
            onDeleted?.();
            onClose();
        } catch (err) {
            setDeleting(false);
            setDeleteError(err.message);
        }
    }

    // ปิด modal ด้วยปุ่ม Escape เพื่อ accessibility
    useEffect(() => {
        function handleKey(e) {
            if (e.key === 'Escape') onClose();
        }
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
                {loading && (
                    <div className="flex items-center justify-center p-16 text-stone-400">กำลังโหลดข้อมูล...</div>
                )}

                {error && (
                    <div className="p-6">
                        <p className="text-red-600 text-sm">{error}</p>
                        <button onClick={onClose} className="mt-4 text-sm text-stone-500 hover:underline">ปิด</button>
                    </div>
                )}

                {/* {confirmOpen && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/45 p-4" onClick={(e) => { if (e.target === e.currentTarget) setConfirmOpen(false); }}>
                        <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
                            <h3 className="text-lg font-semibold text-stone-800">ยืนยันการลบ</h3>
                            <p className="mt-2 text-sm text-stone-600">
                                คุณต้องการลบข้อมูลคนขับนี้ใช่หรือไม่?
                                <span className="mt-2 block font-medium text-stone-700">
                                    {driver?.prefix}{driver?.first_name} {driver?.last_name}
                                </span>
                            </p>

                            <div className="mt-5 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setConfirmOpen(false)}
                                    className="flex-1 rounded-lg border border-stone-200 py-2 text-sm text-stone-600 hover:bg-stone-50"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                    {deleting ? 'กำลังลบ...' : 'ตกลง'}
                                </button>
                            </div>
                        </div>
                    </div>
                )} */}

                {!loading && !error && driver && (
                    <>
                        {/* header */}
                        <div className="flex items-start justify-between border-b border-stone-100 p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-sm font-medium text-emerald-700">
                                    {initials(driver.first_name, driver.last_name)}
                                </div>
                                <div>
                                    <p className="font-medium text-stone-800">
                                        {driver.prefix}{driver.first_name} {driver.last_name}
                                    </p>
                                    <span
                                        className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${driver.deleted
                                            ? 'bg-stone-100 text-stone-500'
                                            : 'bg-emerald-50 text-emerald-700'
                                            }`}
                                    >
                                        {driver.deleted ? 'พ้นสภาพ' : 'ทำงานอยู่'}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                aria-label="ปิด"
                                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
                            >
                                ✕
                            </button>
                        </div>

                        {/* ข้อมูลติดต่อ/เริ่มงาน */}
                        <div className="grid grid-cols-2 gap-3 p-5 text-sm">
                            <div>
                                <p className="text-stone-400">เบอร์โทร</p>
                                <p className="mt-0.5 text-stone-700">{driver.phone}</p>
                            </div>
                            <div>
                                <p className="text-stone-400">วันที่เริ่มงาน</p>
                                <p className="mt-0.5 text-stone-700">{formatDate(driver.hire_date)}</p>
                            </div>
                        </div>

                        {/* รถที่ดูแล */}
                        <div className="border-t border-stone-100 p-5">
                            <p className="mb-2 text-sm font-medium text-stone-600">รถที่ดูแล</p>
                            {driver.vehicles.length === 0 ? (
                                <p className="text-sm text-stone-400">ไม่มีรถที่ดูแลอยู่ในขณะนี้</p>
                            ) : (
                                <ul className="space-y-1.5">
                                    {driver.vehicles.map((v) => (
                                        <li key={v.vehicle_id} className="flex justify-between text-sm">
                                            <span className="text-stone-700">{v.plate_number} · {v.plate_province}</span>
                                            <span className="text-stone-400">{v.brand_model}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* ประวัติใบสั่ง — ทั้งจ่ายแล้วและยังไม่จ่าย */}
                        <div className="border-t border-stone-100 p-5">
                            <div className="mb-2 flex items-center justify-between">
                                <p className="text-sm font-medium text-stone-600">ประวัติการทำผิดกฎจราจร</p>
                                {driver.unpaid_violations > 0 && (
                                    <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600">
                                        ค้างจ่าย {driver.unpaid_violations} รายการ
                                    </span>
                                )}
                            </div>

                            {driver.violations.length === 0 ? (
                                <p className="text-sm text-stone-400">ไม่มีประวัติการทำผิดกฎจราจร</p>
                            ) : (
                                <ul className="space-y-2">
                                    {driver.violations.map((v) => (
                                        <li
                                            key={v.violation_id}
                                            className="flex items-center justify-between rounded-lg border border-stone-100 px-3 py-2 text-sm"
                                        >
                                            <div>
                                                <p className="text-stone-700">{v.reason_name}</p>
                                                <p className="text-xs text-stone-400">
                                                    {formatDateTime(v.incident_datetime)} · {v.plate_number}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-stone-700">฿{Number(v.fine).toLocaleString()}</p>
                                                <span
                                                    className={`text-xs font-medium ${v.is_paid ? 'text-emerald-600' : 'text-red-500'
                                                        }`}
                                                >
                                                    {v.is_paid ? 'จ่ายแล้ว' : 'ยังไม่จ่าย'}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* actions */}
                        <div className="flex gap-2 border-t border-stone-100 p-5">
                            <button
                                onClick={() => onEdit(driver)}
                                className="flex-1 rounded-lg border border-stone-200 py-2 text-sm text-stone-600 hover:bg-stone-50"
                            >
                                แก้ไข
                            </button>
                            <button
                                onClick={() => setShowConfirm(true)}
                                disabled={deleting}
                                className="flex-1 rounded-lg border border-red-200 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                                {deleting ? 'กำลังลบ...' : 'ลบ'}
                            </button>
                        </div>

                        {deleteError && <p className="px-5 pb-4 text-sm text-red-600">{deleteError}</p>}
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