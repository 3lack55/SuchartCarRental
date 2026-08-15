import { LayoutDashboard, Users, Car, ScrollText, Wrench, Ban } from 'lucide-react';
import { useTheme } from '../../../context/theme/useTheme';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';

const menuItems = [
    { id: 1, name: 'ภาพรวม', icon: <LayoutDashboard />, path: '/overview' },
    { id: 2, name: 'คนขับ', icon: <Users />, path: '/drivers' },
    { id: 3, name: 'รถยนต์', icon: <Car />, path: '/vehicles' },
    { id: 4, name: 'พรบ ภาษี และประกัน', icon: <ScrollText />, path: '/reports' },
    { id: 5, name: 'บันทึกการซ่อมบำรุง', icon: <Wrench />, path: '/maintenance' },
    { id: 6, name: 'บันทึกการฝ่าฝืนกฎจราจร', icon: <Ban />, path: '/violations' },
];

export default function SidebarMenu({ isSidebarOpen }) {
    const { themeColor } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const [hoveredItem, setHoveredItem] = useState(null);
    const [visible, setVisible] = useState(false); // คุม animation แยกจาก mount
    const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
    const itemRefs = useRef({});
    const hideTimer = useRef(null);

    const currentPath = location.pathname === '/' ? '/overview' : location.pathname;
    const activeItem = menuItems.find((item) => item.path === currentPath)?.id ?? 1;

    const fontColor = 'var(--page-text)';
    const tooltipBg = 'var(--surface)';
    const tooltipBorder = 'var(--surface-border)';

    const activeBackground = `${themeColor}22`;
    const activeText = themeColor;

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

    return (
        <div className={`w-full h-full flex flex-col gap-2`}>
            {menuItems.map((item) => (
                <div
                    key={item.id}
                    ref={(el) => (itemRefs.current[item.id] = el)}
                    className={`group w-full h-12 flex items-center cursor-pointer overflow-hidden`}
                    onClick={() => {
                        navigate(item.path);
                    }}
                    onMouseEnter={() => handleMouseEnter(item)}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className={`transition-all duration-75 ${isSidebarOpen ? 'h-full w-1.5' : 'h-0 w-0'} `}>
                        <div className={`transition-all duration-200 w-0 h-full rounded-2xl mr-3 ${activeItem === item.id ? 'w-1.5' : `group-hover:w-1.5`}`} style={{ backgroundColor: themeColor }}></div>
                    </div>

                    <div className={`${isSidebarOpen ? 'group-hover:ml-3' : 'ml-0'} flex items-center h-full w-full overflow-hidden px-3 ${activeItem === item.id ? (isSidebarOpen ? 'ml-3' : 'ml-0') : 'ml-0'}`}
                        style={{
                            color: activeItem === item.id ? activeText : fontColor,
                            borderRadius: '0.5rem',
                            backgroundColor: activeItem === item.id ? activeBackground : 'transparent',
                        }}>
                        <div className={`flex h-6 w-6 items-center justify-center shrink-0 ${activeItem === item.id ? '' : ''}`} >
                            {item.icon}
                        </div>
                        <div>
                            <span className={`ml-3 truncate whitespace-nowrap tracking-wider`}>{item.name}</span>
                        </div>
                    </div>
                </div>
            ))}

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
        </div>
    );
}