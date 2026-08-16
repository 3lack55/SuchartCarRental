import { useEffect, useState } from 'react';
import { getVehicles } from '../../services/vehicles/vehiclesAPI.js';
import Modal from '../../components/globals/Modal';
import VehicleDetailModal from '../../components/vehicle/VehicleDetailModal';
import VehicleFormModal from '../../components/vehicle/VehicleFormModal';
import { useAuth } from '../../context/auth/useAuth.js';

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [search, setSearch] = useState('');
    const [selectedVehicleId, setSelectedVehicleId] = useState(null);
    const [formModal, setFormModal] = useState(null);
    const { user } = useAuth();

    const stats = [
        { label: 'ทั้งหมด', value: vehicles.length, tone: 'primary' },
        { label: 'ใช้งานอยู่', value: vehicles.filter((v) => !v.deleted).length, tone: 'success' },
        { label: 'ปลดระวาง', value: vehicles.filter((v) => v.deleted).length, tone: 'muted' },
    ];

    const buttonStyle = {
        backgroundColor: 'var(--primary-color)',
        color: 'var(--on-primary)',
        border: '1px solid var(--primary-color)',
        boxShadow: '0 8px 18px rgba(15, 23, 42, 0.08)',
    };

    function refetch() {
        if (!user?.token) {
            setError('กรุณาเข้าสู่ระบบก่อนใช้งาน');
            setLoading(false);
            return;
        }

        setLoading(true);
        getVehicles(user.token, { search })
            .then((res) => setVehicles(res.data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }

    function handleSaved(message = 'บันทึกข้อมูลรถเรียบร้อย') {
        setSuccessMessage(message);
        setFormModal(null);
        setSelectedVehicleId(null);
        refetch();
    }

    function handleDeleted() {
        setSuccessMessage('ลบข้อมูลรถเรียบร้อย');
        setSelectedVehicleId(null);
        refetch();
    }

    function closeSuccessModal() {
        setSuccessMessage('');
    }

    useEffect(() => {
        if (!user?.token) {
            setVehicles([]);
            setError('กรุณาเข้าสู่ระบบก่อนใช้งาน');
            setLoading(false);
            return undefined;
        }

        const timer = setTimeout(() => {
            setLoading(true);
            getVehicles(user.token, { search })
                .then((res) => setVehicles(res.data))
                .catch((err) => setError(err.message))
                .finally(() => setLoading(false));
        }, 300);

        return () => clearTimeout(timer);
    }, [search, user?.token]);

    return (
        <div className="space-y-5" style={{ color: 'var(--page-text)' }}>
            <header className="flex flex-col gap-4 rounded-2xl border p-5 shadow-sm md:flex-row md:items-center md:justify-between" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em]" style={{ color: 'var(--sub-text)' }}>Fleet</p>
                    <h1 className="mt-1 text-2xl font-semibold" style={{ color: 'var(--page-text)' }}>ข้อมูลรถ</h1>
                </div>

                <button
                    onClick={() => setFormModal({ mode: 'create' })}
                    className="rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:opacity-95"
                    style={buttonStyle}
                >
                    + เพิ่มรถ
                </button>
            </header>

            <section className="grid gap-4 md:grid-cols-3">
                {stats.map((item) => (
                    <div key={item.label} className="rounded-2xl border p-4 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                        <p className="text-xs" style={{ color: 'var(--sub-text)' }}>{item.label}</p>
                        <div className="mt-2 flex items-end justify-between">
                            <span className="text-3xl font-semibold" style={{ color: 'var(--page-text)' }}>{item.value}</span>
                            <span
                                className="rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-[0.15em]"
                                style={{
                                    backgroundColor:
                                        item.tone === 'primary'
                                            ? 'var(--primary-color-soft)'
                                            : item.tone === 'success'
                                                ? 'var(--status-success-soft)'
                                                : 'var(--surface-soft)',
                                    color:
                                        item.tone === 'primary'
                                            ? 'var(--primary-color)'
                                            : item.tone === 'success'
                                                ? 'var(--status-success)'
                                                : 'var(--page-text)',
                                }}
                            >
                                {item.tone}
                            </span>
                        </div>
                    </div>
                ))}
            </section>

            <div className="rounded-2xl border p-4 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full max-w-md">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--icon-muted)' }}>⌕</span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="ค้นหาทะเบียนหรือรุ่นรถ"
                            className="w-full rounded-xl py-2.5 pl-9 pr-3 text-sm outline-none transition-all duration-200"
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
                    <div className="text-sm" style={{ color: 'var(--sub-text)' }}>{vehicles.length} รายการ</div>
                </div>

                {error && <p className="mb-4 text-sm" style={{ color: 'var(--status-danger)' }}>{error}</p>}

                <div className="overflow-hidden rounded-xl border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                    <table className="w-full text-sm" style={{ color: 'var(--page-text)' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--surface-soft)', borderBottom: '1px solid var(--surface-border)', color: 'var(--sub-text)' }}>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>ทะเบียน</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>รุ่นรถ</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>ประเภท</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>คนขับ</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>สถานะ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center" style={{ color: 'var(--sub-text)', opacity: 0.75 }}>
                                        กำลังโหลด...
                                    </td>
                                </tr>
                            )}

                            {!loading && vehicles.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center" style={{ color: 'var(--sub-text)', opacity: 0.75 }}>
                                        ไม่พบข้อมูลรถ
                                    </td>
                                </tr>
                            )}

                            {!loading && vehicles.map((v) => (
                                <tr
                                    key={v.vehicle_id}
                                    onClick={() => setSelectedVehicleId(v.vehicle_id)}
                                    className="cursor-pointer transition-colors duration-150 hover:opacity-95"
                                    style={{ borderBottom: '1px solid var(--surface-border)', backgroundColor: 'transparent' }}
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold" style={{ backgroundColor: 'var(--primary-color-soft)', color: 'var(--primary-color)' }}>
                                                {v.plate_number?.slice(0, 2) || 'รถ'}
                                            </div>
                                            <div>
                                                <div className="font-semibold" style={{ color: 'var(--page-text)' }}>{v.plate_number}</div>
                                                <div style={{ color: 'var(--sub-text)', opacity: 0.8 }}>{v.plate_province}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3" style={{ color: 'var(--sub-text)' }}>{v.brand_model || '-'}</td>
                                    <td className="px-4 py-3" style={{ color: 'var(--sub-text)' }}>{v.type_name || '-'}</td>
                                    <td className="px-4 py-3" style={{ color: 'var(--sub-text)' }}>
                                        {v.driver ? v.driver.name : <span style={{ color: 'var(--icon-muted)' }}>ไม่มีคนขับประจำ</span>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
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
            </div>

            {selectedVehicleId && (
                <VehicleDetailModal
                    vehicleId={selectedVehicleId}
                    onClose={() => setSelectedVehicleId(null)}
                    onEdit={(vehicle) => setFormModal({ mode: 'edit', vehicle })}
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
                                className="rounded-lg px-4 py-2 text-sm font-medium"
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
