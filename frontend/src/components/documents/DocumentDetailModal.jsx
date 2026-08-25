import { useState } from 'react';
import Modal from '../globals/Modal.jsx';
import ConfirmDialog from '../globals/ConfirmDialog.jsx';
import { useDeleteDocument, useDocument, useDocumentHistory } from '../../services/documents/documentsQueries.js';
import { DOCUMENT_TYPE_META, documentStatusStyle } from './documentMeta.js';

function formatDate(value) {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DocumentDetailModal({ documentType, documentId, onClose, onRenew, onEdit, onDeleted }) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const { data, isLoading, error: queryError } = useDocument(documentType, documentId);
    const document = data?.data ?? null;
    const deleteDocument = useDeleteDocument();

    const historyQuery = useDocumentHistory(documentType, document?.vehicle_id, { enabled: showHistory });
    const history = historyQuery.data?.data ?? [];

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

                    <div className="grid grid-cols-1 gap-3 border-b p-5 text-sm sm:grid-cols-2" style={{ borderColor: 'var(--surface-border)' }}>
                        {meta?.hasProvider && (
                            <div className="col-span-2">
                                <p style={{ color: 'var(--sub-text)' }}>บริษัทประกัน</p>
                                <p className="mt-0.5 font-medium" style={{ color: 'var(--page-text)' }}>{document.provider || '-'}</p>
                            </div>
                        )}
                        <div>
                            <p style={{ color: 'var(--sub-text)' }}>วันที่ชำระล่าสุด</p>
                            <p className="mt-0.5 font-medium" style={{ color: 'var(--page-text)' }}>{formatDate(document.last_paid_date)}</p>
                        </div>
                        <div>
                            <p style={{ color: 'var(--sub-text)' }}>วันหมดอายุ</p>
                            <p className="mt-0.5 font-medium" style={{ color: 'var(--page-text)' }}>{formatDate(document.expire_date)}</p>
                        </div>
                        {meta?.amounts.map((a) => (
                            <div key={a.key}>
                                <p style={{ color: 'var(--sub-text)' }}>{a.label}</p>
                                <p className="mt-0.5 font-medium" style={{ color: 'var(--page-text)' }}>฿{Number(document[a.key]).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>

                    <div className="border-b p-5" style={{ borderColor: 'var(--surface-border)' }}>
                        <button
                            type="button"
                            onClick={() => setShowHistory((prev) => !prev)}
                            className="cursor-pointer text-sm font-medium transition-opacity hover:opacity-70"
                            style={{ color: 'var(--primary-color)' }}
                        >
                            {showHistory ? 'ซ่อนประวัติการต่ออายุ ▲' : 'ดูประวัติการต่ออายุ ▾'}
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
                                            <p style={{ color: h.document_id === document.document_id ? 'var(--on-primary)' : 'var(--page-text)' }}>{formatDate(h.last_paid_date)} – {formatDate(h.expire_date)}</p>
                                            {meta?.hasProvider && <p style={{ color: h.document_id === document.document_id ? 'var(--on-primary)' : 'var(--page-text)', opacity: 0.75 }}>{h.provider || '-'}</p>}
                                        </div>
                                        {h.document_id === document.document_id && (
                                            <span className="text-xs font-medium" style={{ color: 'var(--on-primary)', opacity: 0.5 }}>ปัจจุบัน</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 p-5">
                        <button
                            onClick={() => onRenew(document)}
                            className="flex-1 cursor-pointer rounded-xl py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                            style={{ backgroundColor: 'var(--primary-color)', color: 'var(--on-primary)' }}
                        >
                            ต่ออายุ
                        </button>
                    </div>

                    <div className="flex gap-2 border-t p-5" style={{ borderColor: 'var(--surface-border)' }}>
                        <button
                            onClick={() => onEdit(document)}
                            className="flex-1 cursor-pointer rounded-xl border py-2.5 text-sm font-medium transition-all hover:opacity-80"
                            style={{ backgroundColor: 'var(--surface-soft)', borderColor: 'var(--surface-border)', color: 'var(--page-text)' }}
                        >
                            แก้ไข
                        </button>
                        <button
                            onClick={() => setShowConfirm(true)}
                            disabled={deleting}
                            className="flex-1 cursor-pointer rounded-xl border py-2.5 text-sm font-medium transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                            style={{ backgroundColor: 'var(--status-danger-soft)', borderColor: 'var(--status-danger)', color: 'var(--status-danger)' }}
                        >
                            {deleting ? 'กำลังลบ...' : 'ลบ'}
                        </button>
                    </div>

                    {deleteError && <p className="px-5 pb-4 text-sm" style={{ color: 'var(--status-danger)' }}>{deleteError}</p>}
                </>
            )}

            {showConfirm && (
                <ConfirmDialog
                    title="ลบข้อมูลเอกสาร"
                    message="ยืนยันการลบเอกสารนี้? ไม่สามารถกู้คืนได้"
                    confirmLabel="ลบ"
                    loading={deleting}
                    onConfirm={handleDelete}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
        </Modal>
    );
}
