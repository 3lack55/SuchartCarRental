import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Logo({ isSidebarOpen, setSidebarOpen }) {
    return (
        <div className={`flex h-20 w-full items-center overflow-hidden ${isSidebarOpen ? 'justify-between gap-2' : 'justify-center'}`}>
            {isSidebarOpen ? (
                <div className="flex min-w-0 flex-1 flex-col justify-center overflow-hidden pt-3">
                    <span className={`truncate whitespace-nowrap text-2xl font-bold tracking-wide`} style={{color: 'var(--on-primary)' }}>
                        SUCHART KORAT
                    </span>
                    <div className="mt-1 h-0.5 w-3/4 rounded-full" style={{ backgroundColor: 'var(--on-primary)' }}></div>
                    <span className={`truncate whitespace-nowrap text-md`} style={{color: 'var(--on-primary)' }}>
                        CAR RENTAL LTD., PART.
                    </span>
                </div>
            ) : (
                <div className="w-0" />
            )}

            <button
                style={{color:'var(--on-primary)', backgroundColor : 'var(--primary-color-soft)'}}
                type="button"
                className={`cursor-pointer z-50 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-300 mt-3 hover:opacity-70`}
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
                {isSidebarOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
            </button>
        </div>
    );
}
