import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/mainLayout/Sidebar';
import Topbar from '../components/layout/mainLayout/Topbar';
import { useState } from 'react';

export default function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);


    return (
        <div className="flex w-full h-full">
            <div className={`transition-all duration-300 ${sidebarOpen ? 'w-70 min-w-70' : 'w-16 min-w-16'} overflow-hidden h-full relative`}>
                <Sidebar open={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            </div>
            <div className="flex-1 flex flex-col h-full">
                <Topbar />
                <div className="p-4 flex-1 overflow-y-auto">
                    <Outlet />
                </div>
            </div>

        </div>
    );
}