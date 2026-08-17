import { useState } from "react";
import Modal from '../globals/Modal.jsx';
import ConfirmDialog from '../globals/ConfirmDialog.jsx'
import InfoTooltip from '../globals/InfoTooltip.jsx';
import { useDeleteMaintenance, useMaintenance } from "../../services/maintenances/maintenancesQueries.js";

function formatDate(value) {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function MaintenanceDetailModal({ maintenanceId, onClose, onEdit, onDeleted }) {
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, isLoading, error: queryError } = useMaintenance(maintenanceId);
    const maintenance = data?.data ?? null;
    const deleteMaintenance = useDeleteMaintenance();

    const loading = isLoading;
    const error = queryError?.message ?? null;
    const deleting = deleteMaintenance.isPending;
    const deleteError = deleteMaintenance.error?.message ?? null;

    async function handleDelete() {
        try {
            await deleteMaintenance.mutateAsync(maintenanceId);
            onDeleted();
        } catch {
            // error is surfaced via deleteMaintenance.error
        }
    }

    return (
        <Modal
            title={loading ? 'กำลังโหลด...' : `ใบซ่อม #${maintenanceId}`}
            onClose={onClose}
            maxWidth="max-w-xl"
        >
            {loading && (
                <div role="status" className="flex items-center justify-center p-16" style={{ color: 'var(--sub-text)' }}>กำลังโหลดข้อมูล...</div>
            )}

            {error && (
                <div className="p-6">
                    <p className="text-sm" style={{ color: 'var(--status-danger)' }}>{error}</p>
                </div>
            )}

            {!loading && !error && maintenance && (
                <>
                    <div className="grid grid-cols-1 gap-3 border-b p-5 text-sm sm:grid-cols-2" style={{ borderColor: 'var(--surface-border)' }}>
                        <div>
                            <p style={{ color: 'var(--sub-text)' }}>รถ</p>
                            <p className="mt-0.5 font-medium" style={{ color: 'var(--page-text)' }}>{maintenance.plate_number} · {maintenance.plate_province}</p>
                        </div>
                        <div>
                            <p style={{ color: 'var(--sub-text)' }}>วันที่ซ่อม</p>
                            <p className="mt-0.5 font-medium" style={{ color: 'var(--page-text)' }}>{formatDate(maintenance.service_date)}</p>
                        </div>
                        <div>
                            <p style={{ color: 'var(--sub-text)' }}>ศูนย์/อู่</p>
                            <p className="mt-0.5 font-medium" style={{ color: 'var(--page-text)' }}>
                                {maintenance.garage_name}
                                <span className="ml-1.5 text-xs" style={{ color: 'var(--icon-muted)' }}>
                                    ({maintenance.garage_type === 'center' ? 'ศูนย์บริการ' : 'อู่ทั่วไป'})
                                </span>
                            </p>
                        </div>
                        <div>
                            <p style={{ color: 'var(--sub-text)' }}>เลขที่ใบเสร็จ</p>
                            <p className="mt-0.5 font-medium" style={{ color: 'var(--page-text)' }}>{maintenance.receipt_number || '-'}</p>
                        </div>
                        <div>
                            <p className="flex items-center" style={{ color: 'var(--sub-text)' }}>
                                เลขไมล์
                                <InfoTooltip text="เลขไมล์ของรถ ณ วันที่เข้าซ่อมครั้งนี้" />
                            </p>
                            <p className="mt-0.5 font-medium" style={{ color: 'var(--page-text)' }}>{Number(maintenance.mileage).toLocaleString()} กม.</p>
                        </div>
                        <div>
                            <p className="flex items-center" style={{ color: 'var(--sub-text)' }}>
                                นัดครั้งถัดไป
                                <InfoTooltip text="ระยะทาง (กม.) ที่แนะนำให้นำรถเข้าซ่อมบำรุงครั้งถัดไป" />
                            </p>
                            <p className="mt-0.5 font-medium" style={{ color: 'var(--page-text)' }}>
                                {maintenance.next_service_mileage ? `${Number(maintenance.next_service_mileage).toLocaleString()} กม.` : '-'}
                            </p>
                        </div>
                    </div>

                    <div className="border-b p-5" style={{ borderColor: 'var(--surface-border)' }}>
                        <p className="mb-2 text-sm font-semibold" style={{ color: 'var(--sub-text)' }}>รายการซ่อม</p>
                        <ul className="space-y-2">
                            {maintenance.items.map((item) => (
                                <li key={item.detail_id} className="flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-soft)' }}>
                                    <div>
                                        <p style={{ color: 'var(--page-text)' }}>{item.service_item_name}</p>
                                        <p className="text-xs" style={{ color: 'var(--sub-text)' }}>
                                            {item.service_type_name} · {item.service_category_name} · {item.quantity} x ฿{Number(item.unit_price).toLocaleString()}
                                        </p>
                                        {item.remark && <p className="mt-0.5 text-xs" style={{ color: 'var(--sub-text)' }}>หมายเหตุ: {item.remark}</p>}
                                    </div>
                                    <span style={{ color: 'var(--page-text)' }}>฿{Number(item.line_total).toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-3 flex justify-end text-sm">
                            <span style={{ color: 'var(--sub-text)' }}>ยอดรวมทั้งหมด: </span>
                            <span className="ml-1.5 font-semibold" style={{ color: 'var(--page-text)' }}>฿{Number(maintenance.total_cost).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex gap-2 p-5">
                        <button
                            onClick={() => onEdit(maintenance)}
                            className="flex-1 cursor-pointer rounded-xl border py-2.5 text-sm font-medium transition-all hover:opacity-80"
                            style={{ backgroundColor: 'var(--surface-soft)', borderColor: 'var(--surface-border)', color: 'var(--page-text)' }}
                        >
                            แก้ไข
                        </button>
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="flex-1 cursor-pointer rounded-xl border py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
                            style={{ backgroundColor: 'var(--status-danger-soft)', borderColor: 'var(--status-danger)', color: 'var(--status-danger)' }}
                        >
                            ลบ
                        </button>
                    </div>

                    {deleteError && <p className="px-5 pb-4 text-sm" style={{ color: 'var(--status-danger)' }}>{deleteError}</p>}
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