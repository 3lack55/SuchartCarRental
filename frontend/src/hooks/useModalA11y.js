import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

// รวม a11y พื้นฐานของ dialog/modal ไว้ที่เดียว: Escape ปิด, Tab วนโฟกัสอยู่ภายใน (focus trap),
// เปิดแล้วย้ายโฟกัสเข้าไปข้างใน, ปิดแล้วคืนโฟกัสกลับไปที่ element ที่เปิด modal นี้ไว้
export function useModalA11y(onClose) {
    const panelRef = useRef(null);
    const previouslyFocused = useRef(null);

    useEffect(() => {
        function handleKey(e) {
            if (e.key === 'Escape') {
                onClose();
                return;
            }
            if (e.key !== 'Tab' || !panelRef.current) return;

            const focusable = panelRef.current.querySelectorAll(FOCUSABLE_SELECTOR);
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    useEffect(() => {
        previouslyFocused.current = document.activeElement;
        const focusable = panelRef.current?.querySelectorAll(FOCUSABLE_SELECTOR);
        (focusable?.[0] ?? panelRef.current)?.focus();

        return () => {
            previouslyFocused.current?.focus?.();
        };
    }, []);

    return panelRef;
}
