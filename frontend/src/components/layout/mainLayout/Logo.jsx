import { useTheme } from '../../../context/theme/useTheme';
import { PanelLeftClose, PanelRightClose } from 'lucide-react';

export function Logo({ isSidebarOpen, setSidebarOpen }) {
    const { themeColor, themeMode } = useTheme();

    return (
        <div className={`flex h-20 w-full items-center overflow-hidden ${isSidebarOpen ? 'justify-between gap-2' : 'justify-center'}`}>
            {isSidebarOpen ? (
                <div className="flex min-w-0 flex-1 flex-col justify-center overflow-hidden py-1">
                    <span className={`truncate whitespace-nowrap text-2xl font-bold tracking-wider ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        SUCHART KORAT
                    </span>
                    <div className="mt-1 h-0.5 w-3/4 rounded-full" style={{ backgroundColor: themeColor }}></div>
                    <span className={`truncate whitespace-nowrap text-md ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        CAR RENTAL LTD., PART.
                    </span>
                </div>
            ) : (
                <div className="w-0" />
            )}

            <button
                type="button"
                className={`cursor-pointer z-50 flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-all duration-300 ${themeMode === 'dark' ? 'text-white/60 hover:bg-white/10' : 'text-gray-800 hover:bg-gray-100'}`}
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
                {isSidebarOpen ? <PanelLeftClose size={24} /> : <PanelRightClose size={24} />}
            </button>
        </div>
    );
}
