import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
const POPOVER_WIDTH = 288; // w-72
const POPOVER_HEIGHT = 320; // ประมาณความสูงของ header + grid + footer
const VIEWPORT_MARGIN = 8;

// value/onChange ใช้ฟอร์แมต yyyy-mm-dd เดียวกับ <input type="date"> เพื่อสลับใช้แทนกันได้ทันที
function parseValue(value) {
    if (!value) return null;
    const [y, m, d] = value.split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
}

function toValue(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function isSameDay(a, b) {
    return Boolean(a) && Boolean(b) && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// ปฏิทินทำเอง (ไม่ใช่ <input type="date"> ของ browser) เพื่อคุมสไตล์ให้ตรงกับดีไซน์ระบบ
// panel render ผ่าน portal ไปที่ document.body และคำนวณตำแหน่งจาก viewport เอง (แบบเดียวกับ InfoTooltip)
// เพื่อไม่ให้โดน parent ที่มี overflow (เช่น Modal ที่ scroll ได้) บังหรือตัดขอบ
export default function DatePicker({ id, value, onChange, placeholder = 'วว/ดด/ปปปป', error, disabled, min, max }) {
    const selected = parseValue(value);
    const today = new Date();
    const minDate = parseValue(min);
    const maxDate = parseValue(max);

    const [open, setOpen] = useState(false);
    const [viewDate, setViewDate] = useState(selected ?? today);
    const [coords, setCoords] = useState(null);
    const rootRef = useRef(null);
    const popoverRef = useRef(null);

    function openPicker() {
        setViewDate(selected ?? today);
        setOpen(true);
    }

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
        const left = Math.min(rect.left, window.innerWidth - POPOVER_WIDTH - VIEWPORT_MARGIN);

        setCoords({
            left: Math.max(left, VIEWPORT_MARGIN),
            top: openUpward ? undefined : rect.bottom + 6,
            bottom: openUpward ? window.innerHeight - rect.top + 6 : undefined,
        });
    }, [open]);

    function handlePopoverKeyDown(e) {
        if (e.key === 'Escape') {
            // stopPropagation กัน Escape ทะลุไปปิด Modal ที่ครอบอยู่ด้วย ให้ปิดแค่ปฏิทินนี้
            e.stopPropagation();
            setOpen(false);
            rootRef.current?.querySelector('button')?.focus();
        }
    }

    // callback ref แทน useEffect: popover เพิ่ง mount จริงในรอบ render ถัดไป (หลัง setCoords)
    // ต้อง focus ให้ติดตั้งแต่ mount ไม่งั้น Escape จะไปเข้า listener ของ Modal แทน
    function setPopoverRef(el) {
        popoverRef.current = el;
        el?.focus();
    }

    function isDisabled(d) {
        if (minDate && d < minDate) return true;
        if (maxDate && d > maxDate) return true;
        return false;
    }

    function selectDay(d) {
        if (isDisabled(d)) return;
        onChange(toValue(d));
        setOpen(false);
    }

    const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const gridStart = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth(), 1 - firstOfMonth.getDay());
    const cells = Array.from({ length: 42 }, (_, i) => new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));

    const label = selected
        ? selected.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
        : placeholder;

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                id={id}
                disabled={disabled}
                aria-haspopup="dialog"
                aria-expanded={open}
                onClick={() => (open ? setOpen(false) : openPicker())}
                className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-sm outline-none transition-all focus:ring-3 focus:ring-(--primary-color-soft) disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                    backgroundColor: 'var(--surface-soft)',
                    color: selected ? 'var(--page-text)' : 'var(--sub-text)',
                    borderColor: error ? 'var(--status-danger)' : 'var(--surface-border)',
                }}
            >
                <span className="truncate">{label}</span>
                <Calendar size={16} className="shrink-0" style={{ color: 'var(--icon-muted)' }} />
            </button>

            {open && coords && createPortal(
                <div
                    ref={setPopoverRef}
                    role="dialog"
                    aria-label="เลือกวันที่"
                    tabIndex={-1}
                    onKeyDown={handlePopoverKeyDown}
                    className="fixed z-999 rounded-xl border p-3 shadow-lg outline-none"
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
                    <div className="mb-2 flex items-center justify-between">
                        <button
                            type="button"
                            aria-label="เดือนก่อนหน้า"
                            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                            className="cursor-pointer rounded-lg p-1.5 transition-colors hover:opacity-80"
                            style={{ color: 'var(--icon-muted)' }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <p className="text-sm font-medium" style={{ color: 'var(--page-text)' }}>
                            {viewDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                        </p>
                        <button
                            type="button"
                            aria-label="เดือนถัดไป"
                            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                            className="cursor-pointer rounded-lg p-1.5 transition-colors hover:opacity-80"
                            style={{ color: 'var(--icon-muted)' }}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-xs" style={{ color: 'var(--sub-text)' }}>
                        {WEEKDAYS.map((w) => <div key={w} className="py-1">{w}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {cells.map((d) => {
                            const outside = d.getMonth() !== viewDate.getMonth();
                            const isSelected = isSameDay(d, selected);
                            const isToday = isSameDay(d, today);
                            const disabledDay = isDisabled(d);
                            return (
                                <button
                                    type="button"
                                    key={toValue(d)}
                                    disabled={disabledDay}
                                    onClick={() => selectDay(d)}
                                    className="cursor-pointer rounded-lg py-1.5 text-xs transition-colors disabled:cursor-not-allowed"
                                    style={{
                                        backgroundColor: isSelected ? 'var(--primary-color)' : 'transparent',
                                        color: isSelected ? 'var(--on-primary)' : 'var(--page-text)',
                                        opacity: disabledDay ? 0.3 : outside ? 0.45 : 1,
                                        border: isToday && !isSelected ? '1px solid var(--primary-color)' : '1px solid transparent',
                                    }}
                                >
                                    {d.getDate()}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-2 flex justify-end border-t pt-2" style={{ borderColor: 'var(--surface-border)' }}>
                        <button
                            type="button"
                            onClick={() => selectDay(today)}
                            disabled={isDisabled(today)}
                            className="cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                            style={{ color: 'var(--primary-color)' }}
                        >
                            วันนี้
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
