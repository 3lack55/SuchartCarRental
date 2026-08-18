import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/auth/useAuth.js';
import { useDocuments } from '../../services/documents/documentsQueries.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import InfoTooltip from '../../components/globals/InfoTooltip.jsx';
import PlateBadge from '../../components/globals/PlateBadge.jsx';
import DocumentDetailModal from '../../components/documents/DocumentDetailModal.jsx';
import DocumentFormModal from '../../components/documents/DocumentFormModal.jsx';
import { DOCUMENT_TYPE_META, documentStatusStyle } from '../../components/documents/documentMeta.js';

function formatDate(value) {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

const DOCUMENT_STATUS_OPTIONS = ['expired', 'expiring', 'valid'];

export default function DocumentsPage() {
    const [searchParams] = useSearchParams();
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebouncedValue(search, 300);
    // มาจากหน้าภาพรวมพร้อมตัวกรอง เช่น ?type=insurance&status=expired
    const [documentType, setDocumentType] = useState(() => {
        const value = searchParams.get('type');
        return value && DOCUMENT_TYPE_META[value] ? value : '';
    });
    const [status, setStatus] = useState(() => {
        const value = searchParams.get('status');
        return DOCUMENT_STATUS_OPTIONS.includes(value) ? value : '';
    });
    const [selected, setSelected] = useState(null); // { documentType, documentId }
    const [formModal, setFormModal] = useState(null); // { mode: 'create' | 'renew' | 'edit', renewFrom?, document? }

    const { user } = useAuth();

    const { data, isLoading, error } = useDocuments({ search: debouncedSearch, documentType: documentType || undefined, status: status || undefined });
    const documents = data?.data ?? [];
    const errorMessage = !user?.token ? 'กรุณาเข้าสู่ระบบก่อนใช้งาน' : error?.message;

    const expiredCount = documents.filter((d) => d.days_remaining < 0).length;
    const expiringCount = documents.filter((d) => d.days_remaining >= 0 && d.days_remaining <= 30).length;
    const validCount = documents.filter((d) => d.days_remaining > 30).length;

    const stats = [
        { label: 'หมดอายุแล้ว', value: expiredCount, tone: 'danger', description: 'เอกสารที่หมดอายุไปแล้วและยังไม่ต่ออายุ' },
        { label: 'ใกล้หมดอายุ', value: expiringCount, tone: 'warning', description: 'เอกสารที่จะหมดอายุภายใน 30 วัน' },
        { label: 'ปกติ', value: validCount, tone: 'success', description: 'เอกสารที่ยังไม่ใกล้หมดอายุ' },
    ];

    const buttonStyle = {
        backgroundColor: 'var(--primary-color)',
        color: 'var(--on-primary)',
        border: '1px solid var(--primary-color)',
        boxShadow: '0 8px 18px rgba(15, 23, 42, 0.08)',
    };

    const selectStyle = {
        backgroundColor: 'var(--surface-soft)',
        color: 'var(--page-text)',
        border: '1px solid var(--surface-border)',
    };

    function handleSaved() {
        setFormModal(null);
        setSelected(null);
    }

    return (
        <div className="space-y-5 mx-auto max-w-7xl" style={{ color: 'var(--page-text)' }}>
            <header className="flex flex-col gap-4 rounded-2xl border p-5 shadow-sm md:flex-row md:items-center md:justify-between" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em]" style={{ color: 'var(--sub-text)' }}>Compliance</p>
                    <h1 className="mt-1 text-2xl font-semibold" style={{ color: 'var(--page-text)' }}>พ.ร.บ. ภาษี และประกัน</h1>
                </div>

                <button
                    onClick={() => setFormModal({ mode: 'create' })}
                    className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:opacity-95"
                    style={buttonStyle}
                >
                    + เพิ่ม/ต่ออายุเอกสาร
                </button>
            </header>

            <section className="grid gap-4 md:grid-cols-3">
                {stats.map((item) => (
                    <div key={item.label} className="rounded-2xl border p-4 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                        <p className="flex items-center text-xs" style={{ color: 'var(--sub-text)' }}>
                            {item.label}
                            <InfoTooltip text={item.description} />
                        </p>
                        <div className="mt-2">
                            <span
                                className="text-2xl font-semibold"
                                style={{
                                    color:
                                        item.tone === 'danger'
                                            ? 'var(--status-danger)'
                                            : item.tone === 'warning'
                                                ? 'var(--status-warning)'
                                                : 'var(--status-success)',
                                }}
                            >
                                {item.value}
                            </span>
                        </div>
                    </div>
                ))}
            </section>

            <div className="rounded-2xl border p-4 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative w-full max-w-md">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--icon-muted)' }}>⌕</span>
                        <input
                            type="text"
                            aria-label="ค้นหาทะเบียนรถ"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="ค้นหาทะเบียนรถ"
                            className="w-full rounded-xl py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all duration-200"
                            style={{
                                backgroundColor: 'var(--surface-soft)',
                                color: 'var(--page-text)',
                                border: '1px solid var(--surface-border)',
                                boxShadow: 'none',
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'var(--primary-color)';
                                e.target.style.boxShadow = '0 0 0 3px var(--primary-color-soft)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'var(--surface-border)';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <select aria-label="กรองตามประเภทเอกสาร" value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="rounded-xl px-3 py-2 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft)" style={selectStyle}>
                            <option value="">ทุกประเภทเอกสาร</option>
                            {Object.entries(DOCUMENT_TYPE_META).map(([type, m]) => (
                                <option key={type} value={type}>{m.label}</option>
                            ))}
                        </select>
                        <select aria-label="กรองตามสถานะเอกสาร" value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl px-3 py-2 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft)" style={selectStyle}>
                            <option value="">ทุกสถานะ</option>
                            <option value="expired">หมดอายุแล้ว</option>
                            <option value="expiring">ใกล้หมดอายุ (30 วัน)</option>
                            <option value="valid">ปกติ</option>
                        </select>
                        <div className="text-sm whitespace-nowrap" style={{ color: 'var(--sub-text)' }}>{documents.length} รายการ</div>
                    </div>
                </div>

                {errorMessage && <p role="alert" className="mb-4 text-sm" style={{ color: 'var(--status-danger)' }}>{errorMessage}</p>}

                <div className="overflow-x-auto rounded-xl border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                    <table className="w-full min-w-180 text-sm" style={{ color: 'var(--page-text)' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--surface-soft)', borderBottom: '1px solid var(--surface-border)', color: 'var(--sub-text)' }}>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>ทะเบียน</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>ประเภทเอกสาร</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>ผู้ให้บริการ</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>ชำระล่าสุด</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>วันหมดอายุ</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>สถานะ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && (
                                <tr>
                                    <td colSpan={6} role="status" className="px-4 py-10 text-center" style={{ color: 'var(--sub-text)', opacity: 0.75 }}>
                                        กำลังโหลด...
                                    </td>
                                </tr>
                            )}

                            {!isLoading && documents.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center" style={{ color: 'var(--sub-text)', opacity: 0.75 }}>
                                        ไม่พบข้อมูลเอกสาร
                                    </td>
                                </tr>
                            )}

                            {!isLoading && documents.map((d) => {
                                const rowStatus = documentStatusStyle(d.days_remaining);
                                return (
                                    <tr
                                        key={`${d.document_type}-${d.document_id}`}
                                        onClick={() => setSelected({ documentType: d.document_type, documentId: d.document_id })}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected({ documentType: d.document_type, documentId: d.document_id }); } }}
                                        tabIndex={0}
                                        aria-label={`ดูรายละเอียด${DOCUMENT_TYPE_META[d.document_type]?.label ?? 'เอกสาร'} ทะเบียน ${d.plate_number}`}
                                        className="cursor-pointer transition-colors duration-150 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-(--primary-color-soft)"
                                        style={{ borderBottom: '1px solid var(--surface-border)', backgroundColor: 'transparent' }}
                                    >
                                        <td className="px-4 py-3">
                                            <PlateBadge plateNumber={d.plate_number} plateProvince={d.plate_province} />
                                        </td>
                                        <td className="px-4 py-3" style={{ color: 'var(--sub-text)' }}>{DOCUMENT_TYPE_META[d.document_type]?.label}</td>
                                        <td className="px-4 py-3" style={{ color: 'var(--sub-text)' }}>{d.provider || '-'}</td>
                                        <td className="px-4 py-3" style={{ color: 'var(--sub-text)' }}>{formatDate(d.last_paid_date)}</td>
                                        <td className="px-4 py-3" style={{ color: 'var(--sub-text)' }}>{formatDate(d.expire_date)}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium" style={{ backgroundColor: rowStatus.bg, color: rowStatus.color }}>
                                                {rowStatus.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {selected && (
                <DocumentDetailModal
                    documentType={selected.documentType}
                    documentId={selected.documentId}
                    onClose={() => setSelected(null)}
                    onRenew={(document) => setFormModal({ mode: 'renew', renewFrom: document })}
                    onEdit={(document) => setFormModal({ mode: 'edit', document })}
                    onDeleted={handleSaved}
                />
            )}

            {formModal && (
                <DocumentFormModal
                    mode={formModal.mode}
                    document={formModal.document}
                    renewFrom={formModal.renewFrom}
                    onClose={() => setFormModal(null)}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
}
