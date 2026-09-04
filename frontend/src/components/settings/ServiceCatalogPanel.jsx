import { useState } from 'react';
import { ChevronRight, Pencil, Trash2, Check, X } from 'lucide-react';
import ConfirmDialog from '../globals/ConfirmDialog.jsx';
import {
    useServiceCatalog,
    useCreateServiceType,
    useUpdateServiceType,
    useDeleteServiceType,
    useCreateServiceCategory,
    useUpdateServiceCategory,
    useDeleteServiceCategory,
    useCreateServiceItem,
    useUpdateServiceItem,
    useDeleteServiceItem,
} from '../../services/lookups/lookupQueries.js';

const inputStyle = {
    backgroundColor: 'var(--surface-soft)',
    color: 'var(--page-text)',
    borderColor: 'var(--surface-border)',
};

const DEFAULT_COLOR = '#64748b';

// color/onColorChange ใส่มาเฉพาะตอนเพิ่ม "ประเภทบริการ" (ชั้นบนสุด) เท่านั้น หมวดหมู่/รายการย่อยไม่มีสี
function AddRow({ placeholder, onAdd, submitting, color, onColorChange }) {
    const [value, setValue] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        const trimmed = value.trim();
        if (!trimmed) return;
        await onAdd(trimmed);
        setValue('');
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
            {onColorChange && (
                <input
                    type="color"
                    aria-label="เลือกสีประเภทบริการใหม่"
                    value={color}
                    onChange={(e) => onColorChange(e.target.value)}
                    className="h-10.5 w-12 shrink-0 cursor-pointer rounded-lg border p-1"
                    style={inputStyle}
                />
            )}
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                maxLength={50}
                placeholder={placeholder}
                className="w-full flex-1 rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                style={inputStyle}
            />
            <button
                type="submit"
                disabled={submitting || !value.trim()}
                className="cursor-pointer whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary-color)', color: 'var(--on-primary)' }}
            >
                {submitting ? 'กำลังเพิ่ม...' : '+ เพิ่ม'}
            </button>
        </form>
    );
}

// เบรดครัมบ์บอกว่าตอนนี้กำลังดูอยู่ชั้นไหน กดย้อนกลับไปชั้นบนได้
function Breadcrumb({ segments }) {
    return (
        <nav aria-label="ตำแหน่งปัจจุบัน" className="flex flex-wrap items-center gap-1.5 text-sm">
            {segments.map((segment, index) => {
                const isLast = index === segments.length - 1;
                return (
                    <span key={index} className="flex items-center gap-1.5">
                        {index > 0 && <ChevronRight size={14} style={{ color: 'var(--icon-muted)' }} />}
                        {isLast || !segment.onClick ? (
                            <span className="font-medium" style={{ color: isLast ? 'var(--page-text)' : 'var(--sub-text)' }}>
                                {segment.label}
                            </span>
                        ) : (
                            <button
                                type="button"
                                onClick={segment.onClick}
                                className="cursor-pointer font-medium underline-offset-2 hover:underline"
                                style={{ color: 'var(--primary-color)' }}
                            >
                                {segment.label}
                            </button>
                        )}
                    </span>
                );
            })}
        </nav>
    );
}

