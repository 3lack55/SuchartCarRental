import { AlertTriangle } from 'lucide-react';
import InfoTooltip from './InfoTooltip.jsx';

// ป้ายทะเบียนจำลอง ใช้แสดงเลขทะเบียน+จังหวัดในทุกๆ list ให้อ่านง่ายและดูเป็นทะเบียนจริง
// สีคงที่ (ขาว/ดำ) ไม่ผูกกับธีม เพราะป้ายทะเบียนจริงมีสีของมันเองไม่ว่าจะเป็น light หรือ dark mode
// duplicate: true เมื่อเลขทะเบียนนี้ซ้ำกับรถคันอื่นในรายการเดียวกัน (คนละจังหวัด) — เตือนไม่ให้เข้าใจผิดว่าเป็นข้อมูลซ้ำของคันเดียวกัน
export default function PlateBadge({ plateNumber, plateProvince, duplicate = false, className = '' }) {
    return (
        <span className="inline-flex items-center gap-1.5">
            <div
                className={`inline-flex min-w-26 flex-col items-center rounded-lg border px-3 py-1.5 leading-tight ${className}`}
                style={{ backgroundColor: '#fdfbf3', borderColor: duplicate ? 'var(--status-warning)' : '#8a8578' }}
            >
                <span className="text-sm font-bold tracking-wide" style={{ color: '#1a1a1a' }}>{plateNumber}</span>
                <span className="text-xs font-semibold" style={{ color: '#4b4b46' }}>{plateProvince}</span>
            </div>
            {duplicate && (
                <span className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    <InfoTooltip
                        text="เลขทะเบียนนี้ซ้ำกับรถอีกคันในรายการนี้ แต่คนละจังหวัด — คนละคันกัน โปรดสังเกตจังหวัดให้ดีก่อนใช้ข้อมูล"
                        label="ทะเบียนซ้ำกับรถคันอื่น คนละจังหวัด"
                    >
                        <AlertTriangle size={16} style={{ color: 'var(--status-warning)' }} />
                    </InfoTooltip>
                </span>
            )}
        </span>
    );
}
