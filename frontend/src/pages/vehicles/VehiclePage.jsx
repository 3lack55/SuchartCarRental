import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useVehicles } from '../../services/vehicles/vehiclesQueries.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import Modal from '../../components/globals/Modal';
import Select from '../../components/globals/Select.jsx';
import InfoTooltip from '../../components/globals/InfoTooltip.jsx';
import PlateBadge from '../../components/globals/PlateBadge.jsx';
import Pagination from '../../components/globals/Pagination.jsx';
import VehicleDetailModal from '../../components/vehicle/VehicleDetailModal';
import VehicleFormModal from '../../components/vehicle/VehicleFormModal';
import VehicleTypeBadge from '../../components/vehicle/VehicleTypeBadge.jsx';
import { usePagination } from '../../hooks/usePagination.js';
import { useAuth } from '../../context/auth/useAuth.js';
import { getDuplicatePlateNumbers } from '../../utils/plateCollision.js';
import { durationSinceYearMonth } from '../../utils/duration.js';

export default function VehiclesPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebouncedValue(search, 300);
    const [typeFilter, setTypeFilter] = useState('');
    const [incompleteOnly, setIncompleteOnly] = useState(false);
    // เปิดหน้าพร้อมกรองคนขับ เช่น "รถไม่มีคนขับ" จากหน้าภาพรวม (?driver=with|without)
    const [driverFilter, setDriverFilter] = useState(() => {
        const value = searchParams.get('driver');
        return value === 'with' || value === 'without' ? value : '';
    });
    const [successMessage, setSuccessMessage] = useState('');
    // เปิดรายละเอียดรถอัตโนมัติเมื่อมาจากลิงก์ภายนอก เช่น "รถที่ดูแล" ในหน้าคนขับ (?open=<id>)
    const [selectedVehicleId, setSelectedVehicleId] = useState(() => {
        const openId = searchParams.get('open');
        return openId ? Number(openId) : null;
    });
    const [formModal, setFormModal] = useState(null);
    const { user } = useAuth();

    // ล้าง ?open= ออกจาก URL หลังอ่านค่าไปแล้ว ไม่ให้ค้างอยู่ตอน refresh หรือกดย้อนกลับ
    useEffect(() => {
        if (searchParams.get('open')) {
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.delete('open');
                return next;
            }, { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { data, isLoading, error } = useVehicles({ search: debouncedSearch, includeInactive: false });
    const allVehicles = data?.data ?? [];
    const typeOptions = [...new Set(allVehicles.map((v) => v.type_name).filter(Boolean))].sort();
    let vehicles = allVehicles;
    if (typeFilter) vehicles = vehicles.filter((v) => v.type_name === typeFilter);
    if (driverFilter === 'with') vehicles = vehicles.filter((v) => v.driver);
    if (driverFilter === 'without') vehicles = vehicles.filter((v) => !v.driver);
    if (incompleteOnly) vehicles = vehicles.filter((v) => v.documents_incomplete);
    const errorMessage = !user?.token ? 'กรุณาเข้าสู่ระบบก่อนใช้งาน' : error?.message;
    const { page, setPage, totalPages, pageItems: pagedVehicles } = usePagination(vehicles);
    const duplicatePlateNumbers = useMemo(() => getDuplicatePlateNumbers(vehicles), [vehicles]);

    // การ์ดสรุปด้านบนเป็น KPI คงที่ ไม่ขึ้นกับตัวกรอง/ค้นหาใดๆ (ตัวเลขที่แสดงจริงตามตัวกรองอยู่ที่ "N รายการ" ข้างช่องค้นหาแทน)
    // จึงต้องดึงข้อมูลรถที่ใช้งานอยู่ทั้งหมดแยกต่างหาก ไม่ผ่าน search
    const { data: allVehiclesData } = useVehicles({ includeInactive: false });
    const globalVehicles = allVehiclesData?.data ?? [];
    const withoutDriverCount = globalVehicles.filter((v) => !v.driver).length;
    const incompleteDocsCount = globalVehicles.filter((v) => v.documents_incomplete).length;

    const activeFilterCount = (typeFilter ? 1 : 0) + (driverFilter ? 1 : 0) + (incompleteOnly ? 1 : 0);
    function clearAllFilters() {
        setTypeFilter('');
        setDriverFilter('');
        setIncompleteOnly(false);
    }

    const stats = [
        {
            label: 'ทั้งหมด', value: globalVehicles.length, tone: 'primary', description: 'จำนวนรถที่ใช้งานอยู่ในขณะนี้',
            onClick: clearAllFilters,
        },
        {
            label: 'ข้อมูลไม่สมบูรณ์', value: incompleteDocsCount, tone: 'danger', description: 'จำนวนรถที่ขาดเอกสาร (พ.ร.บ./ภาษี หรือ ประกัน)',
            onClick: () => setIncompleteOnly((prev) => !prev),
        },
        {
            label: 'ไม่มีคนขับประจำ', value: withoutDriverCount, tone: 'warning', description: 'จำนวนรถที่ยังไม่มีคนขับประจำ',
            onClick: () => setDriverFilter((prev) => (prev === 'without' ? '' : 'without')),
        },
    ];

    const buttonStyle = {
        backgroundColor: 'var(--primary-color)',
        color: 'var(--on-primary)',
        border: '1px solid var(--primary-color)',
        boxShadow: '0 8px 18px rgba(15, 23, 42, 0.08)',
    };

    function handleSaved(message = 'บันทึกข้อมูลรถเรียบร้อย') {
        setSuccessMessage(message);
        setFormModal(null);
        setSelectedVehicleId(null);
    }

    function handleDeleted() {
        setSuccessMessage('ลบข้อมูลรถเรียบร้อย');
        setSelectedVehicleId(null);
    }

    function closeSuccessModal() {
        setSuccessMessage('');
    }

    return (
        <div className="space-y-5 mx-auto max-w-7xl" style={{ color: 'var(--page-text)' }}>
            <header className="flex flex-col gap-4 rounded-lg border p-5 shadow-sm md:flex-row md:items-center md:justify-between" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em]" style={{ color: 'var(--sub-text)' }}>Fleet</p>
                    <h1 className="mt-1 text-2xl font-semibold" style={{ color: 'var(--page-text)' }}>ข้อมูลรถ</h1>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <button
                        onClick={() => navigate('/vehicles/archived')}
                        className="cursor-pointer rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:opacity-90"
                        style={{ backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', border: '1px solid var(--surface-border)' }}
                    >
                        ดูรถที่ปลดระวาง
                    </button>
                    <button
                        onClick={() => setFormModal({ mode: 'create' })}
                        className="cursor-pointer rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:opacity-95"
                        style={buttonStyle}
                    >
                        + เพิ่มรถ
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
                                                : item.tone === 'warning'
                                                    ? 'var(--status-warning)'
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
                            aria-label="ค้นหาทะเบียนหรือรุ่นรถ"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="ค้นหาทะเบียนหรือรุ่นรถ"
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

                    <div className="flex shrink-0 flex-wrap items-center gap-3">
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
                            id="vehicle-type-filter"
                            ariaLabel="กรองตามประเภทรถ"
                            className="w-40"
                            value={typeFilter}
                            onChange={setTypeFilter}
                            options={[{ value: '', label: 'ทุกประเภทรถ' }, ...typeOptions.map((t) => ({ value: t, label: t }))]}
                        />
                        <Select
                            id="vehicle-driver-filter"
                            ariaLabel="กรองตามคนขับ"
                            className="w-44"
                            value={driverFilter}
                            onChange={setDriverFilter}
                            options={[
                                { value: '', label: 'ทุกคัน' },
                                { value: 'with', label: 'มีคนขับประจำ' },
                                { value: 'without', label: 'ไม่มีคนขับประจำ' },
                            ]}
                        />
                        <div className="text-sm whitespace-nowrap" style={{ color: 'var(--sub-text)' }}>{vehicles.length} รายการ</div>
                    </div>
                </div>

                {errorMessage && <p role="alert" className="mb-4 text-sm" style={{ color: 'var(--status-danger)' }}>{errorMessage}</p>}

                <div className="overflow-x-auto rounded-md border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                    <table className="w-full min-w-160 text-sm" style={{ color: 'var(--page-text)' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--surface-soft)', borderBottom: '1px solid var(--surface-border)', color: 'var(--sub-text)' }}>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>ทะเบียน</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>รุ่นรถ</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>ปีที่ซื้อ</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>อายุรถ</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>ประเภท</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>คนขับ</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>สถานะ</th>
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

                            {!isLoading && vehicles.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-10 text-center" style={{ color: 'var(--sub-text)', opacity: 0.75 }}>
                                        ไม่พบข้อมูลรถ
                                    </td>
                                </tr>
                            )}

                            {!isLoading && pagedVehicles.map((v) => (
                                <tr
                                    key={v.vehicle_id}
                                    onClick={() => setSelectedVehicleId(v.vehicle_id)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedVehicleId(v.vehicle_id); } }}
                                    tabIndex={0}
                                    aria-label={`ดูรายละเอียดรถทะเบียน ${v.plate_number} ${v.plate_province}${v.documents_incomplete ? ' เอกสารรถไม่ครบ' : ''}`}
                                    className="cursor-pointer transition-colors duration-150 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-(--primary-color-soft)"
                                    style={{ borderBottom: '1px solid var(--surface-border)', backgroundColor: 'transparent' }}
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <PlateBadge plateNumber={v.plate_number} plateProvince={v.plate_province} duplicate={duplicatePlateNumbers.has(v.plate_number)} />
                                            {v.documents_incomplete && (
                                                <span className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                                    <InfoTooltip text="ข้อมูลไม่สมบูรณ์" label="ข้อมูลรถไม่สมบูรณ์">
                                                        <AlertTriangle size={16} style={{ color: 'var(--status-danger)' }} />
                                                    </InfoTooltip>
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 truncate" style={{ color: 'var(--sub-text)' }}>{v.brand_model || '-'}</td>
                                    <td className="px-4 py-3 truncate" style={{ color: 'var(--sub-text)' }}>{v.purchase_year ? `${v.purchase_year}${v.purchase_month ? `/${v.purchase_month}` : ''}` : '-'}</td>
                                    <td className="px-4 py-3 truncate" style={{ color: 'var(--sub-text)' }}>{durationSinceYearMonth(v.purchase_year, v.purchase_month) ?? '-'}</td>
                                    <td className="px-4 py-3"><VehicleTypeBadge typeName={v.type_name} color={v.type_color} /></td>
                                    <td className="px-4 py-3 truncate" style={{ color: 'var(--sub-text)' }}>
                                        {v.driver ? v.driver.name : <span style={{ color: 'var(--icon-muted)' }}>ไม่มีคนขับประจำ</span>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium truncate"
                                            style={
                                                v.deleted
                                                    ? { backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', opacity: 0.75 }
                                                    : { backgroundColor: 'var(--status-success-soft)', color: 'var(--status-success)' }
                                            }
                                        >
                                            {v.deleted ? 'ปลดระวาง' : 'ใช้งานอยู่'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>

            {selectedVehicleId && (
                <VehicleDetailModal
                    vehicleId={selectedVehicleId}
                    onClose={() => setSelectedVehicleId(null)}
                    onEdit={(vehicle) => { setSelectedVehicleId(null); setFormModal({ mode: 'edit', vehicle }); }}
                    onDeleted={handleDeleted}
                />
            )}

            {formModal && (
                <VehicleFormModal
                    vehicle={formModal.mode === 'edit' ? formModal.vehicle : undefined}
                    onClose={() => setFormModal(null)}
                    onSaved={(saved, message) => handleSaved(message || 'บันทึกข้อมูลรถเรียบร้อย')}
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
