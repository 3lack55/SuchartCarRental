import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/auth/useAuth.js';
import { useMaintenances } from '../../services/maintenances/maintenancesQueries.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import MaintenanceDetailModal from '../../components/mainntenances/MaintenanceDetailModal.jsx';
import MaintenanceFormModal from '../../components/mainntenances/MaintenanceFormModal.jsx';
import InfoTooltip from '../../components/globals/InfoTooltip.jsx';
import Select from '../../components/globals/Select.jsx';
import PlateBadge from '../../components/globals/PlateBadge.jsx';
import Pagination from '../../components/globals/Pagination.jsx';
import { usePagination } from '../../hooks/usePagination.js';

function formatDate(value) {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

function endOfDay(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}

// คำนวณช่วงวันที่ตามตัวเลือก: สัปดาห์นี้ (จันทร์-ปัจจุบัน), เดือนนี้ (วันที่ 1-ปัจจุบัน), ปีนี้ (1 ม.ค.-ปัจจุบัน), หรือกำหนดเอง
function getPeriodRange(period, customStart, customEnd) {
    const now = new Date();

    if (period === 'week') {
        const day = now.getDay();
        const diffToMonday = day === 0 ? 6 : day - 1;
        const start = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday));
        return { start, end: endOfDay(now) };
    }
    if (period === 'month') {
        return { start: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)), end: endOfDay(now) };
    }
    if (period === 'year') {
        return { start: startOfDay(new Date(now.getFullYear(), 0, 1)), end: endOfDay(now) };
    }
    if (period === 'custom') {
        return {
            start: customStart ? startOfDay(customStart) : null,
            end: customEnd ? endOfDay(customEnd) : null,
        };
    }
    return { start: null, end: null };
}

const PERIOD_OPTIONS = ['all', 'week', 'month', 'year', 'custom'];

