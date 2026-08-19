import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/auth/useAuth.js';
import { useViolations } from '../../services/violations/violationsQueries.js';
import { useViolationReasons } from '../../services/lookups/lookupQueries.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import InfoTooltip from '../../components/globals/InfoTooltip.jsx';
import Select from '../../components/globals/Select.jsx';
import PlateBadge from '../../components/globals/PlateBadge.jsx';
import Pagination from '../../components/globals/Pagination.jsx';
import ViolationDetailModal from '../../components/violations/ViolationDetailModal.jsx';
import ViolationFormModal from '../../components/violations/ViolationFormModal.jsx';
import { usePagination } from '../../hooks/usePagination.js';

function formatDateTime(value) {
    if (!value) return '-';
    return new Date(value).toLocaleString('th-TH', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

const PERIOD_OPTIONS = ['all', 'week', 'month', 'year'];

// คำนวณช่วงวันที่ตามตัวเลือก: สัปดาห์นี้ (จันทร์-ปัจจุบัน), เดือนนี้ (วันที่ 1-ปัจจุบัน), ปีนี้ (1 ม.ค.-ปัจจุบัน)
function getPeriodRange(period) {
    const now = new Date();
    const endOfDay = (date) => { const d = new Date(date); d.setHours(23, 59, 59, 999); return d; };
    const startOfDay = (date) => { const d = new Date(date); d.setHours(0, 0, 0, 0); return d; };

    if (period === 'week') {
        const day = now.getDay();
        const diffToMonday = day === 0 ? 6 : day - 1;
        return { start: startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday)), end: endOfDay(now) };
    }
    if (period === 'month') {
        return { start: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)), end: endOfDay(now) };
    }
    if (period === 'year') {
        return { start: startOfDay(new Date(now.getFullYear(), 0, 1)), end: endOfDay(now) };
    }
    return { start: null, end: null };
}

