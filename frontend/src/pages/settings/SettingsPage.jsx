import { useState } from 'react';
import { useAuth } from '../../context/auth/useAuth';
import {
    useVehicleTypes,
    useViolationReasons,
    useCreateViolationReason,
    useUpdateViolationReason,
    useDeleteViolationReason,
} from '../../services/lookups/lookupQueries.js';
import SimpleLookupPanel from '../../components/settings/SimpleLookupPanel.jsx';
import VehicleTypePanel from '../../components/settings/VehicleTypePanel.jsx';
import ServiceCatalogPanel from '../../components/settings/ServiceCatalogPanel.jsx';

const TABS = [
    { id: 'vehicle-types', label: 'ประเภทรถ' },
    { id: 'service-catalog', label: 'บริการซ่อมบำรุง' },
    { id: 'violation-reasons', label: 'สาเหตุการฝ่าฝืนกฎจราจร' },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState(TABS[0].id);
    const { user } = useAuth();

    const canManage = user?.role === 'admin' || user?.role === 'manager';
    const canDelete = user?.role === 'admin';

    const vehicleTypes = useVehicleTypes();
    const violationReasons = useViolationReasons();

    return (
        <div className="space-y-5 mx-auto max-w-5xl" style={{ color: 'var(--page-text)' }}>
            <header className="rounded-2xl border p-5 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                <p className="text-xs font-medium uppercase tracking-[0.18em]" style={{ color: 'var(--sub-text)' }}>Settings</p>
                <h1 className="mt-1 text-2xl font-semibold" style={{ color: 'var(--page-text)' }}>ตั้งค่าตัวเลือกในระบบ</h1>
                <p className="mt-1 text-sm" style={{ color: 'var(--sub-text)' }}>
                    จัดการรายการตัวเลือกที่ใช้ในดรอปดาวน์ของฟอร์มต่างๆ เช่น ประเภทรถ บริการซ่อมบำรุง และสาเหตุการฝ่าฝืนกฎจราจร
                </p>
                {!canManage && (
                    <p className="mt-3 text-sm" style={{ color: 'var(--status-danger)' }}>
                        คุณมีสิทธิ์ดูข้อมูลได้เท่านั้น ต้องเป็นผู้ดูแลระบบหรือผู้จัดการจึงจะเพิ่ม/แก้ไข/ลบข้อมูลได้
                    </p>
                )}
            </header>

            <div className="rounded-2xl border shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
                <div className="flex flex-wrap gap-1 border-b p-2" style={{ borderColor: 'var(--surface-border)' }}>
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className="cursor-pointer whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200"
                            style={
                                activeTab === tab.id
                                    ? { backgroundColor: 'var(--primary-color-soft)', color: 'var(--on-primary)' }
                                    : { backgroundColor: 'transparent', color: 'var(--sub-text)' }
                            }
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-5">
                    {activeTab === 'vehicle-types' && (
                        <VehicleTypePanel
                            items={vehicleTypes.data?.data ?? []}
                            isLoading={vehicleTypes.isLoading}
                            error={vehicleTypes.error?.message}
                            canManage={canManage}
                            canDelete={canDelete}
                        />
                    )}

                    {activeTab === 'service-catalog' && (
                        <ServiceCatalogPanel canManage={canManage} canDelete={canDelete} />
                    )}

                    {activeTab === 'violation-reasons' && (
                        <SimpleLookupPanel
                            items={violationReasons.data?.data ?? []}
                            idKey="reason_id"
                            nameKey="reason_name"
                            maxLength={100}
                            addPlaceholder="เพิ่มสาเหตุการฝ่าฝืนกฎจราจรใหม่"
                            emptyText="ยังไม่มีสาเหตุการฝ่าฝืนกฎจราจรในระบบ"
                            isLoading={violationReasons.isLoading}
                            error={violationReasons.error?.message}
                            canManage={canManage}
                            canDelete={canDelete}
                            useCreate={useCreateViolationReason}
                            useUpdate={useUpdateViolationReason}
                            useDelete={useDeleteViolationReason}
                            deleteConfirmTitle="ลบสาเหตุการฝ่าฝืนกฎจราจร"
                            deleteConfirmMessageFor={(item) => `ยืนยันการลบ "${item.reason_name}"? จะลบไม่ได้ถ้ามีบันทึกการฝ่าฝืนที่อ้างอิงสาเหตุนี้อยู่`}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