// แผงจัดการแคตตาล็อกบริการซ่อมบำรุงแบบ drill-down: เลือกประเภท -> เห็นหมวดหมู่ -> เลือกหมวดหมู่ -> เห็นรายการบริการ
// แสดงทีละชั้นแบบ list เดียว (ไม่ซ้อน tree หลายชั้นพร้อมกัน) ลดความซับซ้อนของ UI
export default function ServiceCatalogPanel({ canManage, canDelete }) {
    const { data, isLoading, error: queryError } = useServiceCatalog();
    const catalog = data?.data ?? [];

    const [selectedTypeId, setSelectedTypeId] = useState(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [editing, setEditing] = useState(null); // { level: 'type'|'category'|'item', id }
    const [editingName, setEditingName] = useState('');
    const [editingColor, setEditingColor] = useState(DEFAULT_COLOR);
    const [newTypeColor, setNewTypeColor] = useState(DEFAULT_COLOR);
    const [pendingDelete, setPendingDelete] = useState(null); // { level, id, name }
    const [formError, setFormError] = useState('');

    const createType = useCreateServiceType();
    const updateType = useUpdateServiceType();
    const deleteType = useDeleteServiceType();
    const createCategory = useCreateServiceCategory();
    const updateCategory = useUpdateServiceCategory();
    const deleteCategory = useDeleteServiceCategory();
    const createItem = useCreateServiceItem();
    const updateItem = useUpdateServiceItem();
    const deleteItem = useDeleteServiceItem();

    const selectedType = catalog.find((t) => t.service_type_id === selectedTypeId) ?? null;
    const selectedCategory = selectedType?.categories.find((c) => c.service_category_id === selectedCategoryId) ?? null;

    // หมายเหตุ: ถ้ารายการที่เลือกอยู่ถูกลบไปจากที่อื่น (เช่น เปิดหลายแท็บ) selectedType/selectedCategory
    // ที่ derive ไว้ด้านบนจะกลายเป็น null เอง ทำให้ตกไปแสดง list ของชั้นบนอัตโนมัติโดยไม่ต้อง reset state เอง

    function goToTypes() {
        setSelectedTypeId(null);
        setSelectedCategoryId(null);
        setEditing(null);
    }

    function goToCategories() {
        setSelectedCategoryId(null);
        setEditing(null);
    }

    function startEdit(level, id, currentName, currentColor) {
        setFormError('');
        setEditing({ level, id });
        setEditingName(currentName);
        setEditingColor(currentColor || DEFAULT_COLOR);
    }

    function cancelEdit() {
        setEditing(null);
        setEditingName('');
    }

    async function handleSaveEdit() {
        const trimmed = editingName.trim();
        if (!trimmed || !editing) return;

        setFormError('');
        try {
            if (editing.level === 'type') {
                await updateType.mutateAsync({ id: editing.id, name: trimmed, color: editingColor });
            } else if (editing.level === 'category') {
                await updateCategory.mutateAsync({ id: editing.id, name: trimmed, serviceTypeId: selectedTypeId });
            } else {
                await updateItem.mutateAsync({ id: editing.id, name: trimmed, categoryId: selectedCategoryId });
            }
            setEditing(null);
        } catch (err) {
            setFormError(err.message);
        }
    }

    async function handleConfirmDelete() {
        if (!pendingDelete) return;
        const { level, id } = pendingDelete;

        setFormError('');
        try {
            if (level === 'type') await deleteType.mutateAsync(id);
            else if (level === 'category') await deleteCategory.mutateAsync(id);
            else await deleteItem.mutateAsync(id);
        } catch (err) {
            setFormError(err.message);
        } finally {
            setPendingDelete(null);
        }
    }

    async function handleAdd(mutation, ...args) {
        setFormError('');
        try {
            await mutation.mutateAsync(...args);
        } catch (err) {
            setFormError(err.message);
        }
    }

    const deleting = deleteType.isPending || deleteCategory.isPending || deleteItem.isPending;

    // เลือกชุดข้อมูล/ข้อความ/handler ตามชั้นที่กำลังดูอยู่ในตอนนี้
    let level, rows, emptyText, addPlaceholder, onAdd, addSubmitting, breadcrumbSegments;

    if (!selectedType) {
        level = 'type';
        rows = catalog.map((t) => ({ id: t.service_type_id, name: t.service_type_name, hasChildren: true, color: t.color }));
        emptyText = 'ยังไม่มีประเภทบริการในระบบ';
        addPlaceholder = 'เพิ่มประเภทบริการใหม่ (เช่น ซ่อม, เปลี่ยน, ตรวจเช็ค)';
        onAdd = async (name) => {
            setFormError('');
            try {
                await createType.mutateAsync({ name, color: newTypeColor });
                setNewTypeColor(DEFAULT_COLOR);
            } catch (err) {
                setFormError(err.message);
            }
        };
        addSubmitting = createType.isPending;
        breadcrumbSegments = [{ label: 'บริการซ่อมบำรุง' }];
    } else if (!selectedCategory) {
        level = 'category';
        rows = selectedType.categories.map((c) => ({ id: c.service_category_id, name: c.service_category_name, hasChildren: true }));
        emptyText = 'ยังไม่มีหมวดหมู่ในประเภทนี้';
        addPlaceholder = 'เพิ่มหมวดหมู่บริการใหม่';
        onAdd = (name) => handleAdd(createCategory, { name, serviceTypeId: selectedTypeId });
        addSubmitting = createCategory.isPending;
        breadcrumbSegments = [
            { label: 'บริการซ่อมบำรุง', onClick: goToTypes },
            { label: selectedType.service_type_name },
        ];
    } else {
        level = 'item';
        rows = selectedCategory.items.map((i) => ({ id: i.service_item_id, name: i.service_item_name, hasChildren: false }));
        emptyText = 'ยังไม่มีรายการบริการในหมวดหมู่นี้';
        addPlaceholder = 'เพิ่มรายการบริการใหม่';
        onAdd = (name) => handleAdd(createItem, { name, categoryId: selectedCategoryId });
        addSubmitting = createItem.isPending;
        breadcrumbSegments = [
            { label: 'บริการซ่อมบำรุง', onClick: goToTypes },
            { label: selectedType.service_type_name, onClick: goToCategories },
            { label: selectedCategory.service_category_name },
        ];
    }

    function handleRowClick(row) {
        if (!row.hasChildren) return;
        if (level === 'type') setSelectedTypeId(row.id);
        else if (level === 'category') setSelectedCategoryId(row.id);
    }

    return (
        <div className="space-y-4">
            <Breadcrumb segments={breadcrumbSegments} />

            {canManage && (
                <AddRow
                    placeholder={addPlaceholder}
                    onAdd={onAdd}
                    submitting={addSubmitting}
                    color={level === 'type' ? newTypeColor : undefined}
                    onColorChange={level === 'type' ? setNewTypeColor : undefined}
                />
            )}

            {(formError || queryError) && (
                <p role="alert" className="text-sm" style={{ color: 'var(--status-danger)' }}>{formError || queryError?.message}</p>
            )}

            <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--surface-border)' }}>
                {isLoading && (
                    <p className="p-6 text-center text-sm" style={{ color: 'var(--sub-text)', opacity: 0.75 }}>กำลังโหลด...</p>
                )}

                {!isLoading && rows.length === 0 && (
                    <p className="p-6 text-center text-sm" style={{ color: 'var(--sub-text)', opacity: 0.75 }}>{emptyText}</p>
                )}

                {!isLoading && rows.length > 0 && (
                    <ul>
                        {rows.map((row, index) => {
                            const isEditing = editing?.level === level && editing.id === row.id;
                            return (
                                <li
                                    key={row.id}
                                    className="flex items-center justify-between gap-3 px-4 py-2.5"
                                    style={{
                                        backgroundColor: 'var(--surface)',
                                        borderTop: index === 0 ? 'none' : '1px solid var(--surface-border)',
                                    }}
                                >
                                    {isEditing ? (
                                        <div className="flex flex-1 items-center gap-1.5">
                                            {level === 'type' && (
                                                <input
                                                    type="color"
                                                    aria-label={`เลือกสีของ ${row.name}`}
                                                    value={editingColor}
                                                    onChange={(e) => setEditingColor(e.target.value)}
                                                    className="h-9 w-10 shrink-0 cursor-pointer rounded-lg border p-1"
                                                    style={inputStyle}
                                                />
                                            )}
                                            <input
                                                autoFocus
                                                type="text"
                                                value={editingName}
                                                maxLength={level === 'type' ? 50 : 50}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Escape') cancelEdit(); }}
                                                className="w-full flex-1 rounded-lg border px-2.5 py-1.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                                                style={inputStyle}
                                            />
                                            <button type="button" onClick={handleSaveEdit} disabled={!editingName.trim()} aria-label="บันทึก" className="cursor-pointer rounded-lg p-1.5 disabled:opacity-50" style={{ color: 'var(--status-success)' }}>
                                                <Check size={16} />
                                            </button>
                                            <button type="button" onClick={cancelEdit} aria-label="ยกเลิก" className="cursor-pointer rounded-lg p-1.5" style={{ color: 'var(--icon-muted)' }}>
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled={!row.hasChildren}
                                            onClick={() => handleRowClick(row)}
                                            className="flex flex-1 items-center justify-between gap-2 text-left text-sm"
                                            style={{ color: 'var(--page-text)', cursor: row.hasChildren ? 'pointer' : 'default' }}
                                        >
                                            <span className="flex items-center gap-2">
                                                {level === 'type' && (
                                                    <span
                                                        aria-hidden="true"
                                                        className="inline-block h-3 w-3 shrink-0 rounded-full border"
                                                        style={{ backgroundColor: row.color || 'transparent', borderColor: 'var(--surface-border)' }}
                                                    />
                                                )}
                                                {row.name}
                                            </span>
                                            {row.hasChildren && <ChevronRight size={16} style={{ color: 'var(--icon-muted)' }} />}
                                        </button>
                                    )}

                                    {canManage && !isEditing && (
                                        <div className="flex shrink-0 items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => startEdit(level, row.id, row.name, row.color)}
                                                aria-label={`แก้ไข ${row.name}`}
                                                className="cursor-pointer rounded-lg p-1.5 transition-colors"
                                                style={{ color: 'var(--icon-muted)' }}
                                                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary-color)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--icon-muted)'; }}
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            {canDelete && (
                                                <button
                                                    type="button"
                                                    onClick={() => setPendingDelete({ level, id: row.id, name: row.name })}
                                                    aria-label={`ลบ ${row.name}`}
                                                    className="cursor-pointer rounded-lg p-1.5 transition-colors"
                                                    style={{ color: 'var(--icon-muted)' }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--status-danger)'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--icon-muted)'; }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {pendingDelete && (
                <ConfirmDialog
                    title={`ลบ${pendingDelete.level === 'type' ? 'ประเภทบริการ' : pendingDelete.level === 'category' ? 'หมวดหมู่บริการ' : 'รายการบริการ'}`}
                    message={`ยืนยันการลบ "${pendingDelete.name}"? ${pendingDelete.level !== 'item' ? 'ต้องไม่มีข้อมูลย่อยอยู่ภายใน จึงจะลบได้' : 'จะลบไม่ได้ถ้ามีการใช้งานในประวัติการซ่อมบำรุงแล้ว'}`}
                    confirmLabel="ลบ"
                    loading={deleting}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setPendingDelete(null)}
                />
            )}
        </div>
    );
}
