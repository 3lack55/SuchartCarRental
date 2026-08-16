import { useEffect, useState } from "react";
import Modal from '../globals/Modal.jsx';
import ConfirmDialog from '../globals/ConfirmDialog.jsx'
import { getMaintenanceById, deleteMaintenance } from "../../services/maintenances/mainTenanceApi";
import { useAuth } from "../../context/auth/useAuth.js"; 

function formatDate(value) {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function MaintenanceDetailModal({ maintenanceId, onClose, onEdit, onDeleted }) {
    const [maintenance, setMaintenance] = useState(null);
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

        getMaintenanceById(user.token, maintenanceId)
            .then((data) => { if (!cancelled) setMaintenance(data.data); })
            .catch((err) => { if (!cancelled) setError(err.message); })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [maintenanceId, user?.token]);

    async function handleDelete() {
        setDeleting(true);
        setDeleteError(null);
        try {
            await deleteMaintenance(user.token, maintenanceId);
            onDeleted();
        } catch (err) {
            setDeleteError(err.message);
            setDeleting(false);
        }
    }

    return (
        <Modal
            title={loading ? 'กำลังโหลด...' : `ใบซ่อม #${maintenanceId}`}
            onClose={onClose}
            maxWidth="max-w-xl"
        >
            {loading && (
                <div className="flex items-center justify-center p-16 text-stone-400">กำลังโหลดข้อมูล...</div>
            )}

            {error && (
                <div className="p-6">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {!loading && !error && maintenance && (
                <>
                    {/* header */}
                    <div className="grid grid-cols-2 gap-3 border-b border-stone-100 p-5 text-sm">
                        <div>
                            <p className="text-stone-400">รถ</p>
                            <p className="mt-0.5 text-stone-700">{maintenance.plate_number} · {maintenance.plate_province}</p>
                        </div>
                        <div>
                            <p className="text-stone-400">วันที่ซ่อม</p>
                            <p className="mt-0.5 text-stone-700">{formatDate(maintenance.service_date)}</p>
                        </div>
                        <div>
                            <p className="text-stone-400">ศูนย์/อู่</p>
                            <p className="mt-0.5 text-stone-700">
                                {maintenance.garage_name}
                                <span className="ml-1.5 text-xs text-stone-400">
                                    ({maintenance.garage_type === 'center' ? 'ศูนย์บริการ' : 'อู่ทั่วไป'})
                                </span>
                            </p>
                        </div>
                        <div>
                            <p className="text-stone-400">เลขที่ใบเสร็จ</p>
                            <p className="mt-0.5 text-stone-700">{maintenance.receipt_number || '-'}</p>
                        </div>
                        <div>
                            <p className="text-stone-400">เลขไมล์</p>
                            <p className="mt-0.5 text-stone-700">{Number(maintenance.mileage).toLocaleString()} กม.</p>
                        </div>
                        <div>
                            <p className="text-stone-400">นัดครั้งถัดไป</p>
                            <p className="mt-0.5 text-stone-700">
                                {maintenance.next_service_mileage ? `${Number(maintenance.next_service_mileage).toLocaleString()} กม.` : '-'}
                            </p>
                        </div>
                    </div>

                    {/* รายการซ่อม */}
                    <div className="border-b border-stone-100 p-5">
                        <p className="mb-2 text-sm font-medium text-stone-600">รายการซ่อม</p>
                        <ul className="space-y-2">
                            {maintenance.items.map((item) => (
                                <li key={item.detail_id} className="flex items-center justify-between rounded-lg border border-stone-100 px-3 py-2 text-sm">
                                    <div>
                                        <p className="text-stone-700">{item.service_item_name}</p>
                                        <p className="text-xs text-stone-400">
                                            {item.service_type_name} · {item.service_category_name} · {item.quantity} x ฿{Number(item.unit_price).toLocaleString()}
                                        </p>
                                        {item.remark && <p className="mt-0.5 text-xs text-stone-400">หมายเหตุ: {item.remark}</p>}
                                    </div>
                                    <span className="text-stone-700">฿{Number(item.line_total).toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-3 flex justify-end text-sm">
                            <span className="text-stone-500">ยอดรวมทั้งหมด: </span>
                            <span className="ml-1.5 font-medium text-stone-800">฿{Number(maintenance.total_cost).toLocaleString()}</span>
                        </div>
                    </div>

                    {/* actions */}
                    <div className="flex gap-2 p-5">
                        <button
                            onClick={() => onEdit(maintenance)}
                            className="flex-1 rounded-lg border border-stone-200 py-2 text-sm text-stone-600 hover:bg-stone-50"
                        >
                            แก้ไข
                        </button>
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="flex-1 rounded-lg border border-red-200 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                            ลบ
                        </button>
                    </div>

                    {deleteError && <p className="px-5 pb-4 text-sm text-red-600">{deleteError}</p>}
                </>
            )}

            {showConfirm && (
                <ConfirmDialog
                    title="ลบใบซ่อมบำรุง"
                    message="ยืนยันการลบใบซ่อมนี้? รายการย่อยทั้งหมดจะถูกลบไปด้วยและไม่สามารถกู้คืนได้"
                    confirmLabel="ลบ"
                    loading={deleting}
                    onConfirm={handleDelete}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
        </Modal>
    );
}