import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import Modal from '../globals/Modal.jsx';
import InfoTooltip from '../globals/InfoTooltip.jsx';
import Select from '../globals/Select.jsx';
import DatePicker from '../globals/DatePicker.jsx';
import { useCreateMaintenance, useUpdateMaintenance } from "../../services/maintenances/maintenancesQueries.js";
import { useCreateServiceType, useCreateServiceCategory, useCreateServiceItem, useServiceCatalog } from '../../services/lookups/lookupQueries.js';
import { useVehicles } from '../../services/vehicles/vehiclesQueries.js';

let tempIdCounter = 0;
function nextTempId() { return `tmp-${++tempIdCounter}`; }

function emptyItem() {
    return { tempId: nextTempId(), service_type_id: '', service_category_id: '', service_item_id: '', quantity: 1, unit_price: 0, remark: '' };
}

const labelStyle = { color: 'var(--sub-text)' };
const inputStyle = { backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)', borderColor: 'var(--surface-border)' };
const errorInputStyle = { ...inputStyle, borderColor: 'var(--status-danger)' };

// maintenance: ส่งมาถ้าเป็นโหมดแก้ไข, ไม่ส่งมา = โหมดเพิ่มใหม่
export default function MaintenanceFormModal({ maintenance, onClose, onSaved }) {
    const isEdit = Boolean(maintenance);

    const catalogQuery = useServiceCatalog();
    const vehiclesQuery = useVehicles();
    const createServiceType = useCreateServiceType();
    const createServiceCategory = useCreateServiceCategory();
    const createServiceItem = useCreateServiceItem();

    const catalog = catalogQuery.data?.data ?? [];
    const vehicles = vehiclesQuery.data?.data ?? [];
    const loadingOptions = catalogQuery.isLoading || vehiclesQuery.isLoading;
    const optionsError = catalogQuery.error || vehiclesQuery.error;

    const [header, setHeader] = useState({
        vehicle_id: maintenance?.vehicle_id ? String(maintenance.vehicle_id) : '',
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
                service_type_id: String(i.service_type_id),
                service_category_id: String(i.service_category_id),
                service_item_id: String(i.service_item_id),
                quantity: i.quantity,
                unit_price: i.unit_price,
                remark: i.remark ?? '',
            }))
            : [emptyItem()]
    );

    const [headerErrors, setHeaderErrors] = useState({});
    const [itemErrors, setItemErrors] = useState({});
    const [error, setError] = useState(null);

    const createMaintenance = useCreateMaintenance();
    const updateMaintenance = useUpdateMaintenance();
    const submitting = createMaintenance.isPending || updateMaintenance.isPending;

    function updateHeader(field, value) {
        setHeader((prev) => ({ ...prev, [field]: value }));
        setHeaderErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
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
        setItemErrors((prev) => (prev[tempId]?.[field] ? { ...prev, [tempId]: { ...prev[tempId], [field]: undefined } } : prev));
    }

    function addItemRow() {
        setItems((prev) => [...prev, emptyItem()]);
    }

    function removeItemRow(tempId) {
        setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.tempId !== tempId) : prev));
        setItemErrors((prev) => {
            if (!prev[tempId]) return prev;
            const next = { ...prev };
            delete next[tempId];
            return next;
        });
    }

    function categoriesFor(typeId) {
        const type = catalog.find((t) => String(t.service_type_id) === String(typeId));
        return type?.categories ?? [];
    }

    function itemsFor(typeId, categoryId) {
        const category = categoriesFor(typeId).find((c) => String(c.service_category_id) === String(categoryId));
        return category?.items ?? [];
    }

    // เพิ่มประเภท/หมวด/รายการใหม่เข้าแคตตาล็อกได้ทันทีจาก dropdown โดยไม่ต้องออกไปหน้าตั้งค่า แล้วเลือกให้อัตโนมัติ
    async function handleCreateType(tempId, name) {
        const result = await createServiceType.mutateAsync({ name });
        updateItem(tempId, 'service_type_id', String(result.data.service_type_id));
    }

    async function handleCreateCategory(tempId, typeId, name) {
        const result = await createServiceCategory.mutateAsync({ name, serviceTypeId: Number(typeId) });
        updateItem(tempId, 'service_category_id', String(result.data.service_category_id));
    }

    async function handleCreateItem(tempId, categoryId, name) {
        const result = await createServiceItem.mutateAsync({ name, categoryId: Number(categoryId) });
        updateItem(tempId, 'service_item_id', String(result.data.service_item_id));
    }

    function lineTotal(it) {
        return (Number(it.quantity) || 0) * (Number(it.unit_price) || 0);
    }

    const totalCost = items.reduce((sum, it) => sum + lineTotal(it), 0);

    function validate() {
        const nextHeaderErrors = {};
        if (!header.vehicle_id) nextHeaderErrors.vehicle_id = 'กรุณาเลือกรถ';
        if (!header.service_date) nextHeaderErrors.service_date = 'กรุณาเลือกวันที่ซ่อม';
        if (!header.garage_name.trim()) nextHeaderErrors.garage_name = 'กรุณากรอกชื่อศูนย์/อู่';
        if (!String(header.mileage).trim()) nextHeaderErrors.mileage = 'กรุณากรอกเลขไมล์';

        const nextItemErrors = {};
        items.forEach((it) => {
            const e = {};
            if (!it.service_type_id) e.service_type_id = 'เลือกประเภท';
            if (!it.service_category_id) e.service_category_id = 'เลือกหมวด';
            if (!it.service_item_id) e.service_item_id = 'เลือกรายการ';
            if (!String(it.quantity).trim()) e.quantity = 'กรอกจำนวน';
            if (!String(it.unit_price).trim()) e.unit_price = 'กรอกราคาต่อหน่วย';
            if (Object.keys(e).length > 0) nextItemErrors[it.tempId] = e;
        });

        return { header: nextHeaderErrors, items: nextItemErrors };
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);

        const { header: nextHeaderErrors, items: nextItemErrors } = validate();
        setHeaderErrors(nextHeaderErrors);
        setItemErrors(nextItemErrors);
        if (Object.keys(nextHeaderErrors).length > 0 || Object.keys(nextItemErrors).length > 0) return;

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
        <Modal title={isEdit ? 'แก้ไขใบซ่อมบำรุง' : 'บันทึกการซ่อมบำรุง'} onClose={onClose} maxWidth="max-w-6xl" maxHeight='max-h-[95vh]'>
            {loadingOptions ? (
                <div role="status" className="flex items-center justify-center p-16" style={{ color: 'var(--sub-text)' }}>กำลังโหลดข้อมูล...</div>
            ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5 p-5">
                    {/* ข้อมูลใบซ่อม */}
                    <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em]" style={labelStyle}>ข้อมูลใบซ่อม</p>

                        <div>
                            <label htmlFor="maintenance-vehicle" className="mb-1.5 block text-xs font-medium" style={labelStyle}>รถ</label>
                            <Select
                                id="maintenance-vehicle"
                                value={header.vehicle_id}
                                onChange={(value) => updateHeader('vehicle_id', value)}
                                placeholder="เลือกรถ"
                                error={Boolean(headerErrors.vehicle_id)}
                                options={vehicles.map((v) => ({ value: String(v.vehicle_id), label: `${v.plate_number} · ${v.plate_province}${v.brand_model ? ` (${v.brand_model})` : ''}` }))}
                            />
                            {headerErrors.vehicle_id && <p role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{headerErrors.vehicle_id}</p>}
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <label htmlFor="maintenance-service-date" className="mb-1.5 block text-xs font-medium" style={labelStyle}>วันที่ซ่อม</label>
                                <DatePicker
                                    id="maintenance-service-date"
                                    value={header.service_date}
                                    onChange={(value) => updateHeader('service_date', value)}
                                    error={Boolean(headerErrors.service_date)}
                                />
                                {headerErrors.service_date && <p role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{headerErrors.service_date}</p>}
                            </div>

                            <div>
                                <label htmlFor="maintenance-garage-type" className="mb-1.5 flex items-center text-xs font-medium" style={labelStyle}>
                                    ประเภทสถานที่
                                    <InfoTooltip text="ศูนย์บริการ = ศูนย์ตัวแทนจำหน่ายอย่างเป็นทางการ, อู่ทั่วไป = อู่ซ่อมนอกเครือข่าย" />
                                </label>
                                <Select
                                    id="maintenance-garage-type"
                                    value={header.garage_type}
                                    onChange={(value) => updateHeader('garage_type', value)}
                                    options={[
                                        { value: 'center', label: 'ศูนย์บริการ' },
                                        { value: 'shop', label: 'อู่ทั่วไป' },
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <label htmlFor="maintenance-garage-name" className="mb-1.5 block text-xs font-medium" style={labelStyle}>ชื่อศูนย์/อู่</label>
                                <input
                                    id="maintenance-garage-name"
                                    value={header.garage_name}
                                    onChange={(e) => updateHeader('garage_name', e.target.value)}
                                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                                    style={headerErrors.garage_name ? errorInputStyle : inputStyle}
                                />
                                {headerErrors.garage_name && <p role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{headerErrors.garage_name}</p>}
                            </div>

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
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <label htmlFor="maintenance-mileage" className="mb-1.5 flex items-center text-xs font-medium" style={labelStyle}>
                                    เลขไมล์ (กม.)
                                    <InfoTooltip text="เลขไมล์ของรถ ณ วันที่เข้าซ่อมครั้งนี้" />
                                </label>
                                <input
                                    id="maintenance-mileage"
                                    type="number"
                                    min="0"
                                    value={header.mileage}
                                    onChange={(e) => updateHeader('mileage', e.target.value)}
                                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                                    style={headerErrors.mileage ? errorInputStyle : inputStyle}
                                />
                                {headerErrors.mileage && <p role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{headerErrors.mileage}</p>}
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

                        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--surface-border)' }}>
                            <table className="w-full min-w-220 text-sm" style={{ color: 'var(--page-text)' }}>
                                <thead>
                                    <tr 
                                        style={{ backgroundColor: 'var(--surface-soft)', borderBottom: '1px solid var(--surface-border)', color: 'var(--sub-text)' }}
                                    >
                                        <th className="min-w-36 px-2 py-2 text-left font-medium">ประเภท</th>
                                        <th className="min-w-36 px-2 py-2 text-left font-medium">หมวด</th>
                                        <th className="min-w-40 px-2 py-2 text-left font-medium">รายการ</th>
                                        <th className="min-w-20 px-2 py-2 text-left font-medium">จำนวน</th>
                                        <th className="min-w-24 px-2 py-2 text-left font-medium">ราคา/หน่วย</th>
                                        <th className="min-w-32 px-2 py-2 text-left font-medium">หมายเหตุ</th>
                                        <th className="min-w-24 px-2 py-2 text-right font-medium">รวม</th>
                                        <th className="w-9 px-2 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((it, idx) => {
                                        const errs = itemErrors[it.tempId] ?? {};
                                        return (
                                            <tr key={it.tempId} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                                                <td className="px-2 py-2 align-top">
                                                    <Select
                                                        id={`item-type-${it.tempId}`}
                                                        ariaLabel={`ประเภท รายการที่ ${idx + 1}`}
                                                        placeholder="ประเภท"
                                                        value={it.service_type_id}
                                                        onChange={(value) => updateItem(it.tempId, 'service_type_id', value)}
                                                        onCreate={(name) => handleCreateType(it.tempId, name)}
                                                        error={Boolean(errs.service_type_id)}
                                                        options={catalog.map((t) => ({ value: String(t.service_type_id), label: t.service_type_name }))}
                                                    />
                                                    {errs.service_type_id && <p role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{errs.service_type_id}</p>}
                                                </td>

                                                <td className="px-2 py-2 align-top">
                                                    <Select
                                                        id={`item-category-${it.tempId}`}
                                                        ariaLabel={`หมวด รายการที่ ${idx + 1}`}
                                                        placeholder={it.service_type_id ? 'หมวด' : 'เลือกประเภทก่อน'}
                                                        disabled={!it.service_type_id}
                                                        value={it.service_category_id}
                                                        onChange={(value) => updateItem(it.tempId, 'service_category_id', value)}
                                                        onCreate={it.service_type_id ? (name) => handleCreateCategory(it.tempId, it.service_type_id, name) : undefined}
                                                        error={Boolean(errs.service_category_id)}
                                                        options={categoriesFor(it.service_type_id).map((c) => ({ value: String(c.service_category_id), label: c.service_category_name }))}
                                                    />
                                                    {errs.service_category_id && <p role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{errs.service_category_id}</p>}
                                                </td>

                                                <td className="px-2 py-2 align-top">
                                                    <Select
                                                        id={`item-item-${it.tempId}`}
                                                        ariaLabel={`รายการ รายการที่ ${idx + 1}`}
                                                        placeholder={it.service_category_id ? 'รายการ' : 'เลือกหมวดก่อน'}
                                                        disabled={!it.service_category_id}
                                                        value={it.service_item_id}
                                                        onChange={(value) => updateItem(it.tempId, 'service_item_id', value)}
                                                        onCreate={it.service_category_id ? (name) => handleCreateItem(it.tempId, it.service_category_id, name) : undefined}
                                                        error={Boolean(errs.service_item_id)}
                                                        options={itemsFor(it.service_type_id, it.service_category_id).map((i) => ({ value: String(i.service_item_id), label: i.service_item_name }))}
                                                    />
                                                    {errs.service_item_id && <p role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{errs.service_item_id}</p>}
                                                </td>

                                                <td className="px-2 py-2 align-top">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="1.0"
                                                        aria-label={`จำนวน รายการที่ ${idx + 1}`}
                                                        value={it.quantity}
                                                        onChange={(e) => updateItem(it.tempId, 'quantity', e.target.value)}
                                                        className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft)"
                                                        style={errs.quantity ? errorInputStyle : inputStyle}
                                                    />
                                                    {errs.quantity && <p role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{errs.quantity}</p>}
                                                </td>

                                                <td className="px-2 py-2 align-top">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="1.0"
                                                        aria-label={`ราคาต่อหน่วย รายการที่ ${idx + 1}`}
                                                        value={it.unit_price}
                                                        onChange={(e) => updateItem(it.tempId, 'unit_price', e.target.value)}
                                                        className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft)"
                                                        style={errs.unit_price ? errorInputStyle : inputStyle}
                                                    />
                                                    {errs.unit_price && <p role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{errs.unit_price}</p>}
                                                </td>

                                                <td className="px-2 py-2 align-top">
                                                    <input
                                                        placeholder="ไม่บังคับ"
                                                        aria-label={`หมายเหตุ รายการที่ ${idx + 1}`}
                                                        value={it.remark}
                                                        onChange={(e) => updateItem(it.tempId, 'remark', e.target.value)}
                                                        className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft)"
                                                        style={inputStyle}
                                                    />
                                                </td>

                                                <td className="px-2 py-2 text-right align-top" style={{ color: 'var(--page-text)' }}>
                                                    ฿{lineTotal(it).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>

                                                <td className="px-2 py-2 align-top text-center">
                                                    {items.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItemRow(it.tempId)}
                                                            aria-label={`ลบรายการที่ ${idx + 1}`}
                                                            className="cursor-pointer rounded-lg p-1.5 transition-colors hover:opacity-80"
                                                            style={{ color: 'var(--status-danger)' }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={6} className="px-2 py-2.5 text-right text-sm" style={{ color: 'var(--sub-text)' }}>ยอดรวมทั้งหมด</td>
                                        <td className="px-2 py-2.5 text-right font-semibold" style={{ color: 'var(--page-text)' }}>
                                            ฿{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
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
