import { useState } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import ConfirmDialog from '../globals/ConfirmDialog.jsx';
import { useCreateVehicleType, useUpdateVehicleType, useDeleteVehicleType } from '../../services/lookups/lookupQueries.js';

const inputStyle = {
    backgroundColor: 'var(--surface-soft)',
    color: 'var(--page-text)',
    borderColor: 'var(--surface-border)',
};

const DEFAULT_COLOR = '#64748b';

// แผงจัดการประเภทรถโดยเฉพาะ (แยกจาก SimpleLookupPanel เพราะมีฟิลด์สีเพิ่ม ซึ่งสาเหตุการฝ่าฝืนกฎจราจรไม่มี)
// สีตั้งได้ผ่าน <input type="color"> ซึ่งเบราว์เซอร์แสดงเป็น color wheel/spectrum picker ให้เอง ไม่ต้องพึ่ง library ภายนอก
export default function VehicleTypePanel({ items, isLoading, error, canManage, canDelete }) {
    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState(DEFAULT_COLOR);
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [editingColor, setEditingColor] = useState(DEFAULT_COLOR);
    const [deletingItem, setDeletingItem] = useState(null);
    const [formError, setFormError] = useState('');

    const createMutation = useCreateVehicleType();
    const updateMutation = useUpdateVehicleType();
    const deleteMutation = useDeleteVehicleType();

    async function handleAdd(e) {
        e.preventDefault();
        const trimmed = newName.trim();
        if (!trimmed) return;

        setFormError('');
        try {
            await createMutation.mutateAsync({ name: trimmed, color: newColor });
            setNewName('');
            setNewColor(DEFAULT_COLOR);
        } catch (err) {
            setFormError(err.message);
        }
    }

    function startEdit(item) {
        setFormError('');
        setEditingId(item.type_id);
        setEditingName(item.type_name);
        setEditingColor(item.color || DEFAULT_COLOR);
    }

    function cancelEdit() {
        setEditingId(null);
        setEditingName('');
    }

    async function handleUpdate(item) {
        const trimmed = editingName.trim();
        if (!trimmed) return;

        setFormError('');
        try {
            await updateMutation.mutateAsync({ id: item.type_id, name: trimmed, color: editingColor });
            setEditingId(null);
        } catch (err) {
            setFormError(err.message);
        }
    }

    async function handleDelete() {
        if (!deletingItem) return;
        setFormError('');
        try {
            await deleteMutation.mutateAsync(deletingItem.type_id);
            setDeletingItem(null);
        } catch (err) {
            setFormError(err.message);
            setDeletingItem(null);
        }
    }

    return (
        <div className="space-y-4">
            {canManage && (
                <form onSubmit={handleAdd} className="flex flex-col gap-2 sm:flex-row">
                    <input
                        type="color"
                        aria-label="เลือกสีประเภทรถใหม่"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        className="h-10.5 w-12 shrink-0 cursor-pointer rounded-lg border p-1"
                        style={inputStyle}
                    />
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        maxLength={30}
                        placeholder="เพิ่มประเภทรถใหม่ (เช่น รถเก๋ง, รถตู้)"
                        className="w-full flex-1 rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                        style={inputStyle}
                    />
                    <button
                        type="submit"
                        disabled={createMutation.isPending || !newName.trim()}
                        className="cursor-pointer whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ backgroundColor: 'var(--primary-color)', color: 'var(--on-primary)' }}
                    >
                        {createMutation.isPending ? 'กำลังเพิ่ม...' : '+ เพิ่ม'}
                    </button>
                </form>
            )}

            {(formError || error) && (
                <p role="alert" className="text-sm" style={{ color: 'var(--status-danger)' }}>{formError || error}</p>
            )}

            <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--surface-border)' }}>
                {isLoading && (
                    <p className="p-6 text-center text-sm" style={{ color: 'var(--sub-text)', opacity: 0.75 }}>กำลังโหลด...</p>
                )}

                {!isLoading && items.length === 0 && (
                    <p className="p-6 text-center text-sm" style={{ color: 'var(--sub-text)', opacity: 0.75 }}>ยังไม่มีประเภทรถในระบบ</p>
                )}

                {!isLoading && items.length > 0 && (
                    <ul>
                        {items.map((item, index) => {
                            const isEditing = editingId === item.type_id;
                            return (
                                <li
                                    key={item.type_id}
                                    className="flex items-center justify-between gap-3 px-4 py-2.5"
                                    style={{
                                        backgroundColor: 'var(--surface)',
                                        borderTop: index === 0 ? 'none' : '1px solid var(--surface-border)',
                                    }}
                                >
                                    {isEditing ? (
                                        <div className="flex w-full flex-1 items-center gap-2">
                                            <input
                                                type="color"
                                                aria-label={`เลือกสีของ ${item.type_name}`}
                                                value={editingColor}
                                                onChange={(e) => setEditingColor(e.target.value)}
                                                className="h-9 w-10 shrink-0 cursor-pointer rounded-lg border p-1"
                                                style={inputStyle}
                                            />
                                            <input
                                                autoFocus
                                                type="text"
                                                value={editingName}
                                                maxLength={30}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Escape') cancelEdit(); }}
                                                className="w-full flex-1 rounded-lg border px-2.5 py-1.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                                                style={inputStyle}
                                            />
                                        </div>
                                    ) : (
                                        <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--page-text)' }}>
                                            <span
                                                aria-hidden="true"
                                                className="inline-block h-3 w-3 shrink-0 rounded-full border"
                                                style={{ backgroundColor: item.color || 'transparent', borderColor: 'var(--surface-border)' }}
                                            />
                                            {item.type_name}
                                        </span>
                                    )}

                                    {canManage && (
                                        <div className="flex shrink-0 items-center gap-1">
                                            {isEditing ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdate(item)}
                                                        disabled={updateMutation.isPending || !editingName.trim()}
                                                        aria-label="บันทึก"
                                                        className="cursor-pointer rounded-lg p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                                        style={{ color: 'var(--status-success)' }}
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={cancelEdit}
                                                        aria-label="ยกเลิก"
                                                        className="cursor-pointer rounded-lg p-1.5 transition-colors"
                                                        style={{ color: 'var(--icon-muted)' }}
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => startEdit(item)}
                                                        aria-label={`แก้ไข ${item.type_name}`}
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
                                                            onClick={() => setDeletingItem(item)}
                                                            aria-label={`ลบ ${item.type_name}`}
                                                            className="cursor-pointer rounded-lg p-1.5 transition-colors"
                                                            style={{ color: 'var(--icon-muted)' }}
                                                            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--status-danger)'; }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--icon-muted)'; }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {deletingItem && (
                <ConfirmDialog
                    title="ลบประเภทรถ"
                    message={`ยืนยันการลบ "${deletingItem.type_name}"? รถที่ใช้ประเภทนี้อยู่จะไม่ถูกลบ แต่จะไม่มีประเภทรถกำกับอีก`}
                    confirmLabel="ลบ"
                    loading={deleteMutation.isPending}
                    onConfirm={handleDelete}
                    onCancel={() => setDeletingItem(null)}
                />
            )}
        </div>
    );
}
