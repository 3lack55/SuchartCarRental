import { Logo } from './Logo';
import SidebarMenu from './SidebarMenu';

export default function Sidebar( { open, setSidebarOpen } ) {

    return (
        <div className={`w-full h-full gap-4 flex flex-col border-r`} style={{backgroundColor: 'var(--primary-color)', borderColor: 'var(--surface-border)'}}>
            <div className={`w-full ${open ? 'px-3' : ''}`}>
                <Logo isSidebarOpen={open} setSidebarOpen={setSidebarOpen} />
            </div>

            <div className='w-full h-px rounded-2xl' style={{backgroundColor: 'var(--surface-border)'}}></div>

            <div className='w-full'>
                <SidebarMenu isSidebarOpen={open} />
            </div>
        </div>
    );
}
