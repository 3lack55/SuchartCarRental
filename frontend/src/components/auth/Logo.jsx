export function Logo({primary = false}) {
    return (
        <div className={`flex h-20 items-center overflow-hidden`}>
            <div className="flex min-w-0 flex-1 flex-col justify-center overflow-hidden py-1">
                <span className={`truncate whitespace-nowrap text-4xl font-bold tracking-wider`}>
                    SUCHART KORAT
                </span>
                <div className="mt-1 h-0.5 w-3/4 rounded-full" style={{backgroundColor: primary? 'var(--on-primary)' : 'var(--page-text)'}}></div>
                <span className={`truncate whitespace-nowrap text-md`}>
                    CAR RENTAL LTD., PART.
                </span>
            </div>

        </div>
    );
}
