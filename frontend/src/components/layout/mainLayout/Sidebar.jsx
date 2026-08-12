import { Logo } from './Logo';
import SidebarMenu from './SidebarMenu';

export default function Sidebar( { open, setSidebarOpen } ) {

    return (
        <div className={`w-full h-full ${open ? 'px-4' : 'px-2'} gap-4 flex flex-col border-r`} style={{backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)'}}>
            <div className='w-full'>
                <Logo isSidebarOpen={open} setSidebarOpen={setSidebarOpen} />
            </div>

            <div className='w-full h-0.5 rounded-2xl' style={{backgroundColor: 'var(--surface-border)'}}></div>

            <div className='w-full'>
                <SidebarMenu isSidebarOpen={open} />
            </div>
        </div>
    );
}
