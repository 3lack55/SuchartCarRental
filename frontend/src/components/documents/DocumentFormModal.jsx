import { useState } from 'react';
import Modal from '../globals/Modal.jsx';
import InfoTooltip from '../globals/InfoTooltip.jsx';
import DatePicker from '../globals/DatePicker.jsx';
import { useCreateDocument, useUpdateDocument } from '../../services/documents/documentsQueries.js';
import { useVehicles } from '../../services/vehicles/vehiclesQueries.js';
import { DOCUMENT_TYPE_META } from './documentMeta.js';

const labelStyle = { color: 'var(--sub-text)' };
const inputStyle = { backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', borderColor: 'var(--surface-border)' };
const lockedStyle = { ...inputStyle, opacity: 0.7, cursor: 'not-allowed' };

// mode: 'create' (เลือกรถ/ประเภทได้อิสระ), 'renew' (ต่ออายุ ล็อกรถ/ประเภทจาก renewFrom, ค่าอื่นว่างไว้ให้กรอกใหม่),
// 'add' (เพิ่มเอกสารที่ยังขาดจากหน้ารายละเอียดรถ ล็อกรถ/ประเภทเหมือน renew), 'edit' (แก้ไข record เดิม)
export default function DocumentFormModal({ mode = 'create', document, renewFrom, onClose, onSaved }) {
    const isEdit = mode === 'edit';
    const locked = mode !== 'create';
    const source = isEdit ? document : renewFrom;

    const vehiclesQuery = useVehicles();
    const vehicles = vehiclesQuery.data?.data ?? [];

    const [form, setForm] = useState({
        vehicle_id: source?.vehicle_id ?? '',
        document_type: source?.document_type ?? '',
        provider: isEdit ? (document?.provider ?? '') : '',
        last_paid_date: isEdit && document?.last_paid_date ? document.last_paid_date.slice(0, 10) : '',
        expire_date: isEdit && document?.expire_date ? document.expire_date.slice(0, 10) : '',
    });
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState(null);

    const createDocument = useCreateDocument();
    const updateDocument = useUpdateDocument();
    const submitting = createDocument.isPending || updateDocument.isPending;

    const meta = DOCUMENT_TYPE_META[form.document_type];

    function handleChange(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    }

    function validate() {
        const nextErrors = {};
        if (!locked) {
            if (!form.vehicle_id) nextErrors.vehicle_id = 'กรุณาเลือกรถ';
            if (!form.document_type) nextErrors.document_type = 'กรุณาเลือกประเภทเอกสาร';
        }
        if (!form.last_paid_date) nextErrors.last_paid_date = 'กรุณาเลือกวันที่ชำระล่าสุด';
        if (!form.expire_date) nextErrors.expire_date = 'กรุณาเลือกวันหมดอายุ';
        else if (form.last_paid_date && form.expire_date <= form.last_paid_date) nextErrors.expire_date = 'วันหมดอายุต้องหลังวันที่ชำระล่าสุด';
        return nextErrors;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setFormError(null);

        const nextErrors = validate();
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        try {
            const payload = {
                provider: form.provider.trim() || null,
                last_paid_date: form.last_paid_date,
                expire_date: form.expire_date,
            };

            let saved;
            if (isEdit) {
                saved = await updateDocument.mutateAsync({
                    documentType: document.document_type,
                    documentId: document.document_id,
                    data: payload,
                });
            } else {
                payload.vehicle_id = Number(form.vehicle_id);
                payload.document_type = form.document_type;
                saved = await createDocument.mutateAsync(payload);
            }

            const successMessage = isEdit ? 'แก้ไขข้อมูลเอกสารเรียบร้อย' : 'บันทึกเอกสารเรียบร้อย';
            onSaved?.(saved, successMessage);
        } catch (err) {
            setFormError(err.message);
        }
    }

    const title = isEdit ? 'แก้ไขข้อมูลเอกสาร' : mode === 'renew' ? 'ต่ออายุเอกสาร' : 'เพิ่มเอกสาร';

    return (
        <Modal title={title} onClose={onClose}>
            <form onSubmit={handleSubmit} noValidate className="space-y-4 p-5">
                {mode === 'renew' && (
                    <p className="rounded-xl px-3 py-2 text-xs" style={{ backgroundColor: 'var(--primary-color-soft)', color: 'var(--on-primary)' }}>
                        การต่ออายุจะบันทึกเป็นรายการใหม่ และเก็บประวัติเอกสารเดิมไว้ให้ครบ
                    </p>
                )}

                <div>
                    <label htmlFor="document-vehicle" className="mb-1.5 block text-xs font-medium" style={labelStyle}>รถ</label>
                    {locked ? (
                        <div id="document-vehicle" className="w-full rounded-xl border px-3 py-2.5 text-sm" style={lockedStyle}>
                            {source?.plate_number} · {source?.plate_province}
                        </div>
                    ) : (
                        <select
                            id="document-vehicle"
                            value={form.vehicle_id}
                            onChange={(e) => handleChange('vehicle_id', e.target.value)}
                            className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                            style={{ ...inputStyle, borderColor: errors.vehicle_id ? 'var(--status-danger)' : 'var(--surface-border)' }}
                        >
                            <option value="" disabled>เลือกรถ</option>
                            {vehicles.map((v) => (
                                <option key={v.vehicle_id} value={v.vehicle_id}>{v.plate_number} · {v.plate_province}{v.brand_model ? ` (${v.brand_model})` : ''}</option>
                            ))}
                        </select>
                    )}
                    {errors.vehicle_id && <p role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{errors.vehicle_id}</p>}
                </div>

                <div>
                    <label htmlFor="document-type" className="mb-1.5 block text-xs font-medium" style={labelStyle}>ประเภทเอกสาร</label>
                    {locked ? (
                        <div id="document-type" className="w-full rounded-xl border px-3 py-2.5 text-sm" style={lockedStyle}>
                            {meta?.label}
                        </div>
                    ) : (
                        <select
                            id="document-type"
                            value={form.document_type}
                            onChange={(e) => handleChange('document_type', e.target.value)}
                            className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                            style={{ ...inputStyle, borderColor: errors.document_type ? 'var(--status-danger)' : 'var(--surface-border)' }}
                        >
                            <option value="" disabled>เลือกประเภทเอกสาร</option>
                            {Object.entries(DOCUMENT_TYPE_META).map(([type, m]) => (
                                <option key={type} value={type}>{m.label}</option>
                            ))}
                        </select>
                    )}
                    {errors.document_type && <p role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{errors.document_type}</p>}
                </div>

                <div>
                    <label htmlFor="document-provider" className="mb-1.5 block text-xs font-medium" style={labelStyle}>ผู้ให้บริการ</label>
                    <input
                        id="document-provider"
                        type="text"
                        value={form.provider}
                        onChange={(e) => handleChange('provider', e.target.value)}
                        placeholder="ไม่บังคับกรอก"
                        className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                        style={inputStyle}
                    />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <label htmlFor="document-last-paid-date" className="mb-1.5 block text-xs font-medium" style={labelStyle}>วันที่ชำระล่าสุด</label>
                        <DatePicker
                            id="document-last-paid-date"
                            value={form.last_paid_date}
                            onChange={(value) => handleChange('last_paid_date', value)}
                            error={Boolean(errors.last_paid_date)}
                        />
                        {errors.last_paid_date && <p role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{errors.last_paid_date}</p>}
                    </div>
                    <div>
                        <label htmlFor="document-expire-date" className="mb-1.5 flex items-center text-xs font-medium" style={labelStyle}>
                            วันหมดอายุ
                            <InfoTooltip text="ต้องอยู่หลังวันที่ชำระล่าสุด" />
                        </label>
                        <DatePicker
                            id="document-expire-date"
                            value={form.expire_date}
                            onChange={(value) => handleChange('expire_date', value)}
                            min={form.last_paid_date || undefined}
                            error={Boolean(errors.expire_date)}
                        />
                        {errors.expire_date && <p role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{errors.expire_date}</p>}
                    </div>
                </div>

                {formError && <p role="alert" className="text-sm" style={{ color: 'var(--status-danger)' }}>{formError}</p>}

                <div className="flex gap-2 border-t pt-4" style={{ borderColor: 'var(--surface-border)' }}>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 cursor-pointer rounded-xl border py-2.5 text-sm font-medium transition-all hover:opacity-80"
                        style={{ backgroundColor: 'var(--surface-soft)', borderColor: 'var(--surface-border)', color: 'var(--page-text)' }}
                    >
                        ยกเลิก
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 cursor-pointer rounded-xl py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ backgroundColor: 'var(--primary-color)', color: 'var(--on-primary)' }}
                    >
                        {submitting ? 'กำลังบันทึก...' : 'บันทึก'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
