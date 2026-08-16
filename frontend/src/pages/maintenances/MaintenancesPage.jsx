import { useState } from 'react';
import { useAuth } from '../../context/auth/useAuth.js';
import { useMaintenances } from '../../services/maintenances/maintenancesQueries.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import MaintenanceDetailModal from '../../components/mainntenances/MaintenanceDetailModal.jsx';
import MaintenanceFormModal from '../../components/mainntenances/MaintenanceFormModal.jsx';

function formatDate(value) {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function MaintenancesPage() {
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebouncedValue(search, 300);
    const [selectedId, setSelectedId] = useState(null);
    const [formModal, setFormModal] = useState(null);

    const { user } = useAuth();

    const { data, isLoading, error } = useMaintenances({ search: debouncedSearch });
    const maintenances = data?.data ?? [];
    const errorMessage = !user?.token ? 'กรุณาเข้าสู่ระบบก่อนใช้งาน' : error?.message;

    const totalItems = maintenances.reduce((sum, item) => sum + Number(item.total_items || 0), 0);
    const totalCost = maintenances.reduce((sum, item) => sum + Number(item.total_cost || 0), 0);

    const stats = [
        { label: 'ทั้งหมด', value: maintenances.length, tone: 'primary' },
        { label: 'รายการ', value: totalItems, tone: 'success' },
        { label: 'ค่าใช้จ่าย', value: `฿${totalCost.toLocaleString()}`, tone: 'muted' },
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
                    className="rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:opacity-95"
                    style={buttonStyle}
                >
                    + บันทึกการซ่อม
                </button>
            </header>

            <section className="grid gap-4 md:grid-cols-3">
                {stats.map((item) => (
                    <div key={item.label} className="rounded-2xl border p-4 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                        <p className="text-xs" style={{ color: 'var(--sub-text)' }}>{item.label}</p>
                        <div className="mt-2 flex items-end justify-between">
                            <span className="text-2xl font-semibold" style={{ color: 'var(--page-text)' }}>{item.value}</span>
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
                            placeholder="ค้นหาชื่อศูนย์/อู่ หรือทะเบียนรถ"
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
                    <div className="text-sm" style={{ color: 'var(--sub-text)' }}>{maintenances.length} รายการ</div>
                </div>

                {errorMessage && <p className="mb-4 text-sm" style={{ color: 'var(--status-danger)' }}>{errorMessage}</p>}

                <div className="overflow-hidden rounded-xl border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                    <table className="w-full text-sm" style={{ color: 'var(--page-text)' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--surface-soft)', borderBottom: '1px solid var(--surface-border)', color: 'var(--sub-text)' }}>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>วันที่</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>รถ</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>ศูนย์/อู่</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>จำนวนรายการ</th>
                                <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--sub-text)' }}>ยอดรวม</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center" style={{ color: 'var(--sub-text)', opacity: 0.75 }}>
                                        กำลังโหลด...
                                    </td>
                                </tr>
                            )}

                            {!isLoading && maintenances.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center" style={{ color: 'var(--sub-text)', opacity: 0.75 }}>
                                        ไม่พบข้อมูลการซ่อมบำรุง
                                    </td>
                                </tr>
                            )}

                            {!isLoading && maintenances.map((m) => (
                                <tr
                                    key={m.maintenance_id}
                                    onClick={() => setSelectedId(m.maintenance_id)}
                                    className="cursor-pointer transition-colors duration-150 hover:opacity-95"
                                    style={{ borderBottom: '1px solid var(--surface-border)', backgroundColor: 'transparent' }}
                                >
                                    <td className="px-4 py-3" style={{ color: 'var(--sub-text)' }}>{formatDate(m.service_date)}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-semibold" style={{ color: 'var(--page-text)' }}>{m.plate_number}</div>
                                        <div style={{ color: 'var(--sub-text)', opacity: 0.8 }}>{m.plate_province}</div>
                                    </td>
                                    <td className="px-4 py-3" style={{ color: 'var(--sub-text)' }}>{m.garage_name}</td>
                                    <td className="px-4 py-3" style={{ color: 'var(--sub-text)' }}>{m.total_items} รายการ</td>
                                    <td className="px-4 py-3 text-right font-medium" style={{ color: 'var(--page-text)' }}>฿{Number(m.total_cost).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
