import { useId, useMemo, useState } from "react";
import { useModalA11y } from '../../hooks/useModalA11y.js';
import ConfirmDialog from '../globals/ConfirmDialog.jsx'
import InfoTooltip from '../globals/InfoTooltip.jsx';
import PlateBadge from '../globals/PlateBadge.jsx';
import ServiceTypeBadge from './ServiceTypeBadge.jsx';
import { useDeleteMaintenance, useMaintenance } from "../../services/maintenances/maintenancesQueries.js";
import { useServiceCatalog } from '../../services/lookups/lookupQueries.js';

function formatDate(value) {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function MaintenanceDetailModal({ maintenanceId, onClose, onEdit, onDeleted }) {
    const [showConfirm, setShowConfirm] = useState(false);
    const titleId = useId();
    const panelRef = useModalA11y(onClose);

    const { data, isLoading, error: queryError } = useMaintenance(maintenanceId);
    const maintenance = data?.data ?? null;
    const deleteMaintenance = useDeleteMaintenance();

    const serviceCatalogQuery = useServiceCatalog();
    const serviceTypeColors = useMemo(
        () => Object.fromEntries((serviceCatalogQuery.data?.data ?? []).map((t) => [t.service_type_name, t.color])),
        [serviceCatalogQuery.data]
    );

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
                className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border shadow-xl outline-none"
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

                {!loading && !error && maintenance && (
                    <>
                        <div className="flex items-start justify-between border-b p-5" style={{ borderColor: 'var(--surface-border)' }}>
                            <div className="flex items-center gap-3">
                                <PlateBadge plateNumber={maintenance.plate_number} plateProvince={maintenance.plate_province} />
                                <div>
                                    <p id={titleId} className="font-semibold" style={{ color: 'var(--page-text)' }}>{formatDate(maintenance.service_date)}</p>
                                    <p className="mt-0.5 text-sm" style={{ color: 'var(--sub-text)' }}>
                                        {maintenance.garage_name}
                                        <span className="ml-1.5 text-xs" style={{ color: 'var(--icon-muted)' }}>
                                            ({maintenance.garage_type === 'center' ? 'ศูนย์บริการ' : 'อู่ทั่วไป'})
                                        </span>
                                    </p>
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

                        <div className="grid grid-cols-2 gap-3 border-b p-5 text-sm sm:grid-cols-3" style={{ borderColor: 'var(--surface-border)' }}>
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
                            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--surface-border)' }}>
                                <table className="w-full min-w-120 text-sm" style={{ color: 'var(--page-text)' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: 'var(--surface-soft)', borderBottom: '1px solid var(--surface-border)', color: 'var(--sub-text)' }}>
                                            <th className="px-3 py-2 text-left font-medium">รายการ</th>
                                            <th className="px-3 py-2 text-right font-medium">จำนวน</th>
                                            <th className="px-3 py-2 text-right font-medium">ราคา/หน่วย</th>
                                            <th className="px-3 py-2 text-right font-medium">รวม</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {maintenance.items.map((item) => (
                                            <tr key={item.detail_id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                                                <td className="px-3 py-2.5 align-top">
                                                    <p style={{ color: 'var(--page-text)' }}>{item.service_item_name}</p>
                                                    <div className="mt-1 flex items-center gap-1.5 text-xs">
                                                        <ServiceTypeBadge typeName={item.service_type_name} color={serviceTypeColors[item.service_type_name]} className="px-2 py-0.5 text-[11px]" />
                                                        <span style={{ color: 'var(--sub-text)' }}>{item.service_category_name}</span>
                                                    </div>
                                                    {item.remark && <p className="mt-0.5 text-xs" style={{ color: 'var(--sub-text)' }}>หมายเหตุ: {item.remark}</p>}
                                                </td>
                                                <td className="px-3 py-2.5 text-right align-top" style={{ color: 'var(--sub-text)' }}>{item.quantity}</td>
                                                <td className="px-3 py-2.5 text-right align-top" style={{ color: 'var(--sub-text)' }}>฿{Number(item.unit_price).toLocaleString()}</td>
                                                <td className="px-3 py-2.5 text-right align-top font-medium" style={{ color: 'var(--page-text)' }}>฿{Number(item.line_total).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={3} className="px-3 py-2.5 text-right" style={{ color: 'var(--sub-text)' }}>ยอดรวมทั้งหมด</td>
                                            <td className="px-3 py-2.5 text-right font-semibold" style={{ color: 'var(--page-text)' }}>฿{Number(maintenance.total_cost).toLocaleString()}</td>
                                        </tr>
                                    </tfoot>
                                </table>
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
            </div>

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
        </div>
    );
}
