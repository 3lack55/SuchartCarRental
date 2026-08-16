import { useEffect, useState } from 'react';
import { deleteVehicle, getVehicleById } from '../../services/vehicles/vehiclesAPI.js';
import { useAuth } from '../../context/auth/useAuth.js';

const DOCUMENT_LABELS = {
  tax: 'ภาษี',
  act: 'พรบ.',
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
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    if (!user?.token) {
      setError('กรุณาเข้าสู่ระบบก่อนใช้งาน');
      setLoading(false);
      return () => { cancelled = true; };
    }

    getVehicleById(user.token, vehicleId)
      .then((data) => { if (!cancelled) setVehicle(data.data || data); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [vehicleId, user?.token]);

  async function handleDelete() {
    if (!user?.token || !vehicleId) return;

    setDeleting(true);
    setError(null);

    try {
      await deleteVehicle(user.token, vehicleId);
      onDeleted?.();
      onClose();
    } catch (err) {
      setError(err.message || 'ไม่สามารถลบข้อมูลรถได้');
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border shadow-xl" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)', boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18)' }}>
        {loading && (
          <div className="flex items-center justify-center p-16" style={{ color: 'var(--sub-text)' }}>กำลังโหลดข้อมูล...</div>
        )}

        {error && (
          <div className="p-6">
            <p className="text-sm" style={{ color: 'var(--status-danger)' }}>{error}</p>
            <button onClick={onClose} className="mt-4 text-sm underline" style={{ color: 'var(--sub-text)' }}>ปิด</button>
          </div>
        )}

        {confirmOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)' }} onClick={(e) => { if (e.target === e.currentTarget) setConfirmOpen(false); }}>
            <div className="w-full max-w-sm rounded-2xl border p-5 shadow-xl" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--page-text)' }}>ยืนยันการลบ</h3>
              <p className="mt-2 text-sm" style={{ color: 'var(--sub-text)' }}>
                คุณต้องการลบข้อมูลรถนี้ใช่หรือไม่?
                <span className="mt-2 block font-medium" style={{ color: 'var(--page-text)' }}>
                  {vehicle?.plate_number} · {vehicle?.plate_province}
                </span>
              </p>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  className="flex-1 rounded-xl border py-2.5 text-sm font-medium"
                  style={{ backgroundColor: 'var(--surface-soft)', borderColor: 'var(--surface-border)', color: 'var(--page-text)' }}
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 rounded-xl py-2.5 text-sm font-medium disabled:opacity-50"
                  style={{ backgroundColor: 'var(--status-danger)', color: '#ffffff' }}
                >
                  {deleting ? 'กำลังลบ...' : 'ตกลง'}
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && vehicle && (
          <>
            <div className="flex items-start justify-between border-b p-5" style={{ borderColor: 'var(--surface-border)' }}>
              <div>
                <p className="font-semibold" style={{ color: 'var(--page-text)' }}>{vehicle.plate_number} · {vehicle.plate_province}</p>
                <p className="mt-0.5 text-sm" style={{ color: 'var(--sub-text)' }}>
                  {vehicle.brand_model || 'ไม่ระบุรุ่น'}{vehicle.type ? ` · ${vehicle.type.type_name}` : ''}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="ปิด"
                className="rounded-lg p-1.5 transition-colors"
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
                  <span style={{ color: 'var(--sub-text)' }}>{vehicle.driver.phone}</span>
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
              {vehicle.documents.length === 0 ? (
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
                className="flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors"
                style={{ backgroundColor: 'var(--surface-soft)', borderColor: 'var(--surface-border)', color: 'var(--page-text)' }}
              >
                แก้ไข
              </button>
              <button
                onClick={() => setConfirmOpen(true)}
                disabled={deleting}
                className="flex-1 rounded-xl border py-2.5 text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: 'var(--status-danger-soft)', borderColor: 'var(--status-danger)', color: 'var(--status-danger)' }}
              >
                {deleting ? 'กำลังลบ...' : 'ลบ'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}