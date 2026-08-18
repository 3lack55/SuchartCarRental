import { useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const TOOLTIP_WIDTH = 220;
const VIEWPORT_MARGIN = 8;

// ไอคอนคำอธิบายเล็กๆ ข้างป้ายกำกับ โฮเวอร์/โฟกัสแล้วโชว์คำอธิบายสั้นๆ
// render ผ่าน portal ไปที่ document.body และคำนวณตำแหน่งจาก viewport เอง
// เพื่อไม่ให้โดน parent ที่มี overflow/rounded-corner หรือ stacking context อื่น (เช่น sidebar) บังหรือตัดขอบ
// ปกติแสดงเป็นวงกลม "?" แต่ส่ง children เข้ามาแทนได้ (เช่นไอคอนเตือน) เพื่อใช้ทริกเกอร์อื่นแทน
export default function InfoTooltip({ text, children, label = 'ข้อมูลเพิ่มเติม' }) {
    const tooltipId = useId();
    const triggerRef = useRef(null);
    const [visible, setVisible] = useState(false);
    const [coords, setCoords] = useState(null);

    function show() {
        const rect = triggerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const centerX = rect.left + rect.width / 2;
        const left = Math.min(
            Math.max(centerX, TOOLTIP_WIDTH / 2 + VIEWPORT_MARGIN),
            window.innerWidth - TOOLTIP_WIDTH / 2 - VIEWPORT_MARGIN
        );

        setCoords({ top: rect.top - VIEWPORT_MARGIN, left });
        setVisible(true);
    }

    function hide() {
        setVisible(false);
    }

    return (
        <span className="relative inline-flex items-center align-middle">
            <span
                ref={triggerRef}
                tabIndex={0}
                aria-label={label}
                aria-describedby={visible ? tooltipId : undefined}
                onMouseEnter={show}
                onMouseLeave={hide}
                onFocus={show}
                onBlur={hide}
                className={
                    children
                        ? 'inline-flex cursor-help items-center justify-center rounded-full outline-none focus:ring-3 focus:ring-(--primary-color-soft)'
                        : 'ml-1 inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full text-[10px] font-semibold leading-none outline-none focus:ring-3 focus:ring-(--primary-color-soft)'
                }
                style={children ? undefined : { backgroundColor: 'var(--surface-soft)', color: 'var(--sub-text)', border: '1px solid var(--surface-border)' }}
            >
                {children ?? '?'}
            </span>
            {visible && coords && createPortal(
                <span
                    id={tooltipId}
                    role="tooltip"
                    className="pointer-events-none fixed z-999 w-max max-w-55 -translate-x-1/2 -translate-y-full rounded-lg px-2.5 py-1.5 text-xs font-normal normal-case tracking-normal shadow-lg"
                    style={{ top: coords.top, left: coords.left, backgroundColor: 'var(--page-text)', color: 'var(--surface)' }}
                >
                    {text}
                </span>,
                document.body
            )}
        </span>
    );
}