export default function MaintenancesPage() {
    const [searchParams] = useSearchParams();
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebouncedValue(search, 300);
    const [garageTypeFilter, setGarageTypeFilter] = useState('');
    // มาจากหน้าภาพรวมพร้อมตัวกรอง เช่น ?period=month
    const [period, setPeriod] = useState(() => {
        const value = searchParams.get('period');
        return PERIOD_OPTIONS.includes(value) ? value : 'all';
    }); // 'all' | 'week' | 'month' | 'year' | 'custom'
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [formModal, setFormModal] = useState(null);

    const { user } = useAuth();

    const { data, isLoading, error } = useMaintenances({ search: debouncedSearch });
    const allMaintenances = data?.data ?? [];
    const { start: periodStart, end: periodEnd } = getPeriodRange(period, customStart, customEnd);
    const maintenances = allMaintenances.filter((m) => {
        if (garageTypeFilter && m.garage_type !== garageTypeFilter) return false;
        if (periodStart || periodEnd) {
            const serviceDate = new Date(m.service_date);
            if (periodStart && serviceDate < periodStart) return false;
            if (periodEnd && serviceDate > periodEnd) return false;
        }
        return true;
    });
    const errorMessage = !user?.token ? 'กรุณาเข้าสู่ระบบก่อนใช้งาน' : error?.message;
    const { page, setPage, totalPages, pageItems: pagedMaintenances } = usePagination(maintenances);

    const totalItems = maintenances.reduce((sum, item) => sum + Number(item.total_items || 0), 0);
    const totalCost = maintenances.reduce((sum, item) => sum + Number(item.total_cost || 0), 0);

    const stats = [
        { label: 'ทั้งหมด', value: maintenances.length, tone: 'primary', description: 'จำนวนใบซ่อมบำรุงทั้งหมดในระบบ' },
        { label: 'รายการ', value: totalItems, tone: 'success', description: 'จำนวนรายการซ่อมย่อยรวมทุกใบซ่อม' },
        { label: 'ค่าใช้จ่าย', value: `฿${totalCost.toLocaleString()}`, tone: 'yellow', description: 'ยอดค่าใช้จ่ายรวมของทุกใบซ่อม' },
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
                    <p className="text-xs font-medium uppercase tracking-[0.18em]" style={{ color: 'var(--sub-text)' }}>Service</p>
                    <h1 className="mt-1 text-2xl font-semibold" style={{ color: 'var(--page-text)' }}>การซ่อมบำรุง</h1>
                </div>

                <button
                    onClick={() => setFormModal({ mode: 'create' })}
                    className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:opacity-95"
                    style={buttonStyle}
                >
                    + บันทึกการซ่อม
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
                                                : '#F2952C',
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
                            aria-label="ค้นหาชื่อศูนย์/อู่ หรือทะเบียนรถ"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="ค้นหาชื่อศูนย์/อู่ หรือทะเบียนรถ"
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
                            id="maintenance-period-filter"
                            ariaLabel="กรองตามช่วงเวลา"
                            className="w-40"
                            value={period}
                            onChange={setPeriod}
                            options={[
                                { value: 'all', label: 'ทุกช่วงเวลา' },
                                { value: 'week', label: 'สัปดาห์นี้' },
                                { value: 'month', label: 'เดือนนี้' },
                                { value: 'year', label: 'ปีนี้' },
                                { value: 'custom', label: 'กำหนดเอง...' },
                            ]}
                        />

                        {period === 'custom' && (
                            <>
                                <input
                                    type="date"
                                    aria-label="วันที่เริ่มต้น"
                                    value={customStart}
                                    onChange={(e) => setCustomStart(e.target.value)}
                                    className="rounded-xl px-3 py-2 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft)"
                                    style={{ backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', border: '1px solid var(--surface-border)' }}
                                />
                                <span className="text-sm" style={{ color: 'var(--sub-text)' }}>ถึง</span>
                                <input
                                    type="date"
                                    aria-label="วันที่สิ้นสุด"
                                    value={customEnd}
                                    onChange={(e) => setCustomEnd(e.target.value)}
                                    className="rounded-xl px-3 py-2 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft)"
                                    style={{ backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', border: '1px solid var(--surface-border)' }}
                                />
                            </>
                        )}

                        <Select
                            id="maintenance-garage-type-filter"
                            ariaLabel="กรองตามประเภทสถานที่"
                            className="w-44"
                            value={garageTypeFilter}
                            onChange={setGarageTypeFilter}
                            options={[
                                { value: '', label: 'ทุกประเภทสถานที่' },
                                { value: 'center', label: 'ศูนย์บริการ' },
                                { value: 'shop', label: 'อู่ทั่วไป' },
                            ]}
                        />
                        <div className="text-sm whitespace-nowrap" style={{ color: 'var(--sub-text)' }}>{maintenances.length} รายการ</div>
                    </div>
                </div>

                {errorMessage && <p role="alert" className="mb-4 text-sm" style={{ color: 'var(--status-danger)' }}>{errorMessage}</p>}

                <div className="overflow-x-auto rounded-xl border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                    <table className="w-full min-w-180 text-sm" style={{ color: 'var(--page-text)' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--surface-soft)', borderBottom: '1px solid var(--surface-border)', color: 'var(--sub-text)' }}>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>วันที่</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>รถ</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>รุ่น</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>ศูนย์/อู่</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>จำนวนรายการ</th>
                                <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--sub-text)' }}>ยอดรวม</th>
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

                            {!isLoading && maintenances.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center" style={{ color: 'var(--sub-text)', opacity: 0.75 }}>
                                        ไม่พบข้อมูลการซ่อมบำรุง
                                    </td>
                                </tr>
                            )}

                            {!isLoading && pagedMaintenances.map((m) => (
                                <tr
                                    key={m.maintenance_id}
                                    onClick={() => setSelectedId(m.maintenance_id)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedId(m.maintenance_id); } }}
                                    tabIndex={0}
                                    aria-label={`ดูรายละเอียดใบซ่อมรถทะเบียน ${m.plate_number} วันที่ ${formatDate(m.service_date)}`}
                                    className="cursor-pointer transition-colors duration-150 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-(--primary-color-soft)"
                                    style={{ borderBottom: '1px solid var(--surface-border)', backgroundColor: 'transparent' }}
                                >
                                    <td className="px-4 py-3" style={{ color: 'var(--sub-text)' }}>{formatDate(m.service_date)}</td>
                                    <td className="px-4 py-3">
                                        <PlateBadge plateNumber={m.plate_number} plateProvince={m.plate_province} />
                                    </td>
                                    <td className="px-4 py-3" style={{ color: 'var(--sub-text)' }}>{m.model}</td>
                                    <td className="px-4 py-3" style={{ color: 'var(--sub-text)' }}>{m.garage_name}</td>
                                    <td className="px-4 py-3" style={{ color: 'var(--sub-text)' }}>{m.total_items} รายการ</td>
                                    <td className="px-4 py-3 text-right font-medium" style={{ color: 'var(--page-text)' }}>฿{Number(m.total_cost).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>

            {selectedId && (
                <MaintenanceDetailModal
                    maintenanceId={selectedId}
                    onClose={() => setSelectedId(null)}
                    onEdit={(maintenance) => setFormModal({ mode: 'edit', maintenance })}
                    onDeleted={handleSaved}
                />
            )}

            {formModal && (
                <MaintenanceFormModal
                    maintenance={formModal.mode === 'edit' ? formModal.maintenance : undefined}
                    onClose={() => setFormModal(null)}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
}
