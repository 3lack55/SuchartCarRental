import { X } from 'lucide-react';
import { Logo } from './Logo';
import SidebarMenu from './SidebarMenu';

export default function Sidebar( { open, setSidebarOpen, onNavigate } ) {

    return (
        <aside aria-label="แถบเมนูด้านข้าง" className={`relative w-full h-full flex flex-col border-r`} style={{backgroundColor: 'var(--primary-color)', borderColor: 'var(--surface-border)'}}>
            <button
                type="button"
                onClick={onNavigate}
                aria-label="ปิดเมนู"
                className="absolute right-3 top-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-70 md:hidden"
                style={{ color: 'var(--on-primary)', backgroundColor: 'var(--primary-color-soft)' }}
            >
                <X size={18} />
            </button>

            <div className={`w-full ${open ? 'px-3' : ''}`}>
                <Logo isSidebarOpen={open} setSidebarOpen={setSidebarOpen} />
            </div>

            <div className='w-full h-px rounded-2xl mt-4' style={{backgroundColor: 'var(--surface-border)'}}></div>

            <div className='w-full'>
                <SidebarMenu isSidebarOpen={open} onNavigate={onNavigate} />
            </div>
        </aside>
    );
}
