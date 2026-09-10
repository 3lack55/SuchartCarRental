import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VehicleDetailModal from '../../components/vehicle/VehicleDetailModal';
import VehicleFormModal from '../../components/vehicle/VehicleFormModal';
import VehicleTypeBadge from '../../components/vehicle/VehicleTypeBadge.jsx';
import Modal from '../../components/globals/Modal';
import PlateBadge from '../../components/globals/PlateBadge.jsx';
import Pagination from '../../components/globals/Pagination.jsx';
import { useVehicles } from '../../services/vehicles/vehiclesQueries.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { usePagination } from '../../hooks/usePagination.js';
import { useAuth } from '../../context/auth/useAuth.js';

export default function ArchivedVehiclesPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebouncedValue(search, 300);
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedVehicleId, setSelectedVehicleId] = useState(null);
    const [formModal, setFormModal] = useState(null);
    const { user } = useAuth();

    const { data, isLoading, error } = useVehicles({ search: debouncedSearch, includeInactive: true });
    const vehicles = (data?.data ?? []).filter((v) => v.deleted);
    const errorMessage = !user?.token ? 'กรุณาเข้าสู่ระบบก่อนใช้งาน' : error?.message;
    const { page, setPage, totalPages, pageItems: pagedVehicles } = usePagination(vehicles);

    function handleSaved(message = 'บันทึกข้อมูลรถเรียบร้อย') {
        setSuccessMessage(message);
        setFormModal(null);
        setSelectedVehicleId(null);
    }

    function handleRestored() {
        setSuccessMessage('กู้คืนข้อมูลรถเรียบร้อย');
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
                    <h1 className="mt-1 text-2xl font-semibold" style={{ color: 'var(--page-text)' }}>รถที่ปลดระวาง</h1>
                </div>

                <button
                    onClick={() => navigate('/vehicles')}
                    className="cursor-pointer rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:opacity-90"
                    style={{ backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', border: '1px solid var(--surface-border)' }}
                >
                    ← กลับไปหน้ารถยนต์
                </button>
            </header>

            <div className="rounded-lg border p-4 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
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

                    <div className="text-sm whitespace-nowrap" style={{ color: 'var(--sub-text)' }}>{vehicles.length} รายการ</div>
                </div>

                {errorMessage && <p role="alert" className="mb-4 text-sm" style={{ color: 'var(--status-danger)' }}>{errorMessage}</p>}

                <div className="overflow-x-auto rounded-md border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                    <table className="w-full min-w-140 text-sm" style={{ color: 'var(--page-text)' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--surface-soft)', borderBottom: '1px solid var(--surface-border)', color: 'var(--sub-text)' }}>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>ทะเบียน</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>รุ่นรถ</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>ประเภท</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>สถานะ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && (
                                <tr>
                                    <td colSpan={4} role="status" className="px-4 py-10 text-center" style={{ color: 'var(--sub-text)', opacity: 0.75 }}>
                                        กำลังโหลด...
                                    </td>
                                </tr>
                            )}

                            {!isLoading && vehicles.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-10 text-center" style={{ color: 'var(--sub-text)', opacity: 0.75 }}>
                                        ไม่พบรถที่ปลดระวาง
                                    </td>
                                </tr>
                            )}

                            {!isLoading && pagedVehicles.map((v) => (
                                <tr
                                    key={v.vehicle_id}
                                    onClick={() => setSelectedVehicleId(v.vehicle_id)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedVehicleId(v.vehicle_id); } }}
                                    tabIndex={0}
                                    aria-label={`ดูรายละเอียดรถทะเบียน ${v.plate_number} ${v.plate_province}`}
                                    className="cursor-pointer transition-colors duration-150 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-(--primary-color-soft)"
                                    style={{ borderBottom: '1px solid var(--surface-border)', backgroundColor: 'transparent' }}
                                >
                                    <td className="px-4 py-3">
                                        <PlateBadge plateNumber={v.plate_number} plateProvince={v.plate_province} />
                                    </td>
                                    <td className="px-4 py-3 truncate" style={{ color: 'var(--sub-text)' }}>{v.brand_model || '-'}</td>
                                    <td className="px-4 py-3"><VehicleTypeBadge typeName={v.type_name} color={v.type_color} /></td>
                                    <td className="px-4 py-3">
                                        <span
                                            className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium truncate"
                                            style={{ backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', opacity: 0.75 }}
                                        >
                                            ปลดระวาง
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
                    onRestored={handleRestored}
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
