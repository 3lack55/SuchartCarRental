import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import DriverDetailModal from '../../components/driver/DriverDetailModal';
import DriverFormModal from '../../components/driver/DriverFormModal';
import Modal from '../../components/globals/Modal';
import Select from '../../components/globals/Select.jsx';
import InfoTooltip from '../../components/globals/InfoTooltip.jsx';
import Pagination from '../../components/globals/Pagination.jsx';
import { useDrivers } from '../../services/drivers/driversQueries.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { usePagination } from '../../hooks/usePagination.js';
import { useAuth } from '../../context/auth/useAuth';
import { formatPhone } from '../../utils/phone.js';
import { durationSince } from '../../utils/duration.js';

function initials(firstName, lastName) {
    return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
}

function formatDate(value) {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DriversPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebouncedValue(search, 300);
    const [unpaidFilter, setUnpaidFilter] = useState('');
    const [hiredThisYearFilter, setHiredThisYearFilter] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedDriverId, setSelectedDriverId] = useState(null);
    const [formModal, setFormModal] = useState(null);
    const { user } = useAuth();

    const { data, isLoading, error } = useDrivers({ search: debouncedSearch, includeInactive: false });
    const drivers = data?.data ?? [];
    const filteredDrivers = drivers.filter((d) => {
        if (unpaidFilter === 'unpaid' && Number(d.unpaid_violations_count) <= 0) return false;
        if (hiredThisYearFilter && !(d.hire_date && new Date(d.hire_date).getFullYear() === new Date().getFullYear())) return false;
        return true;
    });
    const errorMessage = !user?.token ? 'กรุณาเข้าสู่ระบบก่อนใช้งาน' : error?.message;
    const { page, setPage, totalPages, pageItems: pagedDrivers } = usePagination(filteredDrivers);

    // การ์ดสรุปด้านบนเป็น KPI คงที่ ไม่ขึ้นกับตัวกรอง/ค้นหาใดๆ (ตัวเลขที่แสดงจริงตามตัวกรองอยู่ที่ "N รายการ" ข้างช่องค้นหาแทน)
    // จึงต้องดึงข้อมูลคนขับที่ทำงานอยู่ทั้งหมดแยกต่างหาก ไม่ผ่าน search
    const { data: allDriversData } = useDrivers({ includeInactive: false });
    const allDrivers = allDriversData?.data ?? [];

    const unpaidDriversCount = allDrivers.filter((d) => Number(d.unpaid_violations_count) > 0).length;
    const hiredThisYearCount = allDrivers.filter((d) => d.hire_date && new Date(d.hire_date).getFullYear() === new Date().getFullYear()).length;

    const activeFilterCount = (unpaidFilter ? 1 : 0) + (hiredThisYearFilter ? 1 : 0);
    function clearAllFilters() {
        setUnpaidFilter('');
        setHiredThisYearFilter(false);
    }

    const stats = [
        {
            label: 'ทั้งหมด', value: allDrivers.length, tone: 'primary', description: 'จำนวนคนขับที่ทำงานอยู่ในขณะนี้',
            onClick: clearAllFilters,
        },
        {
            label: 'ค้างจ่ายค่าปรับ', value: unpaidDriversCount, tone: 'danger', description: 'จำนวนคนขับที่มีค่าปรับค้างจ่ายอย่างน้อย 1 รายการ',
            onClick: () => setUnpaidFilter((prev) => (prev === 'unpaid' ? '' : 'unpaid')),
        },
        {
            label: 'เข้าทำงานปีนี้', value: hiredThisYearCount, tone: 'success', description: 'จำนวนคนขับที่เริ่มงานในปีนี้',
            onClick: () => setHiredThisYearFilter((prev) => !prev),
        },
    ];

    const buttonStyle = {
        backgroundColor: 'var(--primary-color)',
        color: 'var(--on-primary)',
        border: '1px solid var(--primary-color)',
        boxShadow: '0 8px 18px rgba(15, 23, 42, 0.08)',
    };

    const secondaryButtonStyle = {
        backgroundColor: 'var(--surface-soft)',
        color: 'var(--page-text)',
        border: '1px solid var(--surface-border)',
    };

    function handleSaved(message = 'บันทึกข้อมูลเรียบร้อย') {
        setSuccessMessage(message);
        setFormModal(null);
        setSelectedDriverId(null);
    }

    function handleDeleted() {
        setSuccessMessage('ลบข้อมูลคนขับเรียบร้อย');
        setSelectedDriverId(null);
    }

    function closeSuccessModal() {
        setSuccessMessage('');
    }

    return (
        <div className="space-y-5 mx-auto max-w-7xl" style={{ color: 'var(--page-text)' }}>
            <header className="flex flex-col gap-4 rounded-lg border p-5 shadow-sm md:flex-row md:items-center md:justify-between" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em]" style={{ color: 'var(--sub-text)' }}>Personnel</p>
                    <h1 className="mt-1 text-2xl font-semibold" style={{ color: 'var(--page-text)' }}>คนขับ</h1>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <button
                        onClick={() => navigate('/drivers/archived')}
                        className="rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:opacity-90 cursor-pointer"
                        style={secondaryButtonStyle}
                    >
                        ดูคนขับที่พ้นสภาพ
                    </button>
                    <button
                        onClick={() => setFormModal({ mode: 'create' })}
                        className="rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:opacity-95 cursor-pointer"
                        style={buttonStyle}
                    >
                        + เพิ่มคนขับ
                    </button>
                </div>
            </header>

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
                                            item.tone === 'primary'
                                                ? 'var(--page-text)'
                                                : item.tone === 'danger'
                                                    ? 'var(--status-danger)'
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
                            aria-label="ค้นหาชื่อหรือเบอร์โทร"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="ค้นหาชื่อหรือเบอร์โทร"
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

                    <div className="flex shrink-0 flex-wrap items-center gap-3 ">
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
                            id="driver-unpaid-filter"
                            ariaLabel="กรองตามค่าปรับค้างจ่าย"
                            className="w-48"
                            value={unpaidFilter}
                            onChange={setUnpaidFilter}
                            options={[
                                { value: '', label: 'ทุกคน' },
                                { value: 'unpaid', label: 'ค้างจ่ายค่าปรับ' },
                            ]}
                        />
                        <div className="text-sm whitespace-nowrap" style={{ color: 'var(--sub-text)' }}>{filteredDrivers.length} รายการ</div>
                    </div>
                </div>

                {errorMessage && <p role="alert" className="mb-4 text-sm" style={{ color: 'var(--status-danger)' }}>{errorMessage}</p>}

                <div className="overflow-x-auto rounded-md border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                    <table className="w-full min-w-140 text-sm" style={{ color: 'var(--page-text)' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--surface-soft)', borderBottom: '1px solid var(--surface-border)', color: 'var(--sub-text)' }}>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>ชื่อ-นามสกุล</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>เบอร์โทร</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>วันที่เริ่มงาน</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>ระยะเวลาทำงาน</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>สถานะ</th>
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

                            {!isLoading && filteredDrivers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center" style={{ color: 'var(--sub-text)', opacity: 0.75 }}>
                                        ไม่พบข้อมูลคนขับ
                                    </td>
                                </tr>
                            )}

                            {!isLoading && pagedDrivers.map((d) => (
                                <tr
                                    key={d.driver_id}
                                    onClick={() => setSelectedDriverId(d.driver_id)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedDriverId(d.driver_id); } }}
                                    tabIndex={0}
                                    aria-label={`ดูรายละเอียดคนขับ ${d.prefix}${d.first_name} ${d.last_name}${Number(d.unpaid_violations_count) > 0 ? ' มีค่าปรับค้างจ่าย' : ''}`}
                                    className="cursor-pointer transition-colors duration-150 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-(--primary-color-soft)"
                                    style={{ borderBottom: '1px solid var(--surface-border)', backgroundColor: 'transparent' }}
                                >
                                    <td className="px-4 py-3" style={{ color: 'var(--page-text)' }}>
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold" style={{ backgroundColor: 'var(--primary-color-soft)', color: 'var(--on-primary)' }}>
                                                {initials(d.first_name, d.last_name)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--page-text)' }}>
                                                    <span className="truncate">{d.prefix}{d.first_name} {d.last_name}</span>
                                                    {Number(d.unpaid_violations_count) > 0 && (
                                                        <span onClick={(e) => e.stopPropagation()}>
                                                            <InfoTooltip text={`มีค่าปรับค้างจ่าย ${d.unpaid_violations_count} รายการ`} label="มีค่าปรับค้างจ่าย">
                                                                <AlertTriangle size={16} style={{ color: 'var(--status-danger)' }} />
                                                            </InfoTooltip>
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ color: 'var(--sub-text)', opacity: 0.75 }}>คนขับประจำ</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 truncate" style={{ color: 'var(--sub-text)' }}>{formatPhone(d.phone)}</td>
                                    <td className="px-4 py-3 truncate" style={{ color: 'var(--sub-text)' }}>{formatDate(d.hire_date)}</td>
                                    <td className="px-4 py-3 truncate" style={{ color: 'var(--sub-text)' }}>{d.deleted ? '-' : durationSince(d.hire_date) ?? '-'}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium truncate"
                                            style={
                                                d.deleted
                                                    ? { backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', opacity: 0.75 }
                                                    : { backgroundColor: 'var(--status-success-soft)', color: 'var(--status-success)' }
                                            }
                                        >
                                            {d.deleted ? 'พ้นสภาพ' : 'ทำงานอยู่'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>

            {selectedDriverId && (
                <DriverDetailModal
                    driverId={selectedDriverId}
                    onClose={() => setSelectedDriverId(null)}
                    onEdit={(driver) => { setSelectedDriverId(null); setFormModal({ mode: 'edit', driver }); }}
                    onDeleted={handleDeleted}
                />
            )}

            {formModal && (
                <DriverFormModal
                    driver={formModal.mode === 'edit' ? formModal.driver : undefined}
                    onClose={() => setFormModal(null)}
                    onSaved={(saved, message) => handleSaved(message || 'บันทึกข้อมูลเรียบร้อย')}
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
