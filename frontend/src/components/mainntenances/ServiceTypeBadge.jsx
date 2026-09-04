// ป้ายชื่อประเภทบริการซ่อมบำรุงแบบมีสี ใช้สีที่ตั้งไว้ในหน้าตั้งค่า (soft background + ตัวอักษรสีเข้ม)
// เหมือนกับ VehicleTypeBadge เป๊ะๆ (soft bg = สี+alpha 26, ตัวอักษร = สีเต็ม) ถ้าไม่มีสีก็ fallback เป็นป้ายสีปกติของธีม
export default function ServiceTypeBadge({ typeName, color, className = '' }) {
    if (!typeName) return <span style={{ color: 'var(--icon-muted)' }}>-</span>;

    const style = color
        ? { backgroundColor: `${color}26`, color }
        : { backgroundColor: 'var(--surface-soft)', color: 'var(--page-text)' };

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium truncate ${className}`}
            style={style}
        >
            {typeName}
        </span>
    );
}
