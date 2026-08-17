// ป้ายทะเบียนจำลอง ใช้แสดงเลขทะเบียน+จังหวัดในทุกๆ list ให้อ่านง่ายและดูเป็นทะเบียนจริง
// สีคงที่ (ขาว/ดำ) ไม่ผูกกับธีม เพราะป้ายทะเบียนจริงมีสีของมันเองไม่ว่าจะเป็น light หรือ dark mode
export default function PlateBadge({ plateNumber, plateProvince, className = '' }) {
    return (
        <div
            className={`inline-flex min-w-26 flex-col items-center rounded-lg border px-3 py-1.5 leading-tight ${className}`}
            style={{ backgroundColor: '#fdfbf3', borderColor: '#8a8578' }}
        >
            <span className="text-sm font-bold tracking-wide" style={{ color: '#1a1a1a' }}>{plateNumber}</span>
            <span className="text-[11px]" style={{ color: '#4b4b46' }}>{plateProvince}</span>
        </div>
    );
}
