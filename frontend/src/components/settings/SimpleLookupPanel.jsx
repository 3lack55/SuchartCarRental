import { useState } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import ConfirmDialog from '../globals/ConfirmDialog.jsx';

const inputStyle = {
    backgroundColor: 'var(--surface-soft)',
    color: 'var(--page-text)',
    borderColor: 'var(--surface-border)',
};

// แผงจัดการ lookup ที่มีแค่ id + ชื่อ (ประเภทรถ / สาเหตุการฝ่าฝืนกฎจราจร)
// ใช้ร่วมกันได้เพราะ pattern การเพิ่ม/แก้ไข/ลบเหมือนกันทุกประการ ต่างกันแค่ field name และ endpoint
export default function SimpleLookupPanel({
    items,
    idKey,
    nameKey,
    maxLength,
    addPlaceholder,
    emptyText,
    isLoading,
    error,
    canManage,
    canDelete,
    useCreate,
    useUpdate,
    useDelete,
    deleteConfirmTitle,
    deleteConfirmMessageFor,
}) {
    const [newName, setNewName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [deletingItem, setDeletingItem] = useState(null);
    const [formError, setFormError] = useState('');

    const createMutation = useCreate();
    const updateMutation = useUpdate();
    const deleteMutation = useDelete();

    async function handleAdd(e) {
        e.preventDefault();
        const trimmed = newName.trim();
        if (!trimmed) return;

        setFormError('');
        try {
            await createMutation.mutateAsync(trimmed);
            setNewName('');
        } catch (err) {
            setFormError(err.message);
        }
    }

    function startEdit(item) {
        setFormError('');
        setEditingId(item[idKey]);
        setEditingName(item[nameKey]);
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
            await updateMutation.mutateAsync({ id: item[idKey], name: trimmed });
            setEditingId(null);
        } catch (err) {
            setFormError(err.message);
        }
    }

    async function handleDelete() {
        if (!deletingItem) return;
        setFormError('');
        try {
            await deleteMutation.mutateAsync(deletingItem[idKey]);
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
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        maxLength={maxLength}
                        placeholder={addPlaceholder}
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
                    <p className="p-6 text-center text-sm" style={{ color: 'var(--sub-text)', opacity: 0.75 }}>{emptyText}</p>
                )}

                {!isLoading && items.length > 0 && (
                    <ul>
                        {items.map((item, index) => {
                            const isEditing = editingId === item[idKey];
                            return (
                                <li
                                    key={item[idKey]}
                                    className="flex items-center justify-between gap-3 px-4 py-2.5"
                                    style={{
                                        backgroundColor: 'var(--surface)',
                                        borderTop: index === 0 ? 'none' : '1px solid var(--surface-border)',
                                    }}
                                >
                                    {isEditing ? (
                                        <input
                                            autoFocus
                                            type="text"
                                            value={editingName}
                                            maxLength={maxLength}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Escape') cancelEdit(); }}
                                            className="w-full flex-1 rounded-lg border px-2.5 py-1.5 text-sm outline-none focus:ring-3 focus:ring-(--primary-color-soft) transition-all"
                                            style={inputStyle}
                                        />
                                    ) : (
                                        <span className="text-sm" style={{ color: 'var(--page-text)' }}>{item[nameKey]}</span>
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
                                                        aria-label={`แก้ไข ${item[nameKey]}`}
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
                                                            aria-label={`ลบ ${item[nameKey]}`}
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
                    title={deleteConfirmTitle}
                    message={deleteConfirmMessageFor(deletingItem)}
                    confirmLabel="ลบ"
                    loading={deleteMutation.isPending}
                    onConfirm={handleDelete}
                    onCancel={() => setDeletingItem(null)}
                />
            )}
        </div>
    );
}
