import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Plus, Search } from 'lucide-react';

const LIST_MAX_HEIGHT = 224; // ตรงกับ max-h-56
const SEARCH_BAR_HEIGHT = 44;
const VIEWPORT_MARGIN = 8;

// dropdown ทำเอง (ไม่ใช่ <select> ของ browser) เพื่อคุมสไตล์ให้ตรงกับดีไซน์ระบบ และพิมพ์ filter ตัวเลือกได้
// options รับได้ทั้ง array ของ string หรือ array ของ { value, label }
// panel render ผ่าน portal ไปที่ document.body และคำนวณตำแหน่งจาก viewport เอง (แบบเดียวกับ InfoTooltip)
// เพื่อไม่ให้โดน parent ที่มี overflow (เช่น Modal ที่ scroll ได้) บังหรือตัดขอบ
// onCreate (ไม่บังคับ): ถ้าใส่มา และค้นหาแล้วไม่เจอตัวเลือกที่ตรงเป๊ะ จะโชว์แถว "+ เพิ่ม ..." ให้กดสร้างตัวเลือกใหม่ได้ทันที
// (ใช้กับ dropdown ที่มาจากรายการเปิด เช่น แคตตาล็อกซ่อมบำรุง ไม่ใช่ dropdown ทั่วไป)
export default function Select({ id, value, onChange, options, placeholder = 'เลือก', error, disabled, className = '', ariaLabel, onCreate }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [highlight, setHighlight] = useState(-1);
    const [coords, setCoords] = useState(null);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState(null);
    const rootRef = useRef(null);
    const popoverRef = useRef(null);
    const listboxId = useId();

    const normalized = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
    const selected = normalized.find((o) => o.value === value);
    const trimmedSearch = search.trim();
    const filtered = trimmedSearch
        ? normalized.filter((o) => o.label.toLowerCase().includes(trimmedSearch.toLowerCase()))
        : normalized;
    const showCreate = Boolean(onCreate) && trimmedSearch.length > 0
        && !normalized.some((o) => o.label.trim().toLowerCase() === trimmedSearch.toLowerCase());
    const optionCount = filtered.length + (showCreate ? 1 : 0);

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

        const popoverHeight = LIST_MAX_HEIGHT + SEARCH_BAR_HEIGHT;
        const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_MARGIN;
        const spaceAbove = rect.top - VIEWPORT_MARGIN;
        const openUpward = spaceBelow < popoverHeight && spaceAbove > spaceBelow;
        const available = openUpward ? spaceAbove : spaceBelow;

        setCoords({
            left: rect.left,
            width: rect.width,
            top: openUpward ? undefined : rect.bottom + 6,
            bottom: openUpward ? window.innerHeight - rect.top + 6 : undefined,
            listMaxHeight: Math.max(0, Math.min(LIST_MAX_HEIGHT, available - SEARCH_BAR_HEIGHT)),
        });
    }, [open]);

    // callback ref แทน useEffect เพราะ popover เพิ่ง mount จริงในรอบ render ถัดไป (หลัง setCoords)
    // ถ้า focus() ใน useLayoutEffect ข้างบน element ยังไม่ถูกสร้าง จะ focus ไม่ติด
    function setSearchInputRef(el) {
        el?.focus();
    }

    function openDropdown() {
        setSearch('');
        setCreateError(null);
        const idx = normalized.findIndex((o) => o.value === value);
        setHighlight(idx >= 0 ? idx : 0);
        setOpen(true);
    }

    function selectOption(o) {
        onChange(o.value);
        setOpen(false);
    }

    function handleTriggerKeyDown(e) {
        if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
            e.preventDefault();
            openDropdown();
        }
    }

    function handleSearchChange(text) {
        setSearch(text);
        setHighlight(0);
        setCreateError(null);
    }

    async function handleCreate() {
        if (!onCreate || creating) return;
        setCreating(true);
        setCreateError(null);
        try {
            await onCreate(trimmedSearch);
            setOpen(false);
        } catch (err) {
            setCreateError(err.message || 'เพิ่มไม่สำเร็จ');
        } finally {
            setCreating(false);
        }
    }

    function handleSearchKeyDown(e) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, optionCount - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlight < filtered.length) {
                if (filtered[highlight]) selectOption(filtered[highlight]);
            } else if (showCreate) {
                handleCreate();
            }
        } else if (e.key === 'Home') {
            e.preventDefault();
            setHighlight(0);
        } else if (e.key === 'End') {
            e.preventDefault();
            setHighlight(optionCount - 1);
        } else if (e.key === 'Tab') {
            setOpen(false);
        } else if (e.key === 'Escape') {
            // stopPropagation กัน Escape ทะลุไปปิด Modal ที่ครอบอยู่ด้วย ให้ปิดแค่ dropdown นี้
            e.stopPropagation();
            setOpen(false);
            rootRef.current?.querySelector('button')?.focus();
        }
    }

    return (
        <div ref={rootRef} className={`relative ${className}`}>
            <button
                type="button"
                id={id}
                disabled={disabled}
                aria-label={ariaLabel}
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => (open ? setOpen(false) : openDropdown())}
                onKeyDown={handleTriggerKeyDown}
                className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-sm outline-none transition-all focus:ring-3 focus:ring-(--primary-color-soft) disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                    backgroundColor: 'var(--surface-soft)',
                    color: selected ? 'var(--page-text)' : 'var(--sub-text)',
                    borderColor: error ? 'var(--status-danger)' : 'var(--surface-border)',
                }}
            >
                <span className="truncate">{selected ? selected.label : placeholder}</span>
                <ChevronDown
                    size={16}
                    className="shrink-0 transition-transform"
                    style={{ transform: open ? 'rotate(180deg)' : undefined, color: 'var(--icon-muted)' }}
                />
            </button>

            {open && coords && createPortal(
                <div
                    ref={popoverRef}
                    className="fixed z-999 flex flex-col overflow-hidden rounded-xl border shadow-lg outline-none"
                    style={{
                        left: coords.left,
                        width: coords.width,
                        top: coords.top,
                        bottom: coords.bottom,
                        backgroundColor: 'var(--surface)',
                        borderColor: 'var(--surface-border)',
                        boxShadow: '0 12px 32px rgba(15, 23, 42, 0.18)',
                    }}
                >
                    <div className="relative shrink-0 border-b p-1.5" style={{ borderColor: 'var(--surface-border)' }}>
                        <Search size={14} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2" style={{ color: 'var(--icon-muted)' }} />
                        <input
                            ref={setSearchInputRef}
                            type="text"
                            role="combobox"
                            aria-expanded="true"
                            aria-controls={listboxId}
                            aria-activedescendant={highlight >= 0 && (filtered[highlight] || (showCreate && highlight === filtered.length)) ? `${listboxId}-${highlight}` : undefined}
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            placeholder="ค้นหา..."
                            className="w-full rounded-lg py-1.5 pr-2 pl-7 text-sm outline-none"
                            style={{ backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)' }}
                        />
                    </div>
                    <ul
                        role="listbox"
                        id={listboxId}
                        className="overflow-y-auto p-1"
                        style={{ maxHeight: coords.listMaxHeight }}
                    >
                        {filtered.length === 0 && !showCreate && (
                            <li className="px-3 py-2 text-sm" style={{ color: 'var(--sub-text)' }}>ไม่พบตัวเลือก</li>
                        )}
                        {filtered.map((o, i) => (
                            <li
                                key={o.value}
                                id={`${listboxId}-${i}`}
                                role="option"
                                aria-selected={o.value === value}
                                onMouseEnter={() => setHighlight(i)}
                                onClick={() => selectOption(o)}
                                className="cursor-pointer rounded-lg px-3 py-2 text-sm transition-colors"
                                style={{
                                    backgroundColor: i === highlight ? 'var(--primary-color-soft)' : 'transparent',
                                    color: i === highlight ? 'var(--on-primary)' : 'var(--page-text)',
                                    fontWeight: o.value === value ? 600 : 400,
                                }}
                            >
                                {o.label}
                            </li>
                        ))}
                        {showCreate && (
                            <li
                                id={`${listboxId}-${filtered.length}`}
                                role="option"
                                aria-selected={false}
                                onMouseEnter={() => setHighlight(filtered.length)}
                                onClick={handleCreate}
                                className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                                style={{
                                    backgroundColor: highlight === filtered.length ? 'var(--primary-color-soft)' : 'transparent',
                                    color: highlight === filtered.length ? 'var(--on-primary)' : 'var(--primary-color)',
                                }}
                            >
                                <Plus size={14} className="shrink-0" />
                                <span className="truncate">{creating ? 'กำลังเพิ่ม...' : `เพิ่ม "${trimmedSearch}"`}</span>
                            </li>
                        )}
                    </ul>
                    {createError && (
                        <p className="border-t px-3 py-1.5 text-xs" style={{ borderColor: 'var(--surface-border)', color: 'var(--status-danger)' }}>{createError}</p>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
}
