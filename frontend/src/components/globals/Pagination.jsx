import { ChevronLeft, ChevronRight } from 'lucide-react';

// ตัวควบคุมแบ่งหน้าแบบมาตรฐานของระบบ ใช้ร่วมกันทุกหน้าที่มีตาราง/รายการยาว
export default function Pagination({ page, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    return (
        <div className="mt-4 flex items-center justify-between text-sm" style={{ color: 'var(--sub-text)' }}>
            <span>หน้า {page} จาก {totalPages}</span>
            <div className="flex gap-2">
                <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    aria-label="หน้าก่อนหน้า"
                    className="flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ backgroundColor: 'var(--surface-soft)', border: '1px solid var(--surface-border)' }}
                >
                    <ChevronLeft size={14} /> ก่อนหน้า
                </button>
                <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                    aria-label="หน้าถัดไป"
                    className="flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ backgroundColor: 'var(--surface-soft)', border: '1px solid var(--surface-border)' }}
                >
                    ถัดไป <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}
