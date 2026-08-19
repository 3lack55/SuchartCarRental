import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, ScrollText, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/auth/useAuth';

const TABS = [
    { path: '/admin/users', label: 'ผู้ใช้งาน', icon: Users },
    { path: '/admin/logs', label: 'บันทึกกิจกรรมระบบ', icon: ScrollText },
];

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    function handleLogout() {
        logout();
        navigate('/login');
    }

    return (
        <div className="flex h-full w-full flex-col overflow-hidden" style={{ backgroundColor: 'var(--page-bg)', color: 'var(--page-text)' }}>
            <header className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface)' }}>
                <div className="flex items-center gap-3">
                    <Link
                        to="/overview"
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium no-underline transition-opacity hover:opacity-70"
                        style={{ color: 'var(--sub-text)' }}
                    >
                        <ArrowLeft size={16} />
                        กลับสู่ระบบหลัก
                    </Link>
                    <span className="h-5 w-px" style={{ backgroundColor: 'var(--surface-border)' }} />
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={18} style={{ color: 'var(--primary-color)' }} />
                        <span className="font-semibold tracking-wide">แผงควบคุมผู้ดูแลระบบ</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm" style={{ color: 'var(--sub-text)' }}>{user?.username}</span>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors hover:opacity-80"
                        style={{ color: 'var(--status-danger)' }}
                    >
                        <LogOut size={16} />
                        ออกจากระบบ
                    </button>
                </div>
            </header>

            <nav className="flex gap-1 border-b px-5 pt-2" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface)' }}>
                {TABS.map((tab) => {
                    const isActive = location.pathname.startsWith(tab.path);
                    const Icon = tab.icon;
                    return (
                        <Link
                            key={tab.path}
                            to={tab.path}
                            className="flex items-center gap-2 rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-medium no-underline transition-colors"
                            style={{
                                borderColor: isActive ? 'var(--primary-color)' : 'transparent',
                                color: isActive ? 'var(--primary-color)' : 'var(--sub-text)',
                            }}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </Link>
                    );
                })}
            </nav>

            <main className="flex-1 overflow-y-auto p-5">
                <Outlet />
            </main>
        </div>
    );
}
