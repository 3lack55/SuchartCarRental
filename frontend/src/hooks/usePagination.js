import { useMemo, useState } from 'react';

const DEFAULT_PAGE_SIZE = 10;

// แบ่งหน้าอาร์เรย์ที่ผ่านการค้นหา/กรองฝั่ง client มาแล้ว
// รีเซ็ตกลับไปหน้า 1 อัตโนมัติเมื่อจำนวนรายการหลังกรองเปลี่ยน (เช่น พิมพ์ค้นหาใหม่) กันหน้าค้างที่ไม่มีข้อมูล
// ใช้ pattern "adjust state during render" ของ React แทน useEffect เพื่อไม่ให้เกิด render ซ้อนเกินจำเป็น
export function usePagination(items, pageSize = DEFAULT_PAGE_SIZE) {
    const [page, setPage] = useState(1);
    const [prevLength, setPrevLength] = useState(items.length);

    if (items.length !== prevLength) {
        setPrevLength(items.length);
        setPage(1);
    }

    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const safePage = Math.min(page, totalPages);

    const pageItems = useMemo(
        () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
        [items, safePage, pageSize]
    );

    return { page: safePage, setPage, totalPages, pageItems };
}
