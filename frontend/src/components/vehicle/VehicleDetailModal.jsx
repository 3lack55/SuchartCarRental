import { useId, useState } from 'react';
import { useDeleteVehicle, useRestoreVehicle, useVehicle } from '../../services/vehicles/vehiclesQueries.js';
import { useAuth } from '../../context/auth/useAuth.js';
import { useModalA11y } from '../../hooks/useModalA11y.js';
import ConfirmDialog from '../globals/ConfirmDialog.jsx';
import DocumentFormModal from '../documents/DocumentFormModal.jsx';
import { DOCUMENT_TYPE_META } from '../documents/documentMeta.js';
import { formatPhone } from '../../utils/phone.js';
import VehicleTypeBadge from './VehicleTypeBadge.jsx';

const DOCUMENT_LABELS = {
  act_tax: 'พรบ. และภาษี',
  insurance: 'ประกันภาคสมัครใจ',
};

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

// สีตามความเร่งด่วน: หมดแล้ว = แดง, ใกล้หมด (<=30วัน) = เหลือง, ปกติ = เขียว
function documentStatusStyle(daysRemaining) {
  if (daysRemaining < 0) return { label: `หมดอายุแล้ว ${Math.abs(daysRemaining)} วัน`, className: 'bg-red-50 text-red-600' };
  if (daysRemaining <= 30) return { label: `เหลือ ${daysRemaining} วัน`, className: 'bg-amber-50 text-amber-600' };
  return { label: `เหลือ ${daysRemaining} วัน`, className: 'bg-emerald-50 text-emerald-700' };
}

