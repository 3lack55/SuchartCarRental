import { useEffect, useState } from 'react';
import { useAuth } from '../../context/auth/useAuth.js';
import { getMaintenances } from '../../services/maintenances/mainTenanceApi';
import MaintenanceDetailModal from '../../components/mainntenances/MaintenanceDetailModal.jsx';
import MaintenanceFormModal from '../../components/mainntenances/MaintenanceFormModal.jsx';

function formatDate(value) {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function MaintenancesPage() {
    const [maintenances, setMaintenances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [formModal, setFormModal] = useState(null); // null | { mode: 'create' } | { mode: 'edit', maintenance }

    const { user } = useAuth();

    function refetch() {
        setLoading(true);

        if (!user.token) return (setLoading(false));

        getMaintenances(user.token, { search })
            .then((res) =>  setMaintenances( res.data ))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }

    function handleSaved() {
        setFormModal(null);
        setSelectedId(null);
        refetch();
    }

    useEffect(() => {
        const timer = setTimeout(refetch, 300);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    return (
        <div>
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="relative max-w-xs flex-1">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">⌕</span>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ค้นหาชื่อศูนย์/อู่ หรือทะเบียนรถ"
                        className="w-full rounded-lg border border-stone-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                    />
                </div>
                <button
                    onClick={() => setFormModal({ mode: 'create' })}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                    + บันทึกการซ่อม
                </button>
            </div>

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <div className="overflow-hidden rounded-xl border border-stone-100">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-stone-100 bg-stone-50/60 text-left text-stone-500">
                            <th className="px-4 py-2.5 font-medium">วันที่</th>
                            <th className="px-4 py-2.5 font-medium">รถ</th>
                            <th className="px-4 py-2.5 font-medium">ศูนย์/อู่</th>
                            <th className="px-4 py-2.5 font-medium">จำนวนรายการ</th>
                            <th className="px-4 py-2.5 text-right font-medium">ยอดรวม</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-stone-400">กำลังโหลด...</td></tr>
                        )}

                        {!loading && maintenances.length === 0 && (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-stone-400">ไม่พบข้อมูลการซ่อมบำรุง</td></tr>
                        )}

                        {!loading && maintenances.map((m) => (
                            <tr
                                key={m.maintenance_id}
                                onClick={() => setSelectedId(m.maintenance_id)}
                                className="cursor-pointer border-b border-stone-50 last:border-0 hover:bg-stone-50"
                            >
                                <td className="px-4 py-2.5 text-stone-500">{formatDate(m.service_date)}</td>
                                <td className="px-4 py-2.5">
                                    <span className="font-medium text-stone-700">{m.plate_number}</span>
                                    <span className="ml-1.5 text-stone-400">{m.plate_province}</span>
                                </td>
                                <td className="px-4 py-2.5 text-stone-500">{m.garage_name}</td>
                                <td className="px-4 py-2.5 text-stone-500">{m.total_items} รายการ</td>
                                <td className="px-4 py-2.5 text-right text-stone-700">฿{Number(m.total_cost).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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