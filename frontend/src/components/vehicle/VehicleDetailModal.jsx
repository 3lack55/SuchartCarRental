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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        {loading && (
          <div className="flex items-center justify-center p-16 text-stone-400">กำลังโหลดข้อมูล...</div>
        )}

        {error && (
          <div className="p-6">
            <p className="text-sm text-red-600">{error}</p>
            <button onClick={onClose} className="mt-4 text-sm text-stone-500 hover:underline">ปิด</button>
          </div>
        )}

        {confirmOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4" onClick={(e) => { if (e.target === e.currentTarget) setConfirmOpen(false); }}>
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
              <h3 className="text-lg font-semibold text-stone-800">ยืนยันการลบ</h3>
              <p className="mt-2 text-sm text-stone-600">
                คุณต้องการลบข้อมูลรถนี้ใช่หรือไม่?
                <span className="mt-2 block font-medium text-stone-700">
                  {vehicle?.plate_number} · {vehicle?.plate_province}
                </span>
              </p>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  className="flex-1 rounded-lg border border-stone-200 py-2 text-sm text-stone-600 hover:bg-stone-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? 'กำลังลบ...' : 'ตกลง'}
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && vehicle && (
          <>
            {/* header */}
            <div className="flex items-start justify-between border-b border-stone-100 p-5">
              <div>
                <p className="font-medium text-stone-800">{vehicle.plate_number} · {vehicle.plate_province}</p>
                <p className="mt-0.5 text-sm text-stone-400">
                  {vehicle.brand_model || 'ไม่ระบุรุ่น'}{vehicle.type ? ` · ${vehicle.type.type_name}` : ''}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="ปิด"
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            {/* คนขับที่ดูแล */}
            <div className="border-b border-stone-100 p-5">
              <p className="mb-2 text-sm font-medium text-stone-600">คนขับที่ดูแล</p>
              {vehicle.driver ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-700">{vehicle.driver.name}</span>
                  <span className="text-stone-400">{vehicle.driver.phone}</span>
                </div>
              ) : (
                <p className="text-sm text-stone-400">ยังไม่มีคนขับประจำ</p>
              )}
              {vehicle.unpaid_violations > 0 && (
                <span className="mt-2 inline-block rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600">
                  ใบสั่งค้างจ่าย {vehicle.unpaid_violations} รายการ
                </span>
              )}
            </div>

            {/* สถานะเอกสาร: ภาษี/พรบ/ประกัน */}
            <div className="border-b border-stone-100 p-5">
              <p className="mb-2 text-sm font-medium text-stone-600">ภาษี พรบ. และประกัน</p>
              {vehicle.documents.length === 0 ? (
                <p className="text-sm text-stone-400">ยังไม่มีข้อมูลเอกสาร</p>
              ) : (
                <ul className="space-y-2">
                  {vehicle.documents.map((doc) => {
                    const status = documentStatusStyle(doc.days_remaining);
                    return (
                      <li
                        key={doc.document_type}
                        className="flex items-center justify-between rounded-lg border border-stone-100 px-3 py-2 text-sm"
                      >
                        <div>
                          <p className="text-stone-700">{DOCUMENT_LABELS[doc.document_type] || doc.document_type}</p>
                          <p className="text-xs text-stone-400">หมดอายุ {formatDate(doc.expire_date)}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>
                          {status.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* ประวัติซ่อมบำรุงล่าสุด */}
            <div className="border-b border-stone-100 p-5">
              <p className="mb-2 text-sm font-medium text-stone-600">ประวัติซ่อมบำรุงล่าสุด</p>
              {vehicle.recent_maintenances.length === 0 ? (
                <p className="text-sm text-stone-400">ยังไม่มีประวัติการซ่อมบำรุง</p>
              ) : (
                <ul className="space-y-2">
                  {vehicle.recent_maintenances.map((m) => (
                    <li key={m.maintenance_id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-stone-700">{m.garage_name}</p>
                        <p className="text-xs text-stone-400">
                          {formatDate(m.service_date)} · {m.total_items} รายการ
                        </p>
                      </div>
                      <span className="text-stone-600">฿{Number(m.total_cost).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* actions */}
            <div className="flex gap-2 p-5">
              <button
                onClick={() => onEdit(vehicle)}
                className="flex-1 rounded-lg border border-stone-200 py-2 text-sm text-stone-600 hover:bg-stone-50"
              >
                แก้ไข
              </button>
              <button
                onClick={() => setConfirmOpen(true)}
                disabled={deleting}
                className="flex-1 rounded-lg border border-red-200 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
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