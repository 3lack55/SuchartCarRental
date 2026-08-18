import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Clock } from 'lucide-react';

const POPOVER_WIDTH = 160;
const POPOVER_HEIGHT = 240;
const VIEWPORT_MARGIN = 8;
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

function parseValue(value) {
    const [hour = '', minute = ''] = (value || '').split(':');
    return { hour, minute };
}

// ตัวเลือกเวลาทำเอง (ไม่ใช่ <input type="time"> ของ browser) เพื่อคุมสไตล์และบังคับฟอร์แมต 24 ชม. เสมอ
// เพราะ input type=time ของ browser จะสลับเป็นแบบ 12 ชม. (AM/PM) อัตโนมัติตาม locale ของเครื่องผู้ใช้
// value/onChange ใช้ฟอร์แมต "HH:mm" (24 ชม.)
export default function TimePicker({ id, value, onChange, error, disabled, className = '' }) {
    const { hour, minute } = parseValue(value);
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState(null);
    const rootRef = useRef(null);
    const popoverRef = useRef(null);
    const hourListRef = useRef(null);
    const minuteListRef = useRef(null);

    useEffect(() => {
        if (!open) return;

        function handleClick(e) {
            if (rootRef.current && !rootRef.current.contains(e.target) && !popoverRef.current?.contains(e.target)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    useLayoutEffect(() => {
        if (!open) return;
        const rect = rootRef.current?.getBoundingClientRect();
        if (!rect) return;

        const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_MARGIN;
        const spaceAbove = rect.top - VIEWPORT_MARGIN;
        const openUpward = spaceBelow < POPOVER_HEIGHT && spaceAbove > spaceBelow;

        setCoords({
            left: rect.left,
            top: openUpward ? undefined : rect.bottom + 6,
            bottom: openUpward ? window.innerHeight - rect.top + 6 : undefined,
        });
    }, [open]);

    // callback ref แทน useEffect เพราะ popover เพิ่ง mount จริงในรอบ render ถัดไป (หลัง setCoords)
    // ต้อง focus ตั้งแต่ mount ไม่งั้น Escape จะไปเข้า listener ของ Modal แทน แล้ว scroll ไปที่ค่าที่เลือกไว้
    function setPopoverRef(el) {
        popoverRef.current = el;
        if (!el) return;
        el.focus();
        hourListRef.current?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: 'center' });
        minuteListRef.current?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: 'center' });
    }

    function handleKeyDown(e) {
        if (e.key === 'Escape') {
            // stopPropagation กัน Escape ทะลุไปปิด Modal ที่ครอบอยู่ด้วย ให้ปิดแค่ตัวเลือกเวลานี้
            e.stopPropagation();
            setOpen(false);
            rootRef.current?.querySelector('button')?.focus();
        }
    }

    function selectHour(h) {
        onChange(`${h}:${minute || '00'}`);
    }

    function selectMinute(m) {
        onChange(`${hour || '00'}:${m}`);
    }

    const label = hour && minute ? `${hour}:${minute}` : '--:--';

    return (
        <div ref={rootRef} className={`relative ${className}`}>
            <button
                type="button"
                id={id}
                disabled={disabled}
                aria-haspopup="dialog"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
                className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-sm outline-none transition-all focus:ring-3 focus:ring-(--primary-color-soft) disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                    backgroundColor: 'var(--surface-soft)',
                    color: hour && minute ? 'var(--page-text)' : 'var(--sub-text)',
                    borderColor: error ? 'var(--status-danger)' : 'var(--surface-border)',
                }}
            >
                <span>{label}</span>
                <Clock size={16} className="shrink-0" style={{ color: 'var(--icon-muted)' }} />
            </button>

            {open && coords && createPortal(
                <div
                    ref={setPopoverRef}
                    role="dialog"
                    aria-label="เลือกเวลา"
                    tabIndex={-1}
                    onKeyDown={handleKeyDown}
                    className="fixed z-999 flex flex-col overflow-hidden rounded-xl border shadow-lg outline-none"
                    style={{
                        left: coords.left,
                        top: coords.top,
                        bottom: coords.bottom,
                        width: POPOVER_WIDTH,
                        backgroundColor: 'var(--surface)',
                        borderColor: 'var(--surface-border)',
                        boxShadow: '0 12px 32px rgba(15, 23, 42, 0.18)',
                    }}
                >
                    <div className="flex" style={{ maxHeight: POPOVER_HEIGHT - 44 }}>
                        <div ref={hourListRef} role="listbox" aria-label="ชั่วโมง" className="flex-1 overflow-y-auto border-r p-1" style={{ borderColor: 'var(--surface-border)' }}>
                            {HOURS.map((h) => (
                                <button
                                    type="button"
                                    key={h}
                                    role="option"
                                    aria-selected={h === hour}
                                    data-selected={h === hour}
                                    onClick={() => selectHour(h)}
                                    className="block w-full cursor-pointer rounded-lg px-2 py-1.5 text-center text-sm transition-colors"
                                    style={{
                                        backgroundColor: h === hour ? 'var(--primary-color)' : 'transparent',
                                        color: h === hour ? 'var(--on-primary)' : 'var(--page-text)',
                                        fontWeight: h === hour ? 600 : 400,
                                    }}
                                >
                                    {h}
                                </button>
                            ))}
                        </div>
                        <div ref={minuteListRef} role="listbox" aria-label="นาที" className="flex-1 overflow-y-auto p-1">
                            {MINUTES.map((m) => (
                                <button
                                    type="button"
                                    key={m}
                                    role="option"
                                    aria-selected={m === minute}
                                    data-selected={m === minute}
                                    onClick={() => selectMinute(m)}
                                    className="block w-full cursor-pointer rounded-lg px-2 py-1.5 text-center text-sm transition-colors"
                                    style={{
                                        backgroundColor: m === minute ? 'var(--primary-color)' : 'transparent',
                                        color: m === minute ? 'var(--on-primary)' : 'var(--page-text)',
                                        fontWeight: m === minute ? 600 : 400,
                                    }}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end border-t p-2" style={{ borderColor: 'var(--surface-border)' }}>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-colors hover:opacity-80"
                            style={{ color: 'var(--primary-color)' }}
                        >
                            ตกลง
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
