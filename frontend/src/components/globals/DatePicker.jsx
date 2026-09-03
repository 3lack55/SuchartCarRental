import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
const POPOVER_WIDTH = 288; // w-72
const POPOVER_HEIGHT = 320; // ประมาณความสูงของ header + grid + footer
const VIEWPORT_MARGIN = 8;
const YEARS_PER_PAGE = 12; // grid ปี 3x4 ต่อหน้า

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

function yearLabel(year) {
    return new Date(year, 0, 1).toLocaleDateString('th-TH', { year: 'numeric' });
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
    // days = กริดวัน, months = กริดเดือนของปีที่กำลังดู, years = กริดปี (เลือกปี/เดือนแบบข้ามได้ทันที ไม่ต้องกดลูกศรทีละเดือน)
    const [pickerView, setPickerView] = useState('days');
    const [yearBlockStart, setYearBlockStart] = useState(null);
    const [coords, setCoords] = useState(null);
    const rootRef = useRef(null);
    const popoverRef = useRef(null);

    const yearBoundsMin = minDate ? minDate.getFullYear() : today.getFullYear() - 100;
    const yearBoundsMax = maxDate ? maxDate.getFullYear() : today.getFullYear() + 10;

    function openPicker() {
        setViewDate(selected ?? today);
        setPickerView('days');
        setOpen(true);
    }

    function enterYearsView() {
        const base = viewDate.getFullYear();
        setYearBlockStart(Math.floor(base / YEARS_PER_PAGE) * YEARS_PER_PAGE);
        setPickerView('years');
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

    function isMonthDisabled(year, month) {
        const first = new Date(year, month, 1);
        const last = new Date(year, month + 1, 0);
        if (maxDate && first > maxDate) return true;
        if (minDate && last < minDate) return true;
        return false;
    }

    function isYearDisabled(year) {
        const first = new Date(year, 0, 1);
        const last = new Date(year, 11, 31);
        if (maxDate && first > maxDate) return true;
        if (minDate && last < minDate) return true;
        return false;
    }

    function selectDay(d) {
        if (isDisabled(d)) return;
        onChange(toValue(d));
        setOpen(false);
    }

    function selectMonth(month) {
        if (isMonthDisabled(viewDate.getFullYear(), month)) return;
        setViewDate(new Date(viewDate.getFullYear(), month, 1));
        setPickerView('days');
    }

    function selectYear(year) {
        if (isYearDisabled(year)) return;
        setViewDate(new Date(year, viewDate.getMonth(), 1));
        setPickerView('months');
    }

    function handlePrev() {
        if (pickerView === 'days') setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
        else if (pickerView === 'months') setViewDate((d) => new Date(d.getFullYear() - 1, d.getMonth(), 1));
        else setYearBlockStart((s) => s - YEARS_PER_PAGE);
    }

    function handleNext() {
        if (pickerView === 'days') setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
        else if (pickerView === 'months') setViewDate((d) => new Date(d.getFullYear() + 1, d.getMonth(), 1));
        else setYearBlockStart((s) => s + YEARS_PER_PAGE);
    }

    const prevDisabled = pickerView === 'years' && yearBlockStart !== null && yearBlockStart <= yearBoundsMin;
    const nextDisabled = pickerView === 'years' && yearBlockStart !== null && yearBlockStart + YEARS_PER_PAGE > yearBoundsMax;

    const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const gridStart = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth(), 1 - firstOfMonth.getDay());
    const cells = Array.from({ length: 42 }, (_, i) => new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));

    const label = selected
        ? selected.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
        : placeholder;

    const headerButtonStyle = {
        color: 'var(--page-text)',
        backgroundColor: 'transparent',
    };

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
                            aria-label={pickerView === 'days' ? 'เดือนก่อนหน้า' : pickerView === 'months' ? 'ปีก่อนหน้า' : 'ช่วงปีก่อนหน้า'}
                            onClick={handlePrev}
                            disabled={prevDisabled}
                            className="cursor-pointer rounded-lg p-1.5 transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
                            style={{ color: 'var(--icon-muted)' }}
                        >
                            <ChevronLeft size={16} />
                        </button>

                        {pickerView === 'days' && (
                            <div className="flex items-center gap-1 text-sm font-medium">
                                <button type="button" onClick={() => setPickerView('months')} className="cursor-pointer rounded-lg px-1.5 py-0.5 transition-colors hover:opacity-70" style={headerButtonStyle}>
                                    {viewDate.toLocaleDateString('th-TH', { month: 'long' })}
                                </button>
                                <button type="button" onClick={enterYearsView} className="cursor-pointer rounded-lg px-1.5 py-0.5 transition-colors hover:opacity-70" style={headerButtonStyle}>
                                    {yearLabel(viewDate.getFullYear())}
                                </button>
                            </div>
                        )}
                        {pickerView === 'months' && (
                            <button type="button" onClick={enterYearsView} className="cursor-pointer rounded-lg px-1.5 py-0.5 text-sm font-medium transition-colors hover:opacity-70" style={headerButtonStyle}>
                                {yearLabel(viewDate.getFullYear())}
                            </button>
                        )}
                        {pickerView === 'years' && yearBlockStart !== null && (
                            <p className="text-sm font-medium" style={{ color: 'var(--page-text)' }}>
                                {yearLabel(yearBlockStart)} – {yearLabel(yearBlockStart + YEARS_PER_PAGE - 1)}
                            </p>
                        )}

                        <button
                            type="button"
                            aria-label={pickerView === 'days' ? 'เดือนถัดไป' : pickerView === 'months' ? 'ปีถัดไป' : 'ช่วงปีถัดไป'}
                            onClick={handleNext}
                            disabled={nextDisabled}
                            className="cursor-pointer rounded-lg p-1.5 transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
                            style={{ color: 'var(--icon-muted)' }}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {pickerView === 'days' && (
                        <>
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
                        </>
                    )}

                    {pickerView === 'months' && (
                        <div className="grid grid-cols-3 gap-1.5 py-1">
                            {Array.from({ length: 12 }, (_, i) => i).map((month) => {
                                const monthDisabled = isMonthDisabled(viewDate.getFullYear(), month);
                                const isSelectedMonth = Boolean(selected) && selected.getFullYear() === viewDate.getFullYear() && selected.getMonth() === month;
                                const isCurrentMonth = today.getFullYear() === viewDate.getFullYear() && today.getMonth() === month;
                                return (
                                    <button
                                        type="button"
                                        key={month}
                                        disabled={monthDisabled}
                                        onClick={() => selectMonth(month)}
                                        className="cursor-pointer rounded-lg py-2 text-xs transition-colors disabled:cursor-not-allowed"
                                        style={{
                                            backgroundColor: isSelectedMonth ? 'var(--primary-color)' : 'transparent',
                                            color: isSelectedMonth ? 'var(--on-primary)' : 'var(--page-text)',
                                            opacity: monthDisabled ? 0.3 : 1,
                                            border: isCurrentMonth && !isSelectedMonth ? '1px solid var(--primary-color)' : '1px solid transparent',
                                        }}
                                    >
                                        {new Date(2000, month, 1).toLocaleDateString('th-TH', { month: 'short' })}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {pickerView === 'years' && yearBlockStart !== null && (
                        <div className="grid grid-cols-3 gap-1.5 py-1">
                            {Array.from({ length: YEARS_PER_PAGE }, (_, i) => yearBlockStart + i).map((year) => {
                                const yearDisabled = isYearDisabled(year);
                                const isSelectedYear = Boolean(selected) && selected.getFullYear() === year;
                                const isCurrentYear = today.getFullYear() === year;
                                return (
                                    <button
                                        type="button"
                                        key={year}
                                        disabled={yearDisabled}
                                        onClick={() => selectYear(year)}
                                        className="cursor-pointer rounded-lg py-2 text-xs transition-colors disabled:cursor-not-allowed"
                                        style={{
                                            backgroundColor: isSelectedYear ? 'var(--primary-color)' : 'transparent',
                                            color: isSelectedYear ? 'var(--on-primary)' : 'var(--page-text)',
                                            opacity: yearDisabled ? 0.3 : 1,
                                            border: isCurrentYear && !isSelectedYear ? '1px solid var(--primary-color)' : '1px solid transparent',
                                        }}
                                    >
                                        {yearLabel(year)}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
}
