export default function ConfirmDialog({ title, message, confirmLabel = 'ยืนยัน', onConfirm, onCancel, loading }) {
  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border p-5 shadow-xl"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)', boxShadow: '0 20px 40px rgba(15, 23, 42, 0.18)' }}
      >
        <p className="font-semibold" style={{ color: 'var(--page-text)' }}>{title}</p>
        <p className="mt-1.5 text-sm" style={{ color: 'var(--sub-text)' }}>{message}</p>
        <div className="mt-5 flex gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'var(--surface-soft)', borderColor: 'var(--surface-border)', color: 'var(--page-text)' }}
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-xl py-2.5 text-sm font-medium disabled:opacity-50"
            style={{ backgroundColor: 'var(--status-danger)', color: '#ffffff' }}
          >
            {loading ? 'กำลังลบ...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}