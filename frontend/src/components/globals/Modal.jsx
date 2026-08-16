import { useEffect } from 'react';

export default function Modal({ title, onClose, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`w-full ${maxWidth} max-h-[85vh] overflow-y-auto rounded-2xl shadow-xl border`}
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)', boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18)' }}
      >
        <div className="flex items-center justify-between border-b p-5" style={{ borderColor: 'var(--surface-border)' }}>
          <p className="font-semibold" style={{ color: 'var(--page-text)' }}>{title}</p>
          <button
            onClick={onClose}
            aria-label="ปิด"
            className="rounded-lg p-1.5 transition-colors"
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