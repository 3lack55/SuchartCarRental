import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/auth/useAuth.js';
import { useDocumentSummary } from '../../services/documents/documentsQueries.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import InfoTooltip from '../../components/globals/InfoTooltip.jsx';
import Select from '../../components/globals/Select.jsx';
import PlateBadge from '../../components/globals/PlateBadge.jsx';
import Pagination from '../../components/globals/Pagination.jsx';
import Modal from '../../components/globals/Modal.jsx';
import DocumentDetailModal from '../../components/documents/DocumentDetailModal.jsx';
import DocumentFormModal from '../../components/documents/DocumentFormModal.jsx';
import { DOCUMENT_TYPE_META, documentStatusStyle } from '../../components/documents/documentMeta.js';
import { usePagination } from '../../hooks/usePagination.js';
import { getDuplicatePlateNumbers } from '../../utils/plateCollision.js';

function formatDate(value) {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

const DOCUMENT_STATUS_OPTIONS = ['expired', 'expiring', 'valid'];

function subDocMatchesStatus(sub, status) {
    if (!sub) return false;
    if (status === 'expired') return sub.days_remaining < 0;
    if (status === 'expiring') return sub.days_remaining >= 0 && sub.days_remaining <= 30;
    if (status === 'valid') return sub.days_remaining > 30;
    return true;
}

export default function DocumentsPage() {
    const [searchParams] = useSearchParams();
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebouncedValue(search, 300);
    const [status, setStatus] = useState(() => {
        const value = searchParams.get('status');
        return DOCUMENT_STATUS_OPTIONS.includes(value) ? value : '';
    });
    // มาจากทางลัดหน้าภาพรวม เช่น "พรบ.และภาษี ใกล้หมดอายุ" (?type=act_tax&status=expiring) — ตารางรวมเป็นแถวเดียวต่อรถแล้ว
    // จึงไม่มี dropdown ให้เลือกประเภทเอกสารเหมือนเดิม แต่ยังต้องกรองประเภทนั้นๆ โดยเฉพาะได้ (ไม่ใช่กรองรวมทั้ง 2 ประเภท)
    // เคลียร์ได้ผ่าน chip ที่โชว์ใกล้ช่องค้นหาเมื่อมีตัวกรองนี้ทำงานอยู่
    const [documentType, setDocumentType] = useState(() => {
        const value = searchParams.get('type');
        return value && DOCUMENT_TYPE_META[value] ? value : '';
    });
    const [selected, setSelected] = useState(null); // { documentType, documentId }
    const [formModal, setFormModal] = useState(null); // { mode: 'create' | 'renew' | 'add' | 'edit', renewFrom?, document? }
    const [successMessage, setSuccessMessage] = useState('');

    const { user } = useAuth();

    const { data, isLoading, error } = useDocumentSummary({ search: debouncedSearch });
    const allRows = useMemo(() => data?.data ?? [], [data]);
    const rows = useMemo(() => {
        let result = allRows;
        if (documentType) {
            result = result.filter((r) => (status ? subDocMatchesStatus(r[documentType], status) : r[documentType]));
        } else if (status) {
            result = result.filter((r) => subDocMatchesStatus(r.act_tax, status) || subDocMatchesStatus(r.insurance, status));
        }
        return result;
    }, [allRows, status, documentType]);
    const errorMessage = !user?.token ? 'กรุณาเข้าสู่ระบบก่อนใช้งาน' : error?.message;
    const { page, setPage, totalPages, pageItems: pagedRows } = usePagination(rows);
    const duplicatePlateNumbers = useMemo(() => getDuplicatePlateNumbers(rows), [rows]);

    // นับจากเอกสารแต่ละประเภทที่มีอยู่จริง (ไม่ใช่นับจำนวนรถ) ให้ตรงกับความหมายเดิมของสถิติ
    const visibleSubDocs = useMemo(() => rows.flatMap((r) => [r.act_tax, r.insurance]).filter(Boolean), [rows]);
    const expiredCount = visibleSubDocs.filter((d) => d.days_remaining < 0).length;
    const expiringCount = visibleSubDocs.filter((d) => d.days_remaining >= 0 && d.days_remaining <= 30).length;
    const validCount = visibleSubDocs.filter((d) => d.days_remaining > 30).length;

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

    function handleSaved(message = 'บันทึกข้อมูลเอกสารเรียบร้อย') {
        setSuccessMessage(message);
        setFormModal(null);
        setSelected(null);
    }

    function handleDeleted() {
        setSuccessMessage('ลบเอกสารเรียบร้อย');
        setSelected(null);
    }

    function closeSuccessModal() {
        setSuccessMessage('');
    }

    function openDocumentType(row, documentType) {
        const sub = row[documentType];
        if (sub) {
            setSelected({ documentType, documentId: sub.document_id });
        } else {
            setFormModal({
                mode: 'add',
                renewFrom: {
                    vehicle_id: row.vehicle_id,
                    plate_number: row.plate_number,
                    plate_province: row.plate_province,
                    document_type: documentType,
                },
            });
        }
    }

    function renderTypeCells(row, documentType) {
        const sub = row[documentType];
        const label = DOCUMENT_TYPE_META[documentType].label;
        const cellStyle = { cursor: 'pointer' };
        const handleClick = () => openDocumentType(row, documentType);
        const handleKeyDown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } };
        const ariaLabel = sub
            ? `ดูรายละเอียด${label} ทะเบียน ${row.plate_number}`
            : `เพิ่ม${label} ทะเบียน ${row.plate_number}`;

        return (
            <>
                <td
                    className="px-4 py-3 transition-colors duration-150 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-(--primary-color-soft)"
                    style={{ ...cellStyle, color: 'var(--sub-text)' }}
                    role="button"
                    tabIndex={0}
                    aria-label={ariaLabel}
                    onClick={handleClick}
                    onKeyDown={handleKeyDown}
                >
                    {sub ? formatDate(sub.expire_date) : '-'}
                </td>
                <td
                    className="px-4 py-3 transition-colors duration-150 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-(--primary-color-soft)"
                    style={cellStyle}
                    role="button"
                    tabIndex={0}
                    aria-label={ariaLabel}
                    onClick={handleClick}
                    onKeyDown={handleKeyDown}
                >
                    {sub ? (
                        (() => {
                            const rowStatus = documentStatusStyle(sub.days_remaining);
                            return (
                                <div className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium truncate" style={{ backgroundColor: rowStatus.bg, color: rowStatus.color }}>
                                    {rowStatus.label}
                                </div>
                            );
                        })()
                    ) : (
                        <div className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium" style={{ backgroundColor: 'var(--status-danger-soft)', color: 'var(--status-danger)' }}>
                            ยังไม่มีข้อมูล · เพิ่ม
                        </div>
                    )}
                </td>
            </>
        );
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
                        {documentType && (
                            <button
                                type="button"
                                onClick={() => setDocumentType('')}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
                                style={{ backgroundColor: 'var(--primary-color-soft)', color: 'var(--on-primary)' }}
                            >
                                ประเภท: {DOCUMENT_TYPE_META[documentType].label}
                                <span aria-hidden="true">✕</span>
                            </button>
                        )}
                        <Select
                            id="document-status-filter"
                            ariaLabel="กรองตามสถานะเอกสาร"
                            className="w-44"
                            value={status}
                            onChange={setStatus}
                            options={[
                                { value: '', label: 'ทุกสถานะ' },
                                { value: 'expired', label: 'หมดอายุแล้ว' },
                                { value: 'expiring', label: 'ใกล้หมดอายุ (30 วัน)' },
                                { value: 'valid', label: 'ปกติ' },
                            ]}
                        />
                        <div className="text-sm whitespace-nowrap" style={{ color: 'var(--sub-text)' }}>{rows.length} คัน</div>
                    </div>
                </div>

                {errorMessage && <p role="alert" className="mb-4 text-sm" style={{ color: 'var(--status-danger)' }}>{errorMessage}</p>}

                <div className="overflow-x-auto rounded-xl border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                    <table className="w-full min-w-180 text-sm" style={{ color: 'var(--page-text)' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--surface-soft)', borderBottom: '1px solid var(--surface-border)', color: 'var(--sub-text)' }}>
                                <th rowSpan={2} className="px-4 py-3 text-left align-middle font-medium" style={{ color: 'var(--sub-text)' }}>ทะเบียน</th>
                                <th colSpan={2} className="border-l px-4 py-2 text-center font-medium" style={{ color: 'var(--sub-text)', borderColor: 'var(--surface-border)' }}>{DOCUMENT_TYPE_META.act_tax.label}</th>
                                <th colSpan={2} className="border-l px-4 py-2 text-center font-medium" style={{ color: 'var(--sub-text)', borderColor: 'var(--surface-border)' }}>{DOCUMENT_TYPE_META.insurance.label}</th>
                            </tr>
                            <tr style={{ backgroundColor: 'var(--surface-soft)', borderBottom: '1px solid var(--surface-border)', color: 'var(--sub-text)' }}>
                                <th className="border-l px-4 py-2 text-left font-medium" style={{ color: 'var(--sub-text)', borderColor: 'var(--surface-border)' }}>วันหมดอายุ</th>
                                <th className="px-4 py-2 text-left font-medium" style={{ color: 'var(--sub-text)' }}>สถานะ</th>
                                <th className="border-l px-4 py-2 text-left font-medium" style={{ color: 'var(--sub-text)', borderColor: 'var(--surface-border)' }}>วันหมดอายุ</th>
                                <th className="px-4 py-2 text-left font-medium" style={{ color: 'var(--sub-text)' }}>สถานะ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && (
                                <tr>
                                    <td colSpan={5} role="status" className="px-4 py-10 text-center" style={{ color: 'var(--sub-text)', opacity: 0.75 }}>
                                        กำลังโหลด...
                                    </td>
                                </tr>
                            )}

                            {!isLoading && rows.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center" style={{ color: 'var(--sub-text)', opacity: 0.75 }}>
                                        ไม่พบข้อมูลเอกสาร
                                    </td>
                                </tr>
                            )}

                            {!isLoading && pagedRows.map((row) => (
                                <tr key={row.vehicle_id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                                    <td className="px-4 py-3 ">
                                        <PlateBadge plateNumber={row.plate_number} plateProvince={row.plate_province} duplicate={duplicatePlateNumbers.has(row.plate_number)} />
                                    </td>
                                    {renderTypeCells(row, 'act_tax')}
                                    {renderTypeCells(row, 'insurance')}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>

            {selected && (
                <DocumentDetailModal
                    documentType={selected.documentType}
                    documentId={selected.documentId}
                    onClose={() => setSelected(null)}
                    onRenew={(document) => setFormModal({ mode: 'renew', renewFrom: document })}
                    onEdit={(document) => setFormModal({ mode: 'edit', document })}
                    onDeleted={handleDeleted}
                />
            )}

            {formModal && (
                <DocumentFormModal
                    mode={formModal.mode}
                    document={formModal.document}
                    renewFrom={formModal.renewFrom}
                    onClose={() => setFormModal(null)}
                    onSaved={(_saved, message) => handleSaved(message)}
                />
            )}

            {successMessage && (
                <Modal title="สำเร็จ" onClose={closeSuccessModal} maxWidth="max-w-md">
                    <div className="p-5">
                        <p className="text-sm" style={{ color: 'var(--page-text)' }}>{successMessage}</p>
                        <div className="mt-5 flex justify-end">
                            <button
                                type="button"
                                onClick={closeSuccessModal}
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
