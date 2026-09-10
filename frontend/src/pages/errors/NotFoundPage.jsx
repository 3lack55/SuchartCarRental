import { useNavigate, useLocation } from 'react-router-dom';
import { RouteOff } from 'lucide-react';

export default function NotFoundPage({ homeTo = '/overview', homeLabel = 'กลับหน้าภาพรวม' }) {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-16 text-center">
            <div className="relative mb-8 select-none">
                <p
                    className="text-[9rem] font-black leading-none tracking-tight sm:text-[12rem]"
                    style={{ color: 'var(--surface-soft)', WebkitTextStroke: '2px var(--surface-border)' }}
                    aria-hidden="true"
                >
                    404
                </p>
                <div
                    className="absolute inset-0 flex items-center justify-center"
                    aria-hidden="true"
                >
                    <div
                        className="flex h-20 w-20 items-center justify-center rounded-full shadow-lg sm:h-24 sm:w-24"
                        style={{ backgroundColor: 'var(--primary-color)' }}
                    >
                        <RouteOff size={44} strokeWidth={1.75} style={{ color: 'var(--on-primary)' }} />
                    </div>
                </div>
            </div>

            <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: 'var(--page-text)' }}>
                ไม่พบหน้านี้ในระบบ
            </h1>
            <p className="mt-3 max-w-md text-sm" style={{ color: 'var(--sub-text)' }}>
                เส้นทางที่คุณพยายามเข้าถึงอาจถูกย้าย ลบไปแล้ว หรือไม่เคยมีอยู่จริง ลองตรวจสอบ URL อีกครั้ง
            </p>

            <p
                className="mt-4 max-w-full truncate rounded-full px-4 py-1.5 font-mono text-xs"
                style={{ backgroundColor: 'var(--surface-soft)', color: 'var(--sub-text)', border: '1px solid var(--surface-border)' }}
                title={location.pathname}
            >
                {location.pathname}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="cursor-pointer rounded-md border px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:opacity-80"
                    style={{ backgroundColor: 'var(--surface-soft)', borderColor: 'var(--surface-border)', color: 'var(--page-text)' }}
                >
                    ย้อนกลับ
                </button>
                <button
                    type="button"
                    onClick={() => navigate(homeTo, { replace: true })}
                    className="cursor-pointer rounded-md px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:opacity-90"
                    style={{ backgroundColor: 'var(--primary-color)', color: 'var(--on-primary)', boxShadow: '0 8px 18px rgba(15, 23, 42, 0.08)' }}
                >
                    {homeLabel}
                </button>
            </div>
        </div>
    );
}
