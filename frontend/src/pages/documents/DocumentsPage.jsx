import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../context/auth/useAuth.js';
import { useDocumentSummary, useDocumentYearlyCost } from '../../services/documents/documentsQueries.js';
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

function formatCurrency(value) {
    return Number(value ?? 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
    const { data: yearlyCostData, isLoading: yearlyCostLoading } = useDocumentYearlyCost();
    const yearlyCostRows = useMemo(() => yearlyCostData?.data ?? [], [yearlyCostData]);
    const {
        page: yearlyCostPage,
        setPage: setYearlyCostPage,
        totalPages: yearlyCostTotalPages,
        pageItems: pagedYearlyCostRows,
    } = usePagination(yearlyCostRows, 5);
    // ค่าเริ่มต้นย่อไว้เป็นการ์ดสรุปแค่ปีปัจจุบัน กันตารางทั้งหมดกินพื้นที่หน้าจอโดยไม่จำเป็น กดขยายดูย้อนหลังทีหลังได้
    const [yearlyCostExpanded, setYearlyCostExpanded] = useState(false);
    const currentYear = new Date().getFullYear();
    const currentYearCost = yearlyCostRows.find((row) => row.year === currentYear)
        ?? { year: currentYear, act_tax_cost: 0, insurance_cost: 0, total_cost: 0 };
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

    // การ์ดสรุปด้านบนเป็น KPI คงที่ ไม่ขึ้นกับตัวกรอง/ค้นหาใดๆ (ตัวเลขที่แสดงจริงตามตัวกรองอยู่ที่ "N รายการ" ข้างช่องค้นหาแทน)
    // จึงต้องดึงเอกสารทั้งหมดแยกต่างหาก ไม่ผ่าน search และนับจากเอกสารแต่ละประเภทที่มีอยู่จริง (ไม่ใช่นับจำนวนรถ)
    const { data: allRowsData } = useDocumentSummary({});
    const globalRows = useMemo(() => allRowsData?.data ?? [], [allRowsData]);
    const visibleSubDocs = useMemo(() => globalRows.flatMap((r) => [r.act_tax, r.insurance]).filter(Boolean), [globalRows]);
    const expiredCount = visibleSubDocs.filter((d) => d.days_remaining < 0).length;
    const expiringCount = visibleSubDocs.filter((d) => d.days_remaining >= 0 && d.days_remaining <= 30).length;
    const validCount = visibleSubDocs.filter((d) => d.days_remaining > 30).length;

    const activeFilterCount = (documentType ? 1 : 0) + (status ? 1 : 0);
    function clearAllFilters() {
        setDocumentType('');
        setStatus('');
    }

    const stats = [
        {
            label: 'หมดอายุแล้ว', value: expiredCount, tone: 'danger', description: 'เอกสารที่หมดอายุไปแล้วและยังไม่ต่ออายุ',
            onClick: () => setStatus((prev) => (prev === 'expired' ? '' : 'expired')),
        },
        {
            label: 'ใกล้หมดอายุ', value: expiringCount, tone: 'warning', description: 'เอกสารที่จะหมดอายุภายใน 30 วัน',
            onClick: () => setStatus((prev) => (prev === 'expiring' ? '' : 'expiring')),
        },
        {
            label: 'ปกติ', value: validCount, tone: 'success', description: 'เอกสารที่ยังไม่ใกล้หมดอายุ',
            onClick: () => setStatus((prev) => (prev === 'valid' ? '' : 'valid')),
        },
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
                    className="px-4 py-3 transition-colors duration-150 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-(--primary-color-soft) border-l"
                    style={{ ...cellStyle, color: 'var(--sub-text)', borderColor: 'var(--surface-border)' }}
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
                <td
                    className="px-4 py-3 text-right transition-colors duration-150 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-(--primary-color-soft)"
                    style={{ ...cellStyle, color: 'var(--sub-text)' }}
                    role="button"
                    tabIndex={0}
                    aria-label={ariaLabel}
                    onClick={handleClick}
                    onKeyDown={handleKeyDown}
                >
                    {sub && sub.amount != null ? `฿ ${formatCurrency(sub.amount)}` : 'ไม่ได้ระบุ'}
                </td>
            </>
        );
    }

    return (
        <div className="space-y-5 mx-auto max-w-7xl" style={{ color: 'var(--page-text)' }}>
            <header className="flex flex-col gap-4 rounded-lg border p-5 shadow-sm md:flex-row md:items-center md:justify-between" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em]" style={{ color: 'var(--sub-text)' }}>Compliance</p>
                    <h1 className="mt-1 text-2xl font-semibold" style={{ color: 'var(--page-text)' }}>พ.ร.บ. ภาษี และประกัน</h1>
                </div>

                <button
                    onClick={() => setFormModal({ mode: 'create' })}
                    className="cursor-pointer rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:opacity-95"
                    style={buttonStyle}
                >
                    + เพิ่ม/ต่ออายุเอกสาร
                </button>
            </header>

            <div className="rounded-lg border p-4 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center">
                        <h2 className="text-sm font-semibold" style={{ color: 'var(--page-text)' }}>ค่าใช้จ่ายต่ออายุเอกสารรายปี</h2>
                        <InfoTooltip text="สรุปยอดชำระตามปีที่จ่ายเงินจริง (วันที่ชำระล่าสุด) รายการเก่าที่ไม่มียอดชำระบันทึกไว้จะนับเป็น 0 บาท" />
                    </div>
                    <button
                        type="button"
                        onClick={() => setYearlyCostExpanded((prev) => !prev)}
                        className="flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:opacity-80"
                        style={{ backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', border: '1px solid var(--surface-border)' }}
                    >
                        {yearlyCostExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {yearlyCostExpanded ? 'ย่อเป็นสรุปปีนี้' : 'ดูย้อนหลังทุกปี'}
                    </button>
                </div>

                {!yearlyCostExpanded && (
                    <div className="rounded-md border p-4" style={{ backgroundColor: 'var(--surface-soft)', borderColor: 'var(--surface-border)' }}>
                        <p className="mb-3 text-xs" style={{ color: 'var(--sub-text)' }}>สรุปปี {currentYearCost.year}</p>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <p className="text-xs" style={{ color: 'var(--sub-text)' }}>ค่าใช้จ่าย พ.ร.บ./ภาษี</p>
                                <p className="mt-1 text-xl font-semibold" style={{ color: 'var(--page-text)' }}>฿ {formatCurrency(currentYearCost.act_tax_cost)}</p>
                            </div>
                            <div>
                                <p className="text-xs" style={{ color: 'var(--sub-text)' }}>ค่าใช้จ่ายประกัน</p>
                                <p className="mt-1 text-xl font-semibold" style={{ color: 'var(--page-text)' }}>฿ {formatCurrency(currentYearCost.insurance_cost)}</p>
                            </div>
                            <div>
                                <p className="text-xs" style={{ color: 'var(--sub-text)' }}>รวม</p>
                                <p className="mt-1 text-xl font-semibold" style={{ color: 'var(--page-text)' }}>฿ {formatCurrency(currentYearCost.total_cost)}</p>
                            </div>
                        </div>
                    </div>
                )}

                {yearlyCostExpanded && (
                    <>
                        <div className="overflow-x-auto rounded-xl border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                            <table className="w-full min-w-md text-sm" style={{ color: 'var(--page-text)' }}>
                                <thead>
                                    <tr style={{ backgroundColor: 'var(--surface-soft)', borderBottom: '1px solid var(--surface-border)', color: 'var(--sub-text)' }}>
                                        <th className="px-4 py-3 text-left font-medium">ปี</th>
                                        <th className="px-4 py-3 text-right font-medium">ค่าใช้จ่าย พ.ร.บ./ภาษี</th>
                                        <th className="px-4 py-3 text-right font-medium">ค่าใช้จ่ายประกัน</th>
                                        <th className="px-4 py-3 text-right font-medium">รวม</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {yearlyCostLoading && (
                                        <tr>
                                            <td colSpan={4} role="status" className="px-4 py-8 text-center" style={{ color: 'var(--sub-text)', opacity: 0.75 }}>กำลังโหลด...</td>
                                        </tr>
                                    )}
                                    {!yearlyCostLoading && yearlyCostRows.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center" style={{ color: 'var(--sub-text)', opacity: 0.75 }}>ยังไม่มีข้อมูล</td>
                                        </tr>
                                    )}
                                    {!yearlyCostLoading && pagedYearlyCostRows.map((row) => (
                                        <tr key={row.year} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                                            <td className="px-4 py-3 font-medium">{row.year}</td>
                                            <td className="px-4 py-3 text-right" style={{ color: 'var(--sub-text)' }}>฿ {formatCurrency(row.act_tax_cost)}</td>
                                            <td className="px-4 py-3 text-right" style={{ color: 'var(--sub-text)' }}>฿ {formatCurrency(row.insurance_cost)}</td>
                                            <td className="px-4 py-3 text-right font-semibold">฿ {formatCurrency(row.total_cost)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {yearlyCostTotalPages > 1 && (
                            <Pagination page={yearlyCostPage} totalPages={yearlyCostTotalPages} onPageChange={setYearlyCostPage} />
                        )}
                    </>
                )}
            </div>

            <div className="rounded-lg border p-4 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                <section className="grid gap-4 md:grid-cols-3 mb-8">
                    {stats.map((item) => (
                        <button
                            type="button"
                            key={item.label}
                            onClick={item.onClick}
                            className="cursor-pointer rounded-md p-4 text-left shadow-sm transition-opacity duration-150 hover:opacity-80"
                            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}
                        >
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
                        </button>
                    ))}
                </section>

                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <div className="relative w-full min-w-0 flex-1 sm:max-w-md">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--icon-muted)' }}>⌕</span>
                        <input
                            type="text"
                            aria-label="ค้นหาทะเบียนรถ"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="ค้นหาทะเบียนรถ"
                            className="w-full rounded-md py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all duration-200"
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

                    <div className="flex flex-wrap items-center gap-3">
                        {activeFilterCount > 0 && (
                            <button
                                type="button"
                                onClick={clearAllFilters}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
                                style={{ backgroundColor: 'var(--primary-color-soft)', color: 'var(--on-primary)' }}
                            >
                                ล้างตัวกรอง ({activeFilterCount})
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

                <div className="overflow-x-auto rounded-md border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                    <table className="w-full min-w-240 text-sm" style={{ color: 'var(--page-text)' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--surface-soft)', borderBottom: '1px solid var(--surface-border)', color: 'var(--sub-text)' }}>
                                <th rowSpan={2} className="px-4 py-3 text-left align-middle font-medium" style={{ color: 'var(--sub-text)' }}>ทะเบียน</th>
                                <th colSpan={3} className="border-l px-4 py-2 text-center font-medium" style={{ color: 'var(--sub-text)', borderColor: 'var(--surface-border)' }}>{DOCUMENT_TYPE_META.act_tax.label}</th>
                                <th colSpan={3} className="border-l px-4 py-2 text-center font-medium" style={{ color: 'var(--sub-text)', borderColor: 'var(--surface-border)' }}>{DOCUMENT_TYPE_META.insurance.label}</th>
                            </tr>
                            <tr style={{ backgroundColor: 'var(--surface-soft)', borderBottom: '1px solid var(--surface-border)', color: 'var(--sub-text)' }}>
                                <th className="border-l px-4 py-2 text-left font-medium" style={{ color: 'var(--sub-text)', borderColor: 'var(--surface-border)' }}>วันหมดอายุ</th>
                                <th className="px-4 py-2 text-left font-medium" style={{ color: 'var(--sub-text)' }}>สถานะ</th>
                                <th className="px-4 py-2 text-right font-medium" style={{ color: 'var(--sub-text)' }}>ยอดชำระครั้งล่าสุด</th>
                                <th className="border-l px-4 py-2 text-left font-medium" style={{ color: 'var(--sub-text)', borderColor: 'var(--surface-border)' }}>วันหมดอายุ</th>
                                <th className="px-4 py-2 text-left font-medium" style={{ color: 'var(--sub-text)' }}>สถานะ</th>
                                <th className="px-4 py-2 text-right font-medium" style={{ color: 'var(--sub-text)' }}>ยอดชำระครั้งล่าสุด</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && (
                                <tr>
                                    <td colSpan={7} role="status" className="px-4 py-10 text-center" style={{ color: 'var(--sub-text)', opacity: 0.75 }}>
                                        กำลังโหลด...
                                    </td>
                                </tr>
                            )}

                            {!isLoading && rows.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-10 text-center" style={{ color: 'var(--sub-text)', opacity: 0.75 }}>
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
                    onRenew={(document) => { setSelected(null); setFormModal({ mode: 'renew', renewFrom: document }); }}
                    onEdit={(document) => { setSelected(null); setFormModal({ mode: 'edit', document }); }}
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
