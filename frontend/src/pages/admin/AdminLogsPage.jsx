import { useState } from 'react';
import Select from '../../components/globals/Select.jsx';
import Pagination from '../../components/globals/Pagination.jsx';
import { useActivityLogs } from '../../services/activity-logs/logsQueries.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';

const ACTION_FILTERS = [
    { value: '', label: 'ทุกประเภทกิจกรรม' },
    { value: 'auth', label: 'เข้าสู่ระบบ / รหัสผ่าน' },
    { value: 'user', label: 'ผู้ใช้งาน' },
    { value: 'driver', label: 'คนขับ' },
    { value: 'vehicle', label: 'รถยนต์' },
    { value: 'document', label: 'พรบ ภาษี และประกัน' },
    { value: 'maintenance', label: 'ซ่อมบำรุง' },
    { value: 'violation', label: 'ฝ่าฝืนกฎจราจร' },
    { value: 'lookup', label: 'ตั้งค่าตัวเลือกในระบบ' },
];

const ACTION_LABELS = {
    'auth.login_success': 'เข้าสู่ระบบสำเร็จ',
    'auth.login_failed': 'เข้าสู่ระบบไม่สำเร็จ',
    'auth.password_update': 'เปลี่ยนรหัสผ่าน',
    'user.create': 'เพิ่มผู้ใช้งาน',
    'user.role_update': 'เปลี่ยนสิทธิ์ผู้ใช้งาน',
    'user.status_update': 'เปลี่ยนสถานะผู้ใช้งาน',
    'driver.create': 'เพิ่มคนขับ',
    'driver.update': 'แก้ไขคนขับ',
    'driver.delete': 'ลบคนขับ',
    'driver.restore': 'กู้คืนคนขับ',
    'vehicle.create': 'เพิ่มรถยนต์',
    'vehicle.update': 'แก้ไขรถยนต์',
    'vehicle.delete': 'ลบรถยนต์',
    'vehicle.restore': 'กู้คืนรถยนต์',
    'document.create': 'เพิ่มเอกสาร',
    'document.update': 'แก้ไขเอกสาร',
    'document.delete': 'ลบเอกสาร',
    'maintenance.create': 'เพิ่มใบซ่อมบำรุง',
    'maintenance.update': 'แก้ไขใบซ่อมบำรุง',
    'maintenance.delete': 'ลบใบซ่อมบำรุง',
    'violation.create': 'เพิ่มบันทึกฝ่าฝืนกฎจราจร',
    'violation.update': 'แก้ไขบันทึกฝ่าฝืนกฎจราจร',
    'violation.delete': 'ลบบันทึกฝ่าฝืนกฎจราจร',
    'lookup.vehicle_type.create': 'เพิ่มประเภทรถ',
    'lookup.vehicle_type.update': 'แก้ไขประเภทรถ',
    'lookup.vehicle_type.delete': 'ลบประเภทรถ',
    'lookup.violation_reason.create': 'เพิ่มสาเหตุการฝ่าฝืนกฎจราจร',
    'lookup.violation_reason.update': 'แก้ไขสาเหตุการฝ่าฝืนกฎจราจร',
    'lookup.violation_reason.delete': 'ลบสาเหตุการฝ่าฝืนกฎจราจร',
    'lookup.service_type.create': 'เพิ่มประเภทบริการซ่อมบำรุง',
    'lookup.service_type.update': 'แก้ไขประเภทบริการซ่อมบำรุง',
    'lookup.service_type.delete': 'ลบประเภทบริการซ่อมบำรุง',
    'lookup.service_category.create': 'เพิ่มหมวดหมู่บริการซ่อมบำรุง',
    'lookup.service_category.update': 'แก้ไขหมวดหมู่บริการซ่อมบำรุง',
    'lookup.service_category.delete': 'ลบหมวดหมู่บริการซ่อมบำรุง',
    'lookup.service_item.create': 'เพิ่มรายการบริการซ่อมบำรุง',
    'lookup.service_item.update': 'แก้ไขรายการบริการซ่อมบำรุง',
    'lookup.service_item.delete': 'ลบรายการบริการซ่อมบำรุง',
};

