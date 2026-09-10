import { useState } from 'react';
import { RefreshCw, Pencil, Trash2, ChevronDown, ChevronUp, Calendar, CalendarClock, Wallet, ShieldCheck, Building2 } from 'lucide-react';
import Modal from '../globals/Modal.jsx';
import ConfirmDialog from '../globals/ConfirmDialog.jsx';
import { useDeleteDocument, useDocument, useDocumentHistory } from '../../services/documents/documentsQueries.js';
import { DOCUMENT_TYPE_META, documentStatusStyle } from './documentMeta.js';

function formatDate(value) {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatCurrency(value) {
    return Number(value).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function DocumentDetailModal({ documentType, documentId, onClose, onRenew, onEdit, onDeleted }) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const { data, isLoading, error: queryError } = useDocument(documentType, documentId);
    const document = data?.data ?? null;
    const deleteDocument = useDeleteDocument();

    // โหลดประวัติไว้ตั้งแต่เอกสารพร้อม (ไม่รอ toggle "ดูประวัติ") เพื่อรู้ล่วงหน้าว่าลบรายการนี้แล้ว
    // รายการรอบก่อนหน้าไหนจะถูกเลื่อนขึ้นมาเป็น "ปัจจุบัน" แทน จะได้เตือนผู้ใช้ในไดอะล็อกยืนยันลบก่อนกดจริง
    const historyQuery = useDocumentHistory(documentType, document?.vehicle_id, { enabled: Boolean(document?.vehicle_id) });
    const history = historyQuery.data?.data ?? [];

    // รายการที่จะกลายเป็น "ปัจจุบัน" แทนหลังลบ (รายการอื่นที่ไม่ใช่ตัวนี้ ซึ่งมีวันหมดอายุล่าสุด) ถ้ามี
    const nextCurrent = history
        .filter((h) => h.document_id !== document?.document_id)
        .reduce((latest, h) => (!latest || new Date(h.expire_date) > new Date(latest.expire_date) ? h : latest), null);

    const loading = isLoading;
    const error = queryError?.message ?? null;
    const deleting = deleteDocument.isPending;
    const deleteError = deleteDocument.error?.message ?? null;

    async function handleDelete() {
        try {
            await deleteDocument.mutateAsync({ documentType, documentId });
            onDeleted?.();
            onClose();
        } catch {
            // error is surfaced via deleteDocument.error
        }
    }

    const meta = document ? DOCUMENT_TYPE_META[document.document_type] : null;
    const status = document ? documentStatusStyle(document.days_remaining) : null;

    return (
        <Modal title={loading ? 'กำลังโหลด...' : meta?.label ?? 'รายละเอียดเอกสาร'} onClose={onClose} maxWidth="max-w-lg">
            {loading && (
                <div role="status" className="flex items-center justify-center p-16" style={{ color: 'var(--sub-text)' }}>กำลังโหลดข้อมูล...</div>
            )}

            {error && (
                <div className="p-6">
                    <p className="text-sm" style={{ color: 'var(--status-danger)' }}>{error}</p>
                </div>
            )}

            {!loading && !error && document && (
                <>
                    <div className="flex items-start justify-between border-b p-5" style={{ borderColor: 'var(--surface-border)' }}>
                        <div>
                            <p className="font-semibold" style={{ color: 'var(--page-text)' }}>{document.plate_number} · {document.plate_province}</p>
                            <p className="mt-0.5 text-sm" style={{ color: 'var(--sub-text)' }}>{meta?.label}</p>
                        </div>
                        <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium" style={{ backgroundColor: status.bg, color: status.color }}>
                            {status.label}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 border-b p-5 sm:grid-cols-2" style={{ borderColor: 'var(--surface-border)' }}>
                        <div className="col-span-2">
                            <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--sub-text)' }}><Building2 size={12} />บริษัทประกัน</p>
                            {document.provider ? (
                                <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--page-text)' }}>{document.provider}</p>
                            ) : (
                                <p className="mt-1 text-sm italic" style={{ color: 'var(--sub-text)' }}>ไม่ได้ระบุ</p>
                            )}
                        </div>

                        <div>
                            <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--sub-text)' }}><Calendar size={12} />วันที่ชำระล่าสุด</p>
                            <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--page-text)' }}>{formatDate(document.last_paid_date)}</p>
                        </div>

                        <div>
                            <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--sub-text)' }}><CalendarClock size={12} />วันหมดอายุ</p>
                            <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--page-text)' }}>{formatDate(document.expire_date)}</p>
                        </div>

                        <div>
                            <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--sub-text)' }}><Wallet size={12} />ยอดชำระ</p>
                            {document.amount != null ? (
                                <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--page-text)' }}>฿ {formatCurrency(document.amount)}</p>
                            ) : (
                                <p className="mt-1 text-sm italic" style={{ color: 'var(--sub-text)' }}>ไม่ได้ระบุ</p>
                            )}
                        </div>

                        {
                            meta?.label.includes('ประกัน') && (
                                <div>
                                    <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--sub-text)' }}><ShieldCheck size={12} />ทุนประกัน</p>
                                    {document.coverage_amount != null ? (
                                        <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--page-text)' }}>฿ {formatCurrency(document.coverage_amount)}</p>
                                    ) : (
                                        <p className="mt-1 text-sm italic" style={{ color: 'var(--sub-text)' }}>ไม่ได้ระบุ</p>
                                    )}
                                </div>
                            )
                        }
                    </div>

                    <div className="border-b p-5" style={{ borderColor: 'var(--surface-border)' }}>
                        <button
                            type="button"
                            onClick={() => setShowHistory((prev) => !prev)}
                            className="flex cursor-pointer items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:opacity-80"
                            style={{ backgroundColor: 'var(--surface-soft)', color: 'var(--primary-color)', border: '1px solid var(--surface-border)' }}
                        >
                            {showHistory ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                            {showHistory ? 'ซ่อนประวัติการต่ออายุ' : 'ดูประวัติการต่ออายุ'}
                        </button>

                        {showHistory && (
                            <div className="mt-3 space-y-2">
                                {historyQuery.isLoading && (
                                    <p role="status" className="text-sm" style={{ color: 'var(--sub-text)' }}>กำลังโหลดประวัติ...</p>
                                )}
                                {!historyQuery.isLoading && history.length === 0 && (
                                    <p className="text-sm" style={{ color: 'var(--sub-text)' }}>ไม่มีประวัติก่อนหน้า</p>
                                )}
                                {history.map((h) => (
                                    <div
                                        key={h.document_id}
                                        className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm"
                                        style={{
                                            borderColor: 'var(--surface-border)',
                                            backgroundColor: h.document_id === document.document_id ? 'var(--primary-color-soft)' : 'var(--surface-soft)',
                                        }}
                                    >
                                        <div>
                                            <p style={{ color: h.document_id === document.document_id ? 'var(--on-primary)' : 'var(--page-text)' }}>{formatDate(h.last_paid_date)} - {formatDate(h.expire_date)}</p>
                                            {h.provider 
                                                ? <p style={{ color: h.document_id === document.document_id ? 'var(--on-primary)' : 'var(--page-text)', opacity: 0.75 }}>{h.provider}</p> 
                                                : <p style={{ color: h.document_id === document.document_id ? 'var(--on-primary)' : 'var(--page-text)', opacity: 0.75 }}>ไม่ได้ระบุผู้ให้บริการ</p>
                                            }

                                            {h.amount != null 
                                                ? <p style={{ color: h.document_id === document.document_id ? 'var(--on-primary)' : 'var(--page-text)', opacity: 0.75 }}>ยอดชำระ {formatCurrency(h.amount)} บาท</p>
                                                : <p style={{ color: h.document_id === document.document_id ? 'var(--on-primary)' : 'var(--page-text)', opacity: 0.75 }}>ไม่ได้ระบุยอดชำระ</p>
                                            }

                                            {h.coverage_amount != null && (
                                                <p style={{ color: h.document_id === document.document_id ? 'var(--on-primary)' : 'var(--page-text)', opacity: 0.75 }}>ทุนประกัน {formatCurrency(h.coverage_amount)} บาท</p>
                                            )}
                                        </div>
                                        {h.document_id === document.document_id && (
                                            <span className="text-xs font-medium" style={{ color: 'var(--on-primary)', opacity: 0.5 }}>ปัจจุบัน</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 p-5">
                        <button
                            onClick={() => onRenew(document)}
                            className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                            style={{ backgroundColor: 'var(--primary-color)', color: 'var(--on-primary)' }}
                        >
                            <RefreshCw size={16} />
                            ต่ออายุ
                        </button>

                        <div className="flex gap-2">
                            <button
                                onClick={() => onEdit(document)}
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
                    title="ลบข้อมูลเอกสาร"
                    message={
                        nextCurrent
                            ? `ยืนยันการลบเอกสารนี้? หลังลบแล้ว ระบบจะแสดงรายการก่อนหน้า (หมดอายุ ${formatDate(nextCurrent.expire_date)}) เป็นเอกสารปัจจุบันแทน และไม่สามารถกู้คืนรายการที่ลบได้`
                            : 'ยืนยันการลบเอกสารนี้? ไม่สามารถกู้คืนได้'
                    }
                    confirmLabel="ลบ"
                    loading={deleting}
                    onConfirm={handleDelete}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
        </Modal>
    );
}
