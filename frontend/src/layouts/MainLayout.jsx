import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/mainLayout/Sidebar';
import Topbar from '../components/layout/mainLayout/Topbar';
import { useState } from 'react';

export default function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true); // เปิด/ปิดแบบย่อ-ขยาย (จอ md ขึ้นไป)
    const [mobileNavOpen, setMobileNavOpen] = useState(false); // เปิด/ปิดแบบ overlay (จอมือถือ)

    return (
        <div className="flex w-full h-full overflow-hidden">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-lg focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:no-underline"
                style={{ backgroundColor: 'var(--primary-color)', color: 'var(--on-primary)' }}
            >
                ข้ามไปยังเนื้อหาหลัก
            </a>

            {mobileNavOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/45 md:hidden"
                    onClick={() => setMobileNavOpen(false)}
                    aria-hidden="true"
                />
            )}

            <div
                className={`fixed inset-y-0 left-0 z-50 h-full w-70 overflow-hidden transition-transform duration-300 md:static md:z-auto md:translate-x-0 md:transition-all ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
                    } ${sidebarOpen ? 'md:w-70 md:min-w-70' : 'md:w-16 md:min-w-16'}`}
            >
                <Sidebar open={sidebarOpen || mobileNavOpen} setSidebarOpen={setSidebarOpen} onNavigate={() => setMobileNavOpen(false)} />
            </div>

            <div className="flex-1 flex flex-col h-full min-w-0">
                <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} />
                <main id="main-content" tabIndex={-1} className="p-4 flex-1 overflow-y-auto outline-none" style={{backgroundColor: 'var(--surface)'}}>
                    <Outlet />
                </main>
            </div>

        </div>
    );
}