function actionLabel(action) {
    return ACTION_LABELS[action] || action;
}

function formatDateTime(value) {
    if (!value) return '-';
    return new Date(value).toLocaleString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const LIMIT = 20;

export default function AdminLogsPage() {
    const [search, setSearch] = useState('');
    const [action, setAction] = useState('');
    const [page, setPage] = useState(1);
    const debouncedSearch = useDebouncedValue(search, 300);

    const { data, isLoading, error } = useActivityLogs({ search: debouncedSearch, action, page, limit: LIMIT });
    const logs = data?.data?.logs ?? [];
    const total = data?.data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / LIMIT));

    function handleSearchChange(value) {
        setSearch(value);
        setPage(1);
    }

    function handleActionChange(value) {
        setAction(value);
        setPage(1);
    }

    return (
        <div className="mx-auto max-w-6xl space-y-4">
            <header className="rounded-2xl border p-5 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                <p className="text-xs font-medium uppercase tracking-[0.18em]" style={{ color: 'var(--sub-text)' }}>Audit Trail</p>
                <h1 className="mt-1 text-2xl font-semibold" style={{ color: 'var(--page-text)' }}>บันทึกกิจกรรมระบบ</h1>
                <p className="mt-1 text-sm" style={{ color: 'var(--sub-text)' }}>ประวัติการเพิ่ม/แก้ไข/ลบข้อมูล และการเข้าสู่ระบบของผู้ใช้งานทุกคนในระบบ</p>
            </header>

            <div className="rounded-2xl border p-4 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative w-full min-w-0 flex-1 sm:max-w-sm">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--icon-muted)' }}>⌕</span>
                        <input
                            type="text"
                            aria-label="ค้นหาชื่อผู้ใช้งานหรือรายละเอียด"
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="ค้นหาชื่อผู้ใช้งานหรือรายละเอียด"
                            className="w-full rounded-xl py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                            style={{ backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', border: '1px solid var(--surface-border)' }}
                        />
                    </div>
                    <Select
                        id="log-action-filter"
                        ariaLabel="กรองตามประเภทกิจกรรม"
                        value={action}
                        onChange={handleActionChange}
                        options={ACTION_FILTERS}
                        className="sm:w-64"
                    />
                    <div className="text-sm whitespace-nowrap sm:ml-auto" style={{ color: 'var(--sub-text)' }}>{total} รายการ</div>
                </div>

                {error && <p role="alert" className="mb-4 text-sm" style={{ color: 'var(--status-danger)' }}>{error.message}</p>}

                <div className="overflow-x-auto rounded-xl border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                    <table className="w-full min-w-180 text-sm" style={{ color: 'var(--page-text)' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--surface-soft)', borderBottom: '1px solid var(--surface-border)' }}>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>เวลา</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>ผู้ใช้งาน</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>กิจกรรม</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>รายละเอียด</th>
                                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--sub-text)' }}>IP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && (
                                <tr>
                                    <td colSpan={5} role="status" className="px-4 py-10 text-center" style={{ color: 'var(--sub-text)', opacity: 0.75 }}>กำลังโหลด...</td>
                                </tr>
                            )}

                            {!isLoading && logs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center" style={{ color: 'var(--sub-text)', opacity: 0.75 }}>ไม่พบบันทึกกิจกรรม</td>
                                </tr>
                            )}

                            {!isLoading && logs.map((log) => (
                                <tr key={log.log_id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--sub-text)' }}>{formatDateTime(log.created_at)}</td>
                                    <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: 'var(--page-text)' }}>{log.username}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span
                                            className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                                            style={
                                                log.action.includes('delete') || log.action.includes('failed')
                                                    ? { backgroundColor: 'var(--status-danger-soft)', color: 'var(--status-danger)' }
                                                    : { backgroundColor: 'var(--primary-color-soft)', color: 'var(--on-primary)' }
                                            }
                                        >
                                            {actionLabel(log.action)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3" style={{ color: 'var(--sub-text)' }}>{log.description || '-'}</td>
                                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--sub-text)', opacity: 0.75 }}>{log.ip_address || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
        </div>
    );
}