export default function ViolationsPage() {
    const [searchParams] = useSearchParams();
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebouncedValue(search, 300);
    // มาจากหน้าภาพรวมพร้อมตัวกรอง เช่น ?paid=false หรือ ?period=month
    const [paidFilter, setPaidFilter] = useState(() => {
        const value = searchParams.get('paid');
        return value === 'true' || value === 'false' ? value : '';
    }); // '' | 'true' | 'false'
    const [reasonFilter, setReasonFilter] = useState('');
    const [period, setPeriod] = useState(() => {
        const value = searchParams.get('period');
        return PERIOD_OPTIONS.includes(value) ? value : 'all';
    }); // 'all' | 'week' | 'month' | 'year'
    const [selectedId, setSelectedId] = useState(null);
    const [formModal, setFormModal] = useState(null);

    const { user } = useAuth();
    const reasonsQuery = useViolationReasons();
    const reasons = reasonsQuery.data?.data ?? [];

    const { data, isLoading, error } = useViolations({
        search: debouncedSearch,
        isPaid: paidFilter === '' ? undefined : paidFilter === 'true',
    });
    const allViolations = data?.data ?? [];
    const { start: periodStart, end: periodEnd } = getPeriodRange(period);
    let violations = reasonFilter
        ? allViolations.filter((v) => String(v.reason_id) === reasonFilter)
        : allViolations;
    if (periodStart || periodEnd) {
        violations = violations.filter((v) => {
            const incidentDate = new Date(v.incident_datetime);
            if (periodStart && incidentDate < periodStart) return false;
            if (periodEnd && incidentDate > periodEnd) return false;
            return true;
        });
    }
    const errorMessage = !user?.token ? 'กรุณาเข้าสู่ระบบก่อนใช้งาน' : error?.message;
    const { page, setPage, totalPages, pageItems: pagedViolations } = usePagination(violations);

    const unpaid = violations.filter((v) => !v.is_paid);
    const unpaidTotal = unpaid.reduce((sum, v) => sum + Number(v.fine || 0), 0);

    const stats = [
        { label: 'ทั้งหมด', value: violations.length, tone: 'primary', description: 'จำนวนใบสั่งทั้งหมดในระบบ' },
        { label: 'ค้างจ่าย', value: unpaid.length, tone: 'danger', description: 'จำนวนใบสั่งที่ยังไม่ได้ชำระค่าปรับ' },
        { label: 'ยอดค้างจ่าย', value: `฿${unpaidTotal.toLocaleString()}`, tone: 'danger', description: 'ยอดรวมค่าปรับของใบสั่งที่ยังไม่จ่าย' },
    ];

    const buttonStyle = {
        backgroundColor: 'var(--primary-color)',
        color: 'var(--on-primary)',
        border: '1px solid var(--primary-color)',
        boxShadow: '0 8px 18px rgba(15, 23, 42, 0.08)',
    };

    function handleSaved() {
        setFormModal(null);
        setSelectedId(null);
    }

    return (
        <div className="space-y-5 mx-auto max-w-7xl" style={{ color: 'var(--page-text)' }}>
            <header className="flex flex-col gap-4 rounded-2xl border p-5 shadow-sm md:flex-row md:items-center md:justify-between" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em]" style={{ color: 'var(--sub-text)' }}>Compliance</p>
                    <h1 className="mt-1 text-2xl font-semibold" style={{ color: 'var(--page-text)' }}>การฝ่าฝืนกฎจราจร</h1>
                </div>

                <button
                    onClick={() => setFormModal({ mode: 'create' })}
                    className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:opacity-95"
                    style={buttonStyle}
                >
                    + บันทึกใบสั่ง
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
                                        item.tone === 'primary'
                                            ? 'var(--page-text)'
                                            : item.tone === 'success'
                                                ? 'var(--status-success)'
                                                : 'var(--status-danger)',
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
                            aria-label="ค้นหาชื่อคนขับ ทะเบียนรถ หรือสาเหตุ"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="ค้นหาชื่อคนขับ ทะเบียนรถ หรือสาเหตุ"
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
                        <Select
                            id="violation-paid-filter"
                            ariaLabel="กรองตามสถานะการจ่าย"
                            className="w-44"
                            value={paidFilter}
                            onChange={setPaidFilter}
                            options={[
                                { value: '', label: 'ทุกสถานะการจ่าย' },
                                { value: 'false', label: 'ยังไม่จ่าย' },
                                { value: 'true', label: 'จ่ายแล้ว' },
                            ]}
                        />
                        <Select
                            id="violation-reason-filter"
                            ariaLabel="กรองตามสาเหตุ"
                            className="w-44"
                            value={reasonFilter}
                            onChange={setReasonFilter}
                            options={[{ value: '', label: 'ทุกสาเหตุ' }, ...reasons.map((r) => ({ value: String(r.reason_id), label: r.reason_name }))]}
                        />
                        <Select
                            id="violation-period-filter"
                            ariaLabel="กรองตามช่วงเวลา"
                            className="w-40"
                            value={period}
                            onChange={setPeriod}
                            options={[
                                { value: 'all', label: 'ทุกช่วงเวลา' },
                                { value: 'week', label: 'สัปดาห์นี้' },
                                { value: 'month', label: 'เดือนนี้' },
                                { value: 'year', label: 'ปีนี้' },
                            ]}
                        />
                        <div className="text-sm whitespace-nowrap" style={{ color: 'var(--sub-text)' }}>{violations.length} รายการ</div>
                    </div>
                </div>

                {errorMessage && <p role="alert" className="mb-4 text-sm" style={{ color: 'var(--status-danger)' }}>{errorMessage}</p>}

                <div className="overflow-x-auto rounded-xl border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                    <table className="w-full min-w-180 text-sm" style={{ color: 'var(--page-text)' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--surface-soft)', borderBottom: '1px solid var(--surface-border)', color: 'var(--sub-text)' }}>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>วันที่/เวลา</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>คนขับ</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>รถ</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>สาเหตุ</th>
                                <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--sub-text)' }}>ค่าปรับ</th>
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

                            {!isLoading && violations.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center" style={{ color: 'var(--sub-text)', opacity: 0.75 }}>
                                        ไม่พบข้อมูลการฝ่าฝืน
                                    </td>
                                </tr>
                            )}

                            {!isLoading && pagedViolations.map((v) => (
                                <tr
                                    key={v.violation_id}
                                    onClick={() => setSelectedId(v.violation_id)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedId(v.violation_id); } }}
                                    tabIndex={0}
                                    aria-label={`ดูรายละเอียดใบสั่งของ ${v.driver_name} ทะเบียน ${v.plate_number}`}
                                    className="cursor-pointer transition-colors duration-150 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-(--primary-color-soft)"
                                    style={{ borderBottom: '1px solid var(--surface-border)', backgroundColor: 'transparent' }}
                                >
                                    <td className="px-4 py-3" style={{ color: 'var(--sub-text)' }}>{formatDateTime(v.incident_datetime)}</td>
                                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--page-text)' }}>{v.driver_name}</td>
                                    <td className="px-4 py-3">
                                        <PlateBadge plateNumber={v.plate_number} plateProvince={v.plate_province} />
                                    </td>
                                    <td className="px-4 py-3" style={{ color: 'var(--sub-text)' }}>{v.reason_name}</td>
                                    <td className="px-4 py-3 text-right font-medium" style={{ color: 'var(--page-text)' }}>฿{Number(v.fine).toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium truncate"
                                            style={v.is_paid
                                                ? { backgroundColor: 'var(--status-success-soft)', color: 'var(--status-success)' }
                                                : { backgroundColor: 'var(--status-danger-soft)', color: 'var(--status-danger)' }}
                                        >
                                            {v.is_paid ? 'จ่ายแล้ว' : 'ยังไม่จ่าย'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>

            {selectedId && (
                <ViolationDetailModal
                    violationId={selectedId}
                    onClose={() => setSelectedId(null)}
                    onEdit={(violation) => setFormModal({ mode: 'edit', violation })}
                    onDeleted={handleSaved}
                />
            )}

            {formModal && (
                <ViolationFormModal
                    violation={formModal.mode === 'edit' ? formModal.violation : undefined}
                    onClose={() => setFormModal(null)}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
}
