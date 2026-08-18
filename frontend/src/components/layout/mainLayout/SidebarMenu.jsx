import { LayoutDashboard, Users, Car, ScrollText, Wrench, Ban, Settings } from 'lucide-react';
import { useTheme } from '../../../context/theme/useTheme';
import { useAuth } from '../../../context/auth/useAuth';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';

const overviewItems = [
    { id: 1, name: 'ภาพรวม', icon: <LayoutDashboard />, path: '/overview' },
]

const inFoItems = [
    { id: 2, name: 'คนขับ', icon: <Users />, path: '/drivers' },
    { id: 3, name: 'รถยนต์', icon: <Car />, path: '/vehicles' },
    { id: 4, name: 'พรบ ภาษี และประกัน', icon: <ScrollText />, path: '/reports' },
    { id: 5, name: 'บันทึกการซ่อมบำรุง', icon: <Wrench />, path: '/maintenance' },
    { id: 6, name: 'บันทึกการฝ่าฝืนกฎจราจร', icon: <Ban />, path: '/violations' },
]

const settingItems = [
    { id: 7, name: 'ตั้งค่าตัวเลือกในระบบ', icon: <Settings />, path: '/settings' },
];

// เส้นแบ่งบางๆ ระหว่างหมวดเมนู ใช้สีเดียวกับตัวหนังสือแต่จางกว่ามาก เพื่อไม่ให้แข่งกับ active state
function SectionDivider() {
    return (
        <div
            aria-hidden="true"
            className="mx-2 my-3 h-px shrink-0"
            style={{ backgroundColor: 'var(--on-primary)', opacity: 0.14 }}
        />
    );
}

// ป้ายชื่อหมวดเมนู ซ่อนตอน sidebar ย่อ (ไอคอนล้วน) เพราะพื้นที่ไม่พอให้อ่านและจะโดนตัดคำน่าเกลียด
function SectionLabel({ isSidebarOpen, children }) {
    if (!isSidebarOpen) return null;
    return (
        <p
            className="truncate whitespace-nowrap px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: 'var(--on-primary)', opacity: 0.5 }}
        >
            {children}
        </p>
    );
}

export default function SidebarMenu({ isSidebarOpen, onNavigate }) {
    const { themeColor } = useTheme();
    const { user } = useAuth();
    const location = useLocation();
    const [hoveredItem, setHoveredItem] = useState(null);
    const [visible, setVisible] = useState(false); // คุม animation แยกจาก mount
    const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
    const itemRefs = useRef({});
    const hideTimer = useRef(null);

    const currentPath = location.pathname === '/' ? '/overview' : location.pathname;
    const activeItem = overviewItems.find((item) => item.path === currentPath)?.id || inFoItems.find((item) => item.path === currentPath)?.id || settingItems.find((item) => item.path === currentPath)?.id || 1;

    const fontColor = 'var(--on-primary)';
    const tooltipBg = 'var(--surface)';
    const tooltipBorder = 'var(--surface-border)';

    const activeBackground = `var(--primary-color-soft)`;
    const activeText = 'var(--on-primary)';

    const handleMouseEnter = (item) => {
        if (isSidebarOpen) return;
        clearTimeout(hideTimer.current);
        const el = itemRefs.current[item.id];
        if (!el) return;
        const rect = el.getBoundingClientRect();
        setTooltipPos({
            top: rect.top + rect.height / 2,
            left: rect.right + 14,
        });
        setHoveredItem(item);
        requestAnimationFrame(() => setVisible(true));
    };

    const handleMouseLeave = () => {
        setVisible(false);
        hideTimer.current = setTimeout(() => setHoveredItem(null), 150);
    };

    useEffect(() => () => clearTimeout(hideTimer.current), []);

    function renderMenuItem(item) {
        return (
            <Link
                key={item.id}
                to={item.path}
                ref={(el) => (itemRefs.current[item.id] = el)}
                aria-current={activeItem === item.id ? 'page' : undefined}
                className="group w-full h-11 flex items-center overflow-hidden no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--primary-color-soft)"
                onClick={() => onNavigate?.()}
                onMouseEnter={() => handleMouseEnter(item)}
                onMouseLeave={handleMouseLeave}
                onFocus={() => handleMouseEnter(item)}
                onBlur={handleMouseLeave}
            >
                <div className={`transition-all duration-75 ${isSidebarOpen ? 'h-full w-1.5' : 'h-0 w-0'} `}>
                    <div className={`transition-all duration-200 w-0 h-full rounded-2xl mr-3 ${activeItem === item.id ? 'w-1.5' : `group-hover:w-1.5`}`} style={{ backgroundColor: activeBackground }}></div>
                </div>

                <div className={`${isSidebarOpen ? 'group-hover:ml-3' : 'ml-0'} flex items-center h-full w-full overflow-hidden px-3 ${activeItem === item.id ? (isSidebarOpen ? 'ml-3' : 'ml-0') : 'ml-0'}`}
                    style={{
                        color: activeItem === item.id ? activeText : fontColor,
                        borderRadius: '0.5rem',
                        backgroundColor: activeItem === item.id ? activeBackground : 'transparent',
                    }}>
                    <div className="flex h-6 w-6 items-center justify-center shrink-0">
                        {item.icon}
                    </div>
                    <div>
                        <span className="ml-3 truncate whitespace-nowrap tracking-wider">{item.name}</span>
                    </div>
                </div>
            </Link>
        );
    }

    const canManage = user?.role === 'admin' || user?.role === 'manager';

    return (
        <nav aria-label="เมนูหลัก" className="w-full h-full flex flex-col p-2">
            <div className="flex flex-col gap-1">
                <SectionLabel isSidebarOpen={isSidebarOpen}>เมนูภาพรวม</SectionLabel>
                {overviewItems.map(renderMenuItem)}
            </div>

            <SectionDivider />

            <div className="flex flex-col gap-1">
                <SectionLabel isSidebarOpen={isSidebarOpen}>เมนูข้อมูล</SectionLabel>
                {inFoItems.map(renderMenuItem)}
            </div>

            {canManage && (
                <>
                    <SectionDivider />

                    <div className="flex flex-col gap-1">
                        <SectionLabel isSidebarOpen={isSidebarOpen}>เมนูตั้งค่า</SectionLabel>
                        {settingItems.map(renderMenuItem)}
                    </div>
                </>
            )}

            {!isSidebarOpen && hoveredItem && createPortal(
                <div
                    className="fixed z-9999 pointer-events-none"
                    style={{
                        top: tooltipPos.top,
                        left: tooltipPos.left,
                        transform: `translateY(-50%) translateX(${visible ? '0' : '-6px'})`,
                        opacity: visible ? 1 : 0,
                        transition: 'opacity 160ms ease, transform 160ms ease',
                    }}
                >
                    <div className="relative flex items-center">
                        {/* ลูกศร */}
                        <div
                            className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rotate-45"
                            style={{
                                backgroundColor: tooltipBg,
                                borderLeft: `1px solid ${tooltipBorder}`,
                                borderBottom: `1px solid ${tooltipBorder}`,
                            }}
                        />
                        {/* กล่อง tooltip */}
                        <div
                            className="relative flex items-center gap-2 whitespace-nowrap rounded-lg pl-3 pr-4 py-2 text-sm font-medium tracking-wide shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
                            style={{
                                backgroundColor: tooltipBg,
                                border: `1px solid ${tooltipBorder}`,
                            }}
                        >
                            <span
                                className="inline-block w-1 h-4 rounded-full shrink-0"
                                style={{ backgroundColor: themeColor }}
                            />
                            {hoveredItem.name}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </nav>
    );
}
