import { useState } from 'react';
import DriverDetailModal from '../../components/driver/DriverDetailModal';
import DriverFormModal from '../../components/driver/DriverFormModal';
import Modal from '../../components/globals/Modal';
import { useDrivers } from '../../services/drivers/driversQueries.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { useAuth } from '../../context/auth/useAuth';
import { useTheme } from '../../context/theme/useTheme';

function initials(firstName, lastName) {
    return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
}

function formatDate(value) {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DriversPage() {
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebouncedValue(search, 300);
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedDriverId, setSelectedDriverId] = useState(null);
    const [formModal, setFormModal] = useState(null);
    const { user } = useAuth();
    const { themeColor } = useTheme();

    const { data, isLoading, error } = useDrivers({ search: debouncedSearch });
    const drivers = data?.data ?? [];
    const errorMessage = !user?.token ? 'กรุณาเข้าสู่ระบบก่อนใช้งาน' : error?.message;

    const stats = [
        { label: 'ทั้งหมด', value: drivers.length, tone: 'primary' },
        { label: 'ทำงานอยู่', value: drivers.filter((d) => !d.deleted).length, tone: 'success' },
        { label: 'พ้นสภาพ', value: drivers.filter((d) => d.deleted).length, tone: 'muted' },
    ];

    const buttonStyle = {
        backgroundColor: 'var(--primary-color)',
        color: 'var(--on-primary)',
        border: '1px solid var(--primary-color)',
        boxShadow: '0 8px 18px rgba(15, 23, 42, 0.08)',
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
            <header className="flex flex-col gap-4 rounded-2xl border p-5 shadow-sm md:flex-row md:items-center md:justify-between" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em]" style={{ color: 'var(--sub-text)' }}>Personnel</p>
                    <h1 className="mt-1 text-2xl font-semibold" style={{ color: 'var(--page-text)' }}>คนขับ</h1>
                </div>

                <button
                    onClick={() => setFormModal({ mode: 'create' })}
                    className="rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:opacity-95"
                    style={buttonStyle}
                >
                    + เพิ่มคนขับ
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
                            placeholder="ค้นหาชื่อหรือเบอร์โทร"
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
                    <div className="text-sm" style={{ color: 'var(--sub-text)' }}>{drivers.length} รายการ</div>
                </div>

                {errorMessage && <p className="mb-4 text-sm" style={{ color: 'var(--status-danger)' }}>{errorMessage}</p>}

                <div className="overflow-hidden rounded-xl border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                    <table className="w-full text-sm" style={{ color: 'var(--page-text)' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--surface-soft)', borderBottom: '1px solid var(--surface-border)', color: 'var(--sub-text)' }}>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>ชื่อ-นามสกุล</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>เบอร์โทร</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>วันที่เริ่มงาน</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>สถานะ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-10 text-center" style={{ color: 'var(--sub-text)', opacity: 0.75 }}>
                                        กำลังโหลด...
                                    </td>
                                </tr>
                            )}

                            {!isLoading && drivers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-10 text-center" style={{ color: 'var(--sub-text)', opacity: 0.75 }}>
                                        ไม่พบข้อมูลคนขับ
                                    </td>
                                </tr>
                            )}

                            {!isLoading && drivers.map((d) => (
                                <tr
                                    key={d.driver_id}
                                    onClick={() => setSelectedDriverId(d.driver_id)}
                                    className="cursor-pointer transition-colors duration-150 hover:opacity-95"
                                    style={{ borderBottom: '1px solid var(--surface-border)', backgroundColor: 'transparent' }}
                                >
                                    <td className="px-4 py-3" style={{ color: 'var(--page-text)' }}>
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold" style={{ backgroundColor: 'var(--primary-color-soft)', color: themeColor }}>
                                                {initials(d.first_name, d.last_name)}
                                            </div>
                                            <div>
                                                <div className="font-semibold" style={{ color: 'var(--page-text)' }}>{d.prefix}{d.first_name} {d.last_name}</div>
                                                <div style={{ color: 'var(--sub-text)', opacity: 0.75 }}>คนขับประจำ</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3" style={{ color: 'var(--sub-text)' }}>{d.phone}</td>
                                    <td className="px-4 py-3" style={{ color: 'var(--sub-text)' }}>{formatDate(d.hire_date)}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
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
