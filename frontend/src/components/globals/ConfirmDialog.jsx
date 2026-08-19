import { useId } from 'react';
import { useModalA11y } from '../../hooks/useModalA11y.js';

export default function ConfirmDialog({ title, message, confirmLabel = 'ยืนยัน', loadingLabel = 'กำลังลบ...', onConfirm, onCancel, loading }) {
  const titleId = useId();
  const panelRef = useModalA11y(onCancel);

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="w-full max-w-sm rounded-2xl border p-5 shadow-xl outline-none"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)', boxShadow: '0 20px 40px rgba(15, 23, 42, 0.18)' }}
      >
        <p id={titleId} className="font-semibold" style={{ color: 'var(--page-text)' }}>{title}</p>
        <p className="mt-1.5 text-sm" style={{ color: 'var(--sub-text)' }}>{message}</p>
        <div className="mt-5 flex gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 cursor-pointer rounded-xl border py-2.5 text-sm font-medium transition-all hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: 'var(--surface-soft)', borderColor: 'var(--surface-border)', color: 'var(--page-text)' }}
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 cursor-pointer rounded-xl py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: 'var(--status-danger)', color: '#ffffff' }}
          >
            {loading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}