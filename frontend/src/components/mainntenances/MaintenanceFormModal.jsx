import { useState } from 'react';
import Modal from '../globals/Modal.jsx';
import InfoTooltip from '../globals/InfoTooltip.jsx';
import { useCreateMaintenance, useUpdateMaintenance } from "../../services/maintenances/maintenancesQueries.js";
import { useServiceCatalog } from '../../services/lookups/lookupQueries.js';
import { useVehicles } from '../../services/vehicles/vehiclesQueries.js';

let tempIdCounter = 0;
function nextTempId() { return `tmp-${++tempIdCounter}`; }

function emptyItem() {
    return { tempId: nextTempId(), service_type_id: '', service_category_id: '', service_item_id: '', quantity: 1, unit_price: '', remark: '' };
}

const labelStyle = { color: 'var(--sub-text)' };
const inputStyle = { backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', borderColor: 'var(--surface-border)' };
const disabledInputStyle = { ...inputStyle, backgroundColor: 'var(--surface)', opacity: 0.6, cursor: 'not-allowed' };

// maintenance: ส่งมาถ้าเป็นโหมดแก้ไข, ไม่ส่งมา = โหมดเพิ่มใหม่
export default function MaintenanceFormModal({ maintenance, onClose, onSaved }) {
    const isEdit = Boolean(maintenance);

    const catalogQuery = useServiceCatalog();
    const vehiclesQuery = useVehicles();

    const catalog = catalogQuery.data?.data ?? [];
    const vehicles = vehiclesQuery.data?.data ?? [];
    const loadingOptions = catalogQuery.isLoading || vehiclesQuery.isLoading;
    const optionsError = catalogQuery.error || vehiclesQuery.error;

    const [header, setHeader] = useState({
        vehicle_id: maintenance?.vehicle_id ?? '',
        service_date: maintenance?.service_date ? maintenance.service_date.slice(0, 10) : '',
        garage_name: maintenance?.garage_name ?? '',
        garage_type: maintenance?.garage_type ?? 'center',
        receipt_number: maintenance?.receipt_number ?? '',
        mileage: maintenance?.mileage ?? '',
        next_service_mileage: maintenance?.next_service_mileage ?? '',
    });

    const [items, setItems] = useState(
        maintenance?.items?.length
            ? maintenance.items.map((i) => ({
                tempId: nextTempId(),
                service_type_id: i.service_type_id,
                service_category_id: i.service_category_id,
                service_item_id: i.service_item_id,
                quantity: i.quantity,
                unit_price: i.unit_price,
                remark: i.remark ?? '',
            }))
            : [emptyItem()]
    );

    const [error, setError] = useState(null);

    const createMaintenance = useCreateMaintenance();
    const updateMaintenance = useUpdateMaintenance();
    const submitting = createMaintenance.isPending || updateMaintenance.isPending;

    function updateHeader(field, value) {
        setHeader((prev) => ({ ...prev, [field]: value }));
    }

    function updateItem(tempId, field, value) {
        setItems((prev) => prev.map((it) => {
            if (it.tempId !== tempId) return it;
            const updated = { ...it, [field]: value };
            // เปลี่ยนประเภทแล้วต้องล้างหมวด/รายการที่เลือกไว้ เพราะอาจไม่อยู่ใต้ประเภทใหม่แล้ว
            if (field === 'service_type_id') { updated.service_category_id = ''; updated.service_item_id = ''; }
            if (field === 'service_category_id') { updated.service_item_id = ''; }
            return updated;
        }));
    }

    function addItemRow() {
        setItems((prev) => [...prev, emptyItem()]);
    }

    function removeItemRow(tempId) {
        setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.tempId !== tempId) : prev));
    }

    function categoriesFor(typeId) {
        const type = catalog.find((t) => String(t.service_type_id) === String(typeId));
        return type?.categories ?? [];
    }

    function itemsFor(typeId, categoryId) {
        const category = categoriesFor(typeId).find((c) => String(c.service_category_id) === String(categoryId));
        return category?.items ?? [];
    }

    function lineTotal(it) {
        return (Number(it.quantity) || 0) * (Number(it.unit_price) || 0);
    }

    const totalCost = items.reduce((sum, it) => sum + lineTotal(it), 0);

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);

        try {
            const payload = {
                vehicle_id: Number(header.vehicle_id),
                service_date: header.service_date,
                garage_name: header.garage_name,
                garage_type: header.garage_type,
                receipt_number: header.receipt_number || null,
                mileage: Number(header.mileage),
                next_service_mileage: header.next_service_mileage ? Number(header.next_service_mileage) : null,
                items: items.map((it) => ({
                    service_item_id: Number(it.service_item_id),
                    quantity: Number(it.quantity),
                    unit_price: Number(it.unit_price),
                    remark: it.remark || null,
                })),
            };

            const saved = isEdit
                ? await updateMaintenance.mutateAsync({ id: maintenance.maintenance_id, data: payload })
                : await createMaintenance.mutateAsync(payload);
            onSaved(saved);
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <Modal title={isEdit ? 'แก้ไขใบซ่อมบำรุง' : 'บันทึกการซ่อมบำรุง'} onClose={onClose} maxWidth="max-w-2xl">
            {loadingOptions ? (
                <div role="status" className="flex items-center justify-center p-16" style={{ color: 'var(--sub-text)' }}>กำลังโหลดข้อมูล...</div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5 p-5">
                    {/* ข้อมูลใบซ่อม */}
                    <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em]" style={labelStyle}>ข้อมูลใบซ่อม</p>

                        <div>
                            <label htmlFor="maintenance-vehicle" className="mb-1.5 block text-xs font-medium" style={labelStyle}>รถ</label>
                            <select
                                id="maintenance-vehicle"
                                required
                                value={header.vehicle_id}
                                onChange={(e) => updateHeader('vehicle_id', e.target.value)}
                                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                                style={inputStyle}
                            >
                                <option value="" disabled>เลือกรถ</option>
                                {vehicles.map((v) => (
                                    <option key={v.vehicle_id} value={v.vehicle_id}>{v.plate_number} · {v.plate_province}{v.brand_model ? ` (${v.brand_model})` : ''}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <label htmlFor="maintenance-service-date" className="mb-1.5 block text-xs font-medium" style={labelStyle}>วันที่ซ่อม</label>
                                <input
                                    id="maintenance-service-date"
                                    required
                                    type="date"
                                    value={header.service_date}
                                    onChange={(e) => updateHeader('service_date', e.target.value)}
                                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label htmlFor="maintenance-garage-type" className="mb-1.5 flex items-center text-xs font-medium" style={labelStyle}>
                                    ประเภทสถานที่
                                    <InfoTooltip text="ศูนย์บริการ = ศูนย์ตัวแทนจำหน่ายอย่างเป็นทางการ, อู่ทั่วไป = อู่ซ่อมนอกเครือข่าย" />
                                </label>
                                <select
                                    id="maintenance-garage-type"
                                    value={header.garage_type}
                                    onChange={(e) => updateHeader('garage_type', e.target.value)}
                                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                                    style={inputStyle}
                                >
                                    <option value="center">ศูนย์บริการ</option>
                                    <option value="shop">อู่ทั่วไป</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="maintenance-garage-name" className="mb-1.5 block text-xs font-medium" style={labelStyle}>ชื่อศูนย์/อู่</label>
                            <input
                                id="maintenance-garage-name"
                                required
                                value={header.garage_name}
                                onChange={(e) => updateHeader('garage_name', e.target.value)}
                                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                                style={inputStyle}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <label htmlFor="maintenance-receipt-number" className="mb-1.5 flex items-center text-xs font-medium" style={labelStyle}>
                                    เลขที่ใบเสร็จ
                                    <InfoTooltip text="ไม่บังคับ กรอกไว้เพื่ออ้างอิงกับใบเสร็จตัวจริง" />
                                </label>
                                <input
                                    id="maintenance-receipt-number"
                                    value={header.receipt_number}
                                    onChange={(e) => updateHeader('receipt_number', e.target.value)}
                                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label htmlFor="maintenance-mileage" className="mb-1.5 flex items-center text-xs font-medium" style={labelStyle}>
                                    เลขไมล์ (กม.)
                                    <InfoTooltip text="เลขไมล์ของรถ ณ วันที่เข้าซ่อมครั้งนี้" />
                                </label>
                                <input
                                    id="maintenance-mileage"
                                    required
                                    type="number"
                                    min="0"
                                    value={header.mileage}
                                    onChange={(e) => updateHeader('mileage', e.target.value)}
                                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="maintenance-next-service-mileage" className="mb-1.5 flex items-center text-xs font-medium" style={labelStyle}>
                                นัดครั้งถัดไปที่เลขไมล์
                                <InfoTooltip text="ไม่บังคับ ใช้แจ้งเตือนเมื่อรถวิ่งถึงเลขไมล์นี้ว่าถึงกำหนดเข้าซ่อมอีกครั้ง" />
                            </label>
                            <input
                                id="maintenance-next-service-mileage"
                                type="number"
                                min="0"
                                value={header.next_service_mileage}
                                onChange={(e) => updateHeader('next_service_mileage', e.target.value)}
                                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* รายการซ่อม */}
                    <div className="space-y-3 border-t pt-4" style={{ borderColor: 'var(--surface-border)' }}>
                        <div className="flex items-center justify-between">
                            <p className="flex items-center text-xs font-semibold uppercase tracking-[0.12em]" style={labelStyle}>
                                รายการซ่อม
                                <InfoTooltip text="เลือกตามลำดับ ประเภท → หมวด → รายการ แล้วกรอกจำนวนและราคาต่อหน่วย" />
                            </p>
                            <button
                                type="button"
                                onClick={addItemRow}
                                className="cursor-pointer text-sm font-medium hover:underline"
                                style={{ color: 'var(--primary-color)' }}
                            >
                                + เพิ่มรายการ
                            </button>
                        </div>

                        <div className="space-y-3">
                            {items.map((it, idx) => (
                                <div key={it.tempId} className="rounded-xl border p-3" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-soft)' }}>
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-xs font-medium" style={{ color: 'var(--sub-text)' }}>รายการที่ {idx + 1}</span>
                                        {items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItemRow(it.tempId)}
                                                className="cursor-pointer text-xs hover:underline"
                                                style={{ color: 'var(--status-danger)' }}
                                            >
                                                ลบรายการนี้
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                        <select
                                            required
                                            aria-label={`ประเภท รายการที่ ${idx + 1}`}
                                            value={it.service_type_id}
                                            onChange={(e) => updateItem(it.tempId, 'service_type_id', e.target.value)}
                                            className="rounded-lg border px-2 py-1.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft)"
                                            style={inputStyle}
                                        >
                                            <option value="" disabled>ประเภท</option>
                                            {catalog.map((t) => (
                                                <option key={t.service_type_id} value={t.service_type_id}>{t.service_type_name}</option>
                                            ))}
                                        </select>

                                        <select
                                            required
                                            aria-label={`หมวด รายการที่ ${idx + 1}`}
                                            disabled={!it.service_type_id}
                                            value={it.service_category_id}
                                            onChange={(e) => updateItem(it.tempId, 'service_category_id', e.target.value)}
                                            className="rounded-lg border px-2 py-1.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft)"
                                            style={it.service_type_id ? inputStyle : disabledInputStyle}
                                        >
                                            <option value="" disabled>{it.service_type_id ? 'หมวด' : 'เลือกประเภทก่อน'}</option>
                                            {categoriesFor(it.service_type_id).map((c) => (
                                                <option key={c.service_category_id} value={c.service_category_id}>{c.service_category_name}</option>
                                            ))}
                                        </select>

                                        <select
                                            required
                                            aria-label={`รายการ รายการที่ ${idx + 1}`}
                                            disabled={!it.service_category_id}
                                            value={it.service_item_id}
                                            onChange={(e) => updateItem(it.tempId, 'service_item_id', e.target.value)}
                                            className="rounded-lg border px-2 py-1.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft)"
                                            style={it.service_category_id ? inputStyle : disabledInputStyle}
                                        >
                                            <option value="" disabled>{it.service_category_id ? 'รายการ' : 'เลือกหมวดก่อน'}</option>
                                            {itemsFor(it.service_type_id, it.service_category_id).map((i) => (
                                                <option key={i.service_item_id} value={i.service_item_id}>{i.service_item_name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                                        <input
                                            required
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="จำนวน"
                                            aria-label={`จำนวน รายการที่ ${idx + 1}`}
                                            value={it.quantity}
                                            onChange={(e) => updateItem(it.tempId, 'quantity', e.target.value)}
                                            className="rounded-lg border px-2 py-1.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft)"
                                            style={inputStyle}
                                        />
                                        <input
                                            required
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="ราคาต่อหน่วย"
                                            aria-label={`ราคาต่อหน่วย รายการที่ ${idx + 1}`}
                                            value={it.unit_price}
                                            onChange={(e) => updateItem(it.tempId, 'unit_price', e.target.value)}
                                            className="rounded-lg border px-2 py-1.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft)"
                                            style={inputStyle}
                                        />
                                        <input
                                            placeholder="หมายเหตุ (ไม่บังคับ)"
                                            aria-label={`หมายเหตุ รายการที่ ${idx + 1}`}
                                            value={it.remark}
                                            onChange={(e) => updateItem(it.tempId, 'remark', e.target.value)}
                                            className="rounded-lg border px-2 py-1.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft)"
                                            style={inputStyle}
                                        />
                                    </div>

                                    <div className="mt-2 text-right text-xs" style={{ color: 'var(--sub-text)' }}>
                                        ยอดรายการนี้: ฿{lineTotal(it).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end text-sm">
                            <span style={{ color: 'var(--sub-text)' }}>ยอดรวมทั้งหมด: </span>
                            <span className="ml-1.5 font-semibold" style={{ color: 'var(--page-text)' }}>฿{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    {(error || optionsError) && (
                        <p role="alert" className="text-sm" style={{ color: 'var(--status-danger)' }}>{error || optionsError.message}</p>
                    )}

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
            )}
        </Modal>
    );
}
