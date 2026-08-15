import { useEffect, useState } from 'react';
import DriverDetailModal from '../../components/driver/DriverDetailModal';
import DriverFormModal from '../../components/driver/DriverFormModal';
import Modal from '../../components/globals/Modal';
import { getDrivers } from '../../services/drivers/driversApi';
import { useAuth } from '../../context/auth/useAuth';

function initials(firstName, lastName) {
    return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
}

function formatDate(value) {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DriversPage() {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [search, setSearch] = useState('');
    const [selectedDriverId, setSelectedDriverId] = useState(null);
    const [formModal, setFormModal] = useState(null);
    const { user } = useAuth();

    function refetch() {
        if (!user?.token) {
            setError('กรุณาเข้าสู่ระบบก่อนใช้งาน');
            setLoading(false);
            return;
        }

        setLoading(true);
        getDrivers(user.token, { search })
            .then((res) => setDrivers(res.data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }

    function handleSaved(message = 'บันทึกข้อมูลเรียบร้อย') {
        setSuccessMessage(message);
        setFormModal(null);
        setSelectedDriverId(null);
        refetch();
    }

    function handleDeleted() {
        setSuccessMessage('ลบข้อมูลคนขับเรียบร้อย');
        setSelectedDriverId(null);
        refetch();
    }

    function closeSuccessModal() {
        setSuccessMessage('');
    }

    useEffect(() => {
        if (!user?.token) {
            setDrivers([]);
            setError('กรุณาเข้าสู่ระบบก่อนใช้งาน');
            setLoading(false);
            return undefined;
        }

        const timer = setTimeout(() => {
            setLoading(true);
            getDrivers(user.token, { search })
                .then((res) => setDrivers(res.data))
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
                        placeholder="ค้นหาชื่อหรือเบอร์โทร"
                        className="w-full rounded-lg border border-stone-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                    />
                </div>
                <button
                    onClick={() => setFormModal({ mode: 'create' })}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                    + เพิ่มคนขับ
                </button>
            </div>

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <div className="overflow-hidden rounded-xl border border-stone-100">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-stone-100 bg-stone-50/60 text-left text-stone-500">
                            <th className="px-4 py-2.5 font-medium">ชื่อ-นามสกุล</th>
                            <th className="px-4 py-2.5 font-medium">เบอร์โทร</th>
                            <th className="px-4 py-2.5 font-medium">วันที่เริ่มงาน</th>
                            <th className="px-4 py-2.5 font-medium">สถานะ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr><td colSpan={4} className="px-4 py-8 text-center text-stone-400">กำลังโหลด...</td></tr>
                        )}

                        {!loading && drivers.length === 0 && (
                            <tr><td colSpan={4} className="px-4 py-8 text-center text-stone-400">ไม่พบข้อมูลคนขับ</td></tr>
                        )}

                        {!loading && drivers.map((d) => (
                            <tr
                                key={d.driver_id}
                                onClick={() => setSelectedDriverId(d.driver_id)}
                                className="cursor-pointer border-b border-stone-50 last:border-0 hover:bg-stone-50"
                            >
                                <td className="px-4 py-2.5">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-xs font-medium text-emerald-700">
                                            {initials(d.first_name, d.last_name)}
                                        </div>
                                        <span className="font-medium text-stone-700">{d.prefix}{d.first_name} {d.last_name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-2.5 text-stone-500">{d.phone}</td>
                                <td className="px-4 py-2.5 text-stone-500">{formatDate(d.hire_date)}</td>
                                <td className="px-4 py-2.5">
                                    <span
                                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${d.deleted ? 'bg-stone-100 text-stone-500' : 'bg-emerald-50 text-emerald-700'
                                            }`}
                                    >
                                        {d.deleted ? 'พ้นสภาพ' : 'ทำงานอยู่'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedDriverId && (
                <DriverDetailModal
                    driverId={selectedDriverId}
                    onClose={() => setSelectedDriverId(null)}
                    onEdit={(driver) => setFormModal({ mode: 'edit', driver })}
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