import { useId } from 'react';
import { useModalA11y } from '../../hooks/useModalA11y.js';

export default function Modal({ title, onClose, children, maxWidth = 'max-w-xl', maxHeight = 'max-h-[85vh]' }) {
  const titleId = useId();
  const panelRef = useModalA11y(onClose);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`w-full ${maxWidth} ${maxHeight} overflow-y-auto rounded-2xl shadow-xl border outline-none`}
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)', boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18)' }}
      >
        <div className="flex items-center justify-between border-b p-5" style={{ borderColor: 'var(--surface-border)' }}>
          <p id={titleId} className="font-semibold" style={{ color: 'var(--page-text)' }}>{title}</p>
          <button
            onClick={onClose}
            aria-label="ปิด"
            className="cursor-pointer rounded-lg p-1.5 transition-colors"
            style={{ color: 'var(--icon-muted)', backgroundColor: 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-soft)'; e.currentTarget.style.color = 'var(--page-text)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--icon-muted)'; }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
