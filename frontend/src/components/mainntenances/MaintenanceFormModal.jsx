import { useState } from 'react';
import Modal from '../globals/Modal.jsx';
import { useCreateMaintenance, useUpdateMaintenance } from "../../services/maintenances/maintenancesQueries.js";
import { useServiceCatalog } from '../../services/lookups/lookupQueries.js';
import { useVehicles } from '../../services/vehicles/vehiclesQueries.js';

let tempIdCounter = 0;
function nextTempId() { return `tmp-${++tempIdCounter}`; }

function emptyItem() {
    return { tempId: nextTempId(), service_type_id: '', service_category_id: '', service_item_id: '', quantity: 1, unit_price: '', remark: '' };
}

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

    const totalCost = items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0), 0);

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
                <div className="flex items-center justify-center p-16 text-stone-400">กำลังโหลดข้อมูล...</div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5 p-5">
                    {/* header ใบซ่อม */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <label className="mb-1 block text-xs font-medium text-stone-500">รถ</label>
                            <select
                                required
                                value={header.vehicle_id}
                                onChange={(e) => updateHeader('vehicle_id', e.target.value)}
                                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                            >
                                <option value="" disabled>เลือกรถ</option>
                                {vehicles.map((v) => (
                                    <option key={v.vehicle_id} value={v.vehicle_id}>{v.plate_number} · {v.plate_province}{v.brand_model ? ` (${v.brand_model})` : ''}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-stone-500">วันที่ซ่อม</label>
                            <input
                                required
                                type="date"
                                value={header.service_date}
                                onChange={(e) => updateHeader('service_date', e.target.value)}
                                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-stone-500">ประเภทสถานที่</label>
                            <select
                                value={header.garage_type}
                                onChange={(e) => updateHeader('garage_type', e.target.value)}
                                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                            >
                                <option value="center">ศูนย์บริการ</option>
                                <option value="shop">อู่ทั่วไป</option>
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className="mb-1 block text-xs font-medium text-stone-500">ชื่อศูนย์/อู่</label>
                            <input
                                required
                                value={header.garage_name}
                                onChange={(e) => updateHeader('garage_name', e.target.value)}
                                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-stone-500">เลขที่ใบเสร็จ</label>
                            <input
                                value={header.receipt_number}
                                onChange={(e) => updateHeader('receipt_number', e.target.value)}
                                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-stone-500">เลขไมล์ (กม.)</label>
                            <input
                                required
                                type="number"
                                min="0"
                                value={header.mileage}
                                onChange={(e) => updateHeader('mileage', e.target.value)}
                                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="mb-1 block text-xs font-medium text-stone-500">นัดครั้งถัดไปที่เลขไมล์ (ไม่บังคับ)</label>
                            <input
                                type="number"
                                min="0"
                                value={header.next_service_mileage}
                                onChange={(e) => updateHeader('next_service_mileage', e.target.value)}
                                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                            />
                        </div>
                    </div>

                    {/* รายการซ่อม */}
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium text-stone-600">รายการซ่อม</p>
                            <button
                                type="button"
                                onClick={addItemRow}
                                className="text-sm font-medium text-emerald-600 hover:underline"
                            >
                                + เพิ่มรายการ
                            </button>
                        </div>

                        <div className="space-y-3">
                            {items.map((it, idx) => (
                                <div key={it.tempId} className="rounded-lg border border-stone-100 p-3">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-xs font-medium text-stone-400">รายการที่ {idx + 1}</span>
                                        {items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItemRow(it.tempId)}
                                                className="text-xs text-red-500 hover:underline"
                                            >
                                                ลบรายการนี้
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <select
                                            required
                                            value={it.service_type_id}
                                            onChange={(e) => updateItem(it.tempId, 'service_type_id', e.target.value)}
                                            className="rounded-lg border border-stone-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-400"
                                        >
                                            <option value="" disabled>ประเภท</option>
                                            {catalog.map((t) => (
                                                <option key={t.service_type_id} value={t.service_type_id}>{t.service_type_name}</option>
                                            ))}
                                        </select>

                                        <select
                                            required
                                            disabled={!it.service_type_id}
                                            value={it.service_category_id}
                                            onChange={(e) => updateItem(it.tempId, 'service_category_id', e.target.value)}
                                            className="rounded-lg border border-stone-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-400 disabled:bg-stone-50"
                                        >
                                            <option value="" disabled>หมวด</option>
                                            {categoriesFor(it.service_type_id).map((c) => (
                                                <option key={c.service_category_id} value={c.service_category_id}>{c.service_category_name}</option>
                                            ))}
                                        </select>

                                        <select
                                            required
                                            disabled={!it.service_category_id}
                                            value={it.service_item_id}
                                            onChange={(e) => updateItem(it.tempId, 'service_item_id', e.target.value)}
                                            className="rounded-lg border border-stone-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-400 disabled:bg-stone-50"
                                        >
                                            <option value="" disabled>รายการ</option>
                                            {itemsFor(it.service_type_id, it.service_category_id).map((i) => (
                                                <option key={i.service_item_id} value={i.service_item_id}>{i.service_item_name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mt-2 grid grid-cols-3 gap-2">
                                        <input
                                            required
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="จำนวน"
                                            value={it.quantity}
                                            onChange={(e) => updateItem(it.tempId, 'quantity', e.target.value)}
                                            className="rounded-lg border border-stone-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-400"
                                        />
                                        <input
                                            required
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="ราคาต่อหน่วย"
                                            value={it.unit_price}
                                            onChange={(e) => updateItem(it.tempId, 'unit_price', e.target.value)}
                                            className="rounded-lg border border-stone-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-400"
                                        />
                                        <input
                                            placeholder="หมายเหตุ (ไม่บังคับ)"
                                            value={it.remark}
                                            onChange={(e) => updateItem(it.tempId, 'remark', e.target.value)}
                                            className="rounded-lg border border-stone-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-400"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-3 flex justify-end text-sm">
                            <span className="text-stone-500">ยอดรวมทั้งหมด: </span>
                            <span className="ml-1.5 font-medium text-stone-800">฿{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    {(error || optionsError) && <p className="text-sm text-red-600">{error || optionsError.message}</p>}

                    <div className="flex gap-2 border-t border-stone-100 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-lg border border-stone-200 py-2 text-sm text-stone-600 hover:bg-stone-50"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                            {submitting ? 'กำลังบันทึก...' : 'บันทึก'}
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    );
}