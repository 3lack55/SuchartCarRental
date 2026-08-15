import { useEffect, useState } from 'react';
import { getVehicles } from '../../services/vehicles/vehiclesAPI.js'
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
    const [formModal, setFormModal] = useState(null); // null | { mode: 'create' } | { mode: 'edit', vehicle }
    const { user } = useAuth();

    function refetch() {
        if (!user?.token) {
            setError('กรุณาเข้าสู่ระบบก่อนใช้งาน');
            setLoading(false);
            return;
        }

        setLoading(true);
        getVehicles(user.token, {search})
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
            getVehicles(user.token, {search})
                .then((res) => setVehicles(res.data))
                .catch((err) => setError(err.message))
                .finally(() => setLoading(false));
        }, 300);

        return () => clearTimeout(timer);
    }, [search, user?.token]);

    return (
        <div>
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="relative max-w-xs flex-1">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">⌕</span>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ค้นหาทะเบียนหรือรุ่นรถ"
                        className="w-full rounded-lg border border-stone-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                    />
                </div>
                <button
                    onClick={() => setFormModal({ mode: 'create' })}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                    + เพิ่มรถ
                </button>
            </div>

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <div className="overflow-hidden rounded-xl border border-stone-100">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-stone-100 bg-stone-50/60 text-left text-stone-500">
                            <th className="px-4 py-2.5 font-medium">ทะเบียน</th>
                            <th className="px-4 py-2.5 font-medium">รุ่นรถ</th>
                            <th className="px-4 py-2.5 font-medium">ประเภท</th>
                            <th className="px-4 py-2.5 font-medium">คนขับ</th>
                            <th className="px-4 py-2.5 font-medium">สถานะ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-stone-400">กำลังโหลด...</td></tr>
                        )}

                        {!loading && vehicles.length === 0 && (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-stone-400">ไม่พบข้อมูลรถ</td></tr>
                        )}

                        {!loading && vehicles.map((v) => (
                            <tr
                                key={v.vehicle_id}
                                onClick={() => setSelectedVehicleId(v.vehicle_id)}
                                className="cursor-pointer border-b border-stone-50 last:border-0 hover:bg-stone-50"
                            >
                                <td className="px-4 py-2.5">
                                    <span className="font-medium text-stone-700">{v.plate_number}</span>
                                    <span className="ml-1.5 text-stone-400">{v.plate_province}</span>
                                </td>
                                <td className="px-4 py-2.5 text-stone-500">{v.brand_model || '-'}</td>
                                <td className="px-4 py-2.5 text-stone-500">{v.type_name || '-'}</td>
                                <td className="px-4 py-2.5 text-stone-500">
                                    {v.driver ? v.driver.name : <span className="text-stone-300">ไม่มีคนขับประจำ</span>}
                                </td>
                                <td className="px-4 py-2.5">
                                    <span
                                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${v.deleted ? 'bg-stone-100 text-stone-500' : 'bg-emerald-50 text-emerald-700'
                                            }`}
                                    >
                                        {v.deleted ? 'ปลดระวาง' : 'ใช้งานอยู่'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
                        <p className="text-sm text-stone-700">{successMessage}</p>
                        <div className="mt-5 flex justify-end">
                            <button
                                type="button"
                                onClick={closeSuccessModal}
                                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
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