export default function VehicleDetailModal({ vehicleId, onClose, onEdit, onDeleted }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  // ประเภทเอกสารที่กำลังเพิ่มอยู่ (จากปุ่ม "+ เพิ่ม" ของเอกสารที่ยังขาด) หรือ null ถ้าไม่ได้เปิดฟอร์ม
  const [addDocType, setAddDocType] = useState(null);
  const { user } = useAuth();
  const titleId = useId();
  const panelRef = useModalA11y(onClose);

  const { data, isLoading, error: queryError } = useVehicle(vehicleId);
  const vehicle = data?.data ?? data ?? null;
  const deleteVehicle = useDeleteVehicle();
  const restoreVehicle = useRestoreVehicle();

  const loading = isLoading;
  const error = !user?.token
    ? 'กรุณาเข้าสู่ระบบก่อนใช้งาน'
    : queryError?.message || deleteVehicle.error?.message || restoreVehicle.error?.message || null;
  const deleting = deleteVehicle.isPending;
  const restoring = restoreVehicle.isPending;

  async function handleDelete() {
    if (!user?.token || !vehicleId) return;

    try {
      await deleteVehicle.mutateAsync(vehicleId);
      onDeleted?.();
      onClose();
    } catch {
      // error is surfaced via deleteVehicle.error
    } finally {
      setConfirmOpen(false);
    }
  }

  async function handleRestore() {
    if (!user?.token || !vehicleId) return;

    try {
      await restoreVehicle.mutateAsync(vehicleId);
    } catch {
      // error is surfaced via restoreVehicle.error
    }
  }

  const missingDocumentTypes = vehicle
    ? Object.keys(DOCUMENT_TYPE_META).filter((type) => !vehicle.documents.some((d) => d.document_type === type))
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border shadow-xl outline-none"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)', boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18)' }}
      >
        {loading && (
          <div role="status" className="flex items-center justify-center p-16" style={{ color: 'var(--sub-text)' }}>กำลังโหลดข้อมูล...</div>
        )}

        {error && (
          <div className="p-6">
            <p className="text-sm" style={{ color: 'var(--status-danger)' }}>{error}</p>
            <button onClick={onClose} className="mt-4 cursor-pointer text-sm underline transition-opacity hover:opacity-70" style={{ color: 'var(--sub-text)' }}>ปิด</button>
          </div>
        )}

        {confirmOpen && (
          <ConfirmDialog
            title="ยืนยันการลบ"
            message={`คุณต้องการลบข้อมูลรถนี้ใช่หรือไม่? ${vehicle?.plate_number} · ${vehicle?.plate_province}`}
            confirmLabel="ตกลง"
            loading={deleting}
            onConfirm={handleDelete}
            onCancel={() => setConfirmOpen(false)}
          />
        )}

        {!loading && !error && vehicle && (
          <>
            <div className="flex items-start justify-between border-b p-5" style={{ borderColor: 'var(--surface-border)' }}>
              <div>
                <div className="flex items-center gap-2">
                  <p id={titleId} className="font-semibold" style={{ color: 'var(--page-text)' }}>{vehicle.plate_number} · {vehicle.plate_province}</p>
                  <span
                    className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={vehicle.deleted ? { backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', opacity: 0.75 } : { backgroundColor: 'var(--status-success-soft)', color: 'var(--status-success)' }}
                  >
                    {vehicle.deleted ? 'ปลดระวาง' : 'ใช้งานอยู่'}
                  </span>
                </div>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm" style={{ color: 'var(--sub-text)' }}>
                  {vehicle.brand_model || 'ไม่ระบุรุ่น'}
                  {vehicle.type && (
                    <>
                      ·
                      <VehicleTypeBadge typeName={vehicle.type.type_name} color={vehicle.type.color} />
                    </>
                  )}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="ปิด"
                className="cursor-pointer rounded-lg p-1.5 transition-colors"
                style={{ color: 'var(--icon-muted)', backgroundColor: 'transparent' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-soft)'; e.currentTarget.style.color = 'var(--page-text)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--icon-muted)'; }}
              >
                ✕
              </button>
            </div>

            <div className="border-b p-5" style={{ borderColor: 'var(--surface-border)' }}>
              <p className="mb-2 text-sm font-semibold" style={{ color: 'var(--sub-text)' }}>คนขับที่ดูแล</p>
              {vehicle.driver ? (
                <div className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-soft)' }}>
                  <span style={{ color: 'var(--page-text)' }}>{vehicle.driver.name}</span>
                  <span style={{ color: 'var(--sub-text)' }}>{formatPhone(vehicle.driver.phone)}</span>
                </div>
              ) : (
                <p className="text-sm" style={{ color: 'var(--icon-muted)' }}>ยังไม่มีคนขับประจำ</p>
              )}
              {vehicle.unpaid_violations > 0 && (
                <span className="mt-2 inline-block rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ backgroundColor: 'var(--status-danger-soft)', color: 'var(--status-danger)' }}>
                  ใบสั่งค้างจ่าย {vehicle.unpaid_violations} รายการ
                </span>
              )}
            </div>

            <div className="border-b p-5" style={{ borderColor: 'var(--surface-border)' }}>
              <p className="mb-2 text-sm font-semibold" style={{ color: 'var(--sub-text)' }}>ภาษี พรบ. และประกัน</p>
              {vehicle.documents.length === 0 && missingDocumentTypes.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--icon-muted)' }}>ยังไม่มีข้อมูลเอกสาร</p>
              ) : (
                <ul className="space-y-2">
                  {vehicle.documents.map((doc) => {
                    const status = documentStatusStyle(doc.days_remaining);
                    return (
                      <li
                        key={doc.document_type}
                        className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm"
                        style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-soft)' }}
                      >
                        <div>
                          <p style={{ color: 'var(--page-text)' }}>{DOCUMENT_LABELS[doc.document_type] || doc.document_type}</p>
                          <p className="text-xs" style={{ color: 'var(--sub-text)' }}>หมดอายุ {formatDate(doc.expire_date)}</p>
                        </div>
                        <span className="rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ backgroundColor: status.className.includes('red') ? 'var(--status-danger-soft)' : status.className.includes('amber') ? 'var(--status-warning-soft)' : 'var(--status-success-soft)', color: status.className.includes('red') ? 'var(--status-danger)' : status.className.includes('amber') ? 'var(--status-warning)' : 'var(--status-success)' }}>
                          {status.label}
                        </span>
                      </li>
                    );
                  })}
                  {/* เอกสารที่ยังไม่มี: เพิ่มได้จากตรงนี้เลยแทนที่จะต้องไปหน้าเอกสารแล้วค้นหารถคันนี้ใหม่ */}
                  {missingDocumentTypes.map((type) => (
                    <li
                      key={type}
                      className="flex items-center justify-between rounded-xl border border-dashed px-3 py-2 text-sm"
                      style={{ borderColor: 'var(--surface-border)' }}
                    >
                      <div>
                        <p style={{ color: 'var(--page-text)' }}>{DOCUMENT_TYPE_META[type].label}</p>
                        <p className="text-xs" style={{ color: 'var(--status-danger)' }}>ยังไม่มีข้อมูล</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAddDocType(type)}
                        className="cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-80"
                        style={{ backgroundColor: 'var(--primary-color-soft)', color: 'var(--on-primary)' }}
                      >
                        + เพิ่ม
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-b p-5" style={{ borderColor: 'var(--surface-border)' }}>
              <p className="mb-2 text-sm font-semibold" style={{ color: 'var(--sub-text)' }}>ประวัติซ่อมบำรุงล่าสุด</p>
              {vehicle.recent_maintenances.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--icon-muted)' }}>ยังไม่มีประวัติการซ่อมบำรุง</p>
              ) : (
                <ul className="space-y-2">
                  {vehicle.recent_maintenances.map((m) => (
                    <li key={m.maintenance_id} className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-soft)' }}>
                      <div>
                        <p style={{ color: 'var(--page-text)' }}>{m.garage_name}</p>
                        <p className="text-xs" style={{ color: 'var(--sub-text)' }}>
                          {formatDate(m.service_date)} · {m.total_items} รายการ
                        </p>
                      </div>
                      <span style={{ color: 'var(--page-text)' }}>฿{Number(m.total_cost).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex gap-2 p-5">
              <button
                onClick={() => onEdit(vehicle)}
                className="flex-1 cursor-pointer rounded-xl border py-2.5 text-sm font-medium transition-all hover:opacity-80"
                style={{ backgroundColor: 'var(--surface-soft)', borderColor: 'var(--surface-border)', color: 'var(--page-text)' }}
              >
                แก้ไข
              </button>
              {vehicle.deleted ? (
                <button
                  onClick={handleRestore}
                  disabled={restoring}
                  className="flex-1 cursor-pointer rounded-xl border py-2.5 text-sm font-medium transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ backgroundColor: 'var(--status-success-soft)', borderColor: 'var(--status-success)', color: 'var(--status-success)' }}
                >
                  {restoring ? 'กำลังกู้คืน...' : 'กู้คืนรถ'}
                </button>
              ) : (
                <button
                  onClick={() => setConfirmOpen(true)}
                  disabled={deleting}
                  className="flex-1 cursor-pointer rounded-xl border py-2.5 text-sm font-medium transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ backgroundColor: 'var(--status-danger-soft)', borderColor: 'var(--status-danger)', color: 'var(--status-danger)' }}
                >
                  {deleting ? 'กำลังลบ...' : 'ลบ'}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {addDocType && vehicle && (
        <DocumentFormModal
          mode="add"
          renewFrom={{
            vehicle_id: vehicle.vehicle_id,
            plate_number: vehicle.plate_number,
            plate_province: vehicle.plate_province,
            document_type: addDocType,
          }}
          onClose={() => setAddDocType(null)}
          onSaved={() => setAddDocType(null)}
        />
      )}
    </div>
  );
}
