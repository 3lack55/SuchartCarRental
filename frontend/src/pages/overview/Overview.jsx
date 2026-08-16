import { useMemo } from "react";
import { useOverview } from "../../services/overview/overviewQueries.js";
import { useAuth } from "../../context/auth/useAuth";
import { useTheme } from "../../context/theme/useTheme";

const pageStyle = {
    backgroundColor: "var(--page-bg)",
    color: "var(--page-text)",
};

const surfaceStyle = {
    backgroundColor: "var(--surface)",
    borderColor: "var(--surface-border)",
    color: "var(--page-text)",
};

const surfaceSoftStyle = {
    backgroundColor: "var(--surface-soft)",
    color: "var(--page-text)",
};

const mutedTextStyle = {
    color: "var(--page-text)",
    opacity: 0.75,
};

const summaryVariants = {
    blue: {
        iconBg: "var(--primary-color-soft)",
        iconColor: "var(--primary-color)",
        valueColor: "var(--page-text)",
    },
    orange: {
        iconBg: "var(--status-warning-soft)",
        iconColor: "var(--status-warning)",
        valueColor: "var(--status-warning)",
    },
    red: {
        iconBg: "var(--status-danger-soft)",
        iconColor: "var(--status-danger)",
        valueColor: "var(--status-danger)",
    },
};

const statusStyles = {
    warning: {
        dotColor: "var(--status-warning)",
        numberColor: "var(--status-warning)",
    },
    danger: {
        dotColor: "var(--status-danger)",
        numberColor: "var(--status-danger)",
    },
    normal: {
        dotColor: "var(--status-success)",
        numberColor: "var(--status-success)",
    },
};

const statIcons = {
    vehicle: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M5 17h14M7 17v2M17 17v2M5 17l-1-5 2-5h12l2 5-1 5M6 12h12" />
            <circle cx="7.5" cy="15" r="1" />
            <circle cx="16.5" cy="15" r="1" />
        </svg>
    ),
    driver: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 20c.8-3.5 3.2-5.5 7-5.5s6.2 2 7 5.5" />
        </svg>
    ),
    warning: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 3 2.8 20h18.4L12 3Z" />
            <path d="M12 9v5M12 17.5v.1" />
        </svg>
    ),
    document: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 3h9l4 4v14H6V3Z" />
            <path d="M14 3v5h5M9 13h6M9 17h6" />
        </svg>
    ),
    fine: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 7v10M15 9.5c-.7-.7-1.7-1-3-1-1.5 0-2.5.7-2.5 1.8 0 1.2 1.2 1.7 2.7 2.1 1.5.4 2.8.9 2.8 2.2 0 1.2-1.1 2-2.8 2-1.3 0-2.4-.4-3.2-1.2" />
        </svg>
    ),
    maintenance: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="m14.5 6.5 3-3 3 3-3 3" />
            <path d="m17.5 6.5-7.8 7.8M5 19l3.5-.7 9-9-2.8-2.8-9 9L5 19Z" />
        </svg>
    ),
};

const safeNumber = (value) => Number(value ?? 0);

const formatCurrency = (value) =>
    safeNumber(value).toLocaleString("th-TH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

function StatIcon({ type }) {
    return <div className="h-6 w-6">{statIcons[type] ?? null}</div>;
}

function SummaryCard({ icon, title, value, description, variant = "blue", accentColor }) {
    const style = summaryVariants[variant] || summaryVariants.blue;
    const iconBg = accentColor ? accentColor.soft : style.iconBg;
    const iconColor = accentColor ? accentColor.main : style.iconColor;

    return (
        <div className="rounded-2xl border p-5 shadow-sm" style={{ ...surfaceStyle, borderColor: "var(--surface-border)" }}>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm" style={{ color: "var(--page-text)" }}>{title}</p>
                    <p className="mt-2 text-3xl font-semibold" style={{ color: style.valueColor }}>{value}</p>
                    <p className="mt-1 text-xs" style={{ color: "var(--page-text)", opacity: 0.75 }}>{description}</p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: iconBg, color: iconColor }}>
                    <StatIcon type={icon} />
                </div>
            </div>
        </div>
    );
}

function StatusRow({ label, value, variant = "warning" }) {
    const style = statusStyles[variant] || statusStyles.warning;

    return (
        <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: style.dotColor }} />
                <span className="text-sm" style={mutedTextStyle}>{label}</span>
            </div>

            <span className="text-lg font-semibold" style={{ color: style.numberColor }}>{value}</span>
        </div>
    );
}

function DocumentCard({ title, icon, expiring, expired }) {
    const { themeColor } = useTheme();

    return (
        <div className="rounded-2xl border p-5 shadow-sm" style={surfaceStyle}>
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: "var(--primary-color-soft)", color: themeColor }}>
                    <StatIcon type={icon} />
                </div>

                <div>
                    <h3 className="font-medium" style={{ color: "var(--page-text)" }}>{title}</h3>
                    <p className="text-xs" style={{ color: "var(--page-text)", opacity: 0.75 }}>สถานะเอกสาร</p>
                </div>
            </div>

            <div className="mt-5 flex flex-col" style={{ borderColor: "var(--surface-border)" }}>
                <StatusRow label="ใกล้หมดอายุภายใน 30 วัน" value={expiring} variant="warning" />
                <div className="my-1 h-px w-full" style={{ backgroundColor: "var(--surface-border)" }} />
                <StatusRow label="หมดอายุแล้ว" value={expired} variant="danger" />
            </div>
        </div>
    );
}

export default function Overview() {
    const { user } = useAuth();
    const { themeColor, themeMode } = useTheme();

    const { data, isLoading, error: queryError } = useOverview();
    const overview = data?.data ?? data ?? null;
    const loading = Boolean(user?.token) && isLoading;
    const error = !user?.token ? "" : queryError ? (queryError.message || "ไม่สามารถโหลดข้อมูลภาพรวมได้") : "";

    const documentsTotal = useMemo(() => {
        if (!overview) return 0;

        return safeNumber(overview.documents_expiring_30d_total) + safeNumber(overview.documents_expired_total);
    }, [overview]);

    const summaryCards = useMemo(() => {
        if (!overview) return [];

        return [
            {
                icon: "vehicle",
                title: "รถทั้งหมด",
                value: `${safeNumber(overview.total_vehicles)} คัน`,
                description: "จำนวนรถในระบบ",
            },
            {
                icon: "driver",
                title: "คนขับทั้งหมด",
                value: `${safeNumber(overview.total_drivers)} คน`,
                description: "จำนวนคนขับในระบบ",
            },
            {
                icon: "warning",
                title: "รถไม่มีคนขับ",
                value: `${safeNumber(overview.vehicles_without_driver)} คัน`,
                description: "รถที่ยังไม่มีคนขับ",
                variant: safeNumber(overview.vehicles_without_driver) > 0 ? "orange" : "blue",
            },
            {
                icon: "document",
                title: "เอกสารต้องดำเนินการ",
                value: `${documentsTotal} รายการ`,
                description: `${safeNumber(overview.documents_expiring_30d_total)} ใกล้หมดอายุ · ${safeNumber(overview.documents_expired_total)} หมดอายุ`,
                variant: documentsTotal > 0 ? "red" : "blue",
            },
        ];
    }, [documentsTotal, overview]);

    const documentCards = useMemo(() => {
        if (!overview) return [];

        return [
            {
                title: "ภาษีรถ",
                icon: "vehicle",
                expiring: safeNumber(overview.tax_expiring_30d),
                expired: safeNumber(overview.tax_expired),
            },
            {
                title: "พ.ร.บ.",
                icon: "document",
                expiring: safeNumber(overview.act_expiring_30d),
                expired: safeNumber(overview.act_expired),
            },
            {
                title: "ประกันภัย",
                icon: "document",
                expiring: safeNumber(overview.insurance_expiring_30d),
                expired: safeNumber(overview.insurance_expired),
            },
        ];
    }, [overview]);

    if (loading) {
        return (
            <div className="min-h-full p-6" style={pageStyle}>
                <div className="mx-auto max-w-7xl">
                    <div className="mb-6">
                        <div className="h-7 w-48 animate-pulse rounded" style={{ backgroundColor: "var(--surface)" }} />
                        <div className="mt-2 h-4 w-72 animate-pulse rounded" style={{ backgroundColor: "var(--surface)" }} />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="h-32 animate-pulse rounded-2xl shadow-sm" style={surfaceStyle} />
                        ))}
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="h-64 animate-pulse rounded-2xl shadow-sm" style={surfaceStyle} />
                        <div className="h-64 animate-pulse rounded-2xl shadow-sm" style={surfaceStyle} />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-full p-6" style={pageStyle}>
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-2xl border p-5" style={{ ...surfaceStyle, borderColor: "var(--status-danger-soft)", backgroundColor: "var(--status-danger-soft)" }}>
                        <div className="flex items-center gap-3">
                            <div style={{ color: "var(--status-danger)" }}>
                                <StatIcon type="warning" />
                            </div>

                            <div>
                                <h2 className="font-medium" style={{ color: "var(--status-danger)" }}>ไม่สามารถโหลดข้อมูลได้</h2>
                                <p className="mt-1 text-sm" style={{ color: "var(--status-danger)" }}>{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!overview) {
        return (
            <div className="min-h-full p-6" style={pageStyle}>
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-2xl border p-8 text-center" style={{ ...surfaceStyle, borderColor: "var(--surface-border)" }}>
                        <p style={{ color: "var(--page-text)", opacity: 0.8 }}>ไม่พบข้อมูลภาพรวม</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-full overflow-y-auto">
            <div className="mx-auto max-w-7xl">
                <header className="mb-6">
                    <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--page-text)" }}>
                        ภาพรวมการจัดการยานพาหนะ
                    </h1>
                    <p className="mt-1 text-sm" style={mutedTextStyle}>
                        ตรวจสอบสถานะรถ คนขับ เอกสาร ค่าปรับ และการบำรุงรักษา
                    </p>
                </header>

                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((item) => (
                        <SummaryCard
                            key={item.title}
                            icon={item.icon}
                            title={item.title}
                            value={item.value}
                            description={item.description}
                            variant={item.variant || "blue"}
                            accentColor={
                                item.variant === "blue"
                                    ? { soft: "var(--primary-color-soft)", main: themeColor }
                                    : undefined
                            }
                        />
                    ))}
                </section>

                <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border p-6 shadow-sm" style={surfaceStyle}>
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold" style={{ color: "var(--page-text)" }}>สถานะเอกสาร</h2>
                                <p className="mt-1 text-sm" style={mutedTextStyle}>เอกสารที่ใกล้หมดอายุและหมดอายุแล้ว</p>
                            </div>

                            <div
                                className="rounded-xl px-3 py-2 text-sm font-medium"
                                style={{
                                    backgroundColor: themeMode === "dark" ? "rgba(var(--primary-color-rgb), 0.18)" : "var(--primary-color-soft)",
                                    color: themeColor,
                                    border: "1px solid rgba(var(--primary-color-rgb), 0.22)",
                                }}
                            >
                                {documentsTotal} รายการ
                            </div>
                        </div>

                        <div className="mt-5">
                            <StatusRow label="ใกล้หมดอายุภายใน 30 วัน" value={safeNumber(overview.documents_expiring_30d_total)} variant="warning" />
                            <StatusRow label="หมดอายุแล้ว" value={safeNumber(overview.documents_expired_total)} variant="danger" />
                        </div>
                    </div>

                    <div className="rounded-2xl border p-6 shadow-sm" style={surfaceStyle}>
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold" style={{ color: "var(--page-text)" }}>ค่าปรับ</h2>
                                <p className="mt-1 text-sm" style={mutedTextStyle}>สถานะค่าปรับของรถในระบบ</p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: "var(--status-danger-soft)", color: "var(--status-danger)" }}>
                                <StatIcon type="fine" />
                            </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-4">
                            <div className="rounded-xl p-4" style={surfaceSoftStyle}>
                                <p className="text-sm" style={mutedTextStyle}>ค้างชำระ</p>
                                <p className="mt-1 text-2xl font-semibold" style={{ color: "var(--status-danger)" }}>
                                    {safeNumber(overview.unpaid_violations_count)}
                                </p>
                                <p className="mt-1 text-xs" style={{ color: "var(--page-text)", opacity: 0.6 }}>รายการ</p>
                            </div>

                            <div className="rounded-xl p-4" style={surfaceSoftStyle}>
                                <p className="text-sm" style={mutedTextStyle}>ยอดค้างชำระ</p>
                                <p className="mt-1 text-2xl font-semibold" style={{ color: "var(--page-text)" }}>
                                    ฿{formatCurrency(overview.unpaid_violations_total_fine)}
                                </p>
                                <p className="mt-1 text-xs" style={{ color: "var(--page-text)", opacity: 0.6 }}>
                                    เดือนนี้ {safeNumber(overview.violations_this_month)} รายการ
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-6">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold" style={{ color: "var(--page-text)" }}>สถานะเอกสารตามประเภท</h2>
                        <p className="mt-1 text-sm" style={mutedTextStyle}>ตรวจสอบเอกสารสำคัญของรถแต่ละประเภท</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {documentCards.map((item) => (
                            <DocumentCard
                                key={item.title}
                                title={item.title}
                                icon={item.icon}
                                expiring={item.expiring}
                                expired={item.expired}
                            />
                        ))}
                    </div>
                </section>

                <section className="mt-6">
                    <div className="rounded-2xl border p-6 shadow-sm" style={surfaceStyle}>
                        <div className="flex items-center gap-3">
                            <div
                                className="flex h-10 w-10 items-center justify-center rounded-xl"
                                style={{
                                    backgroundColor: themeMode === "dark" ? "rgba(var(--primary-color-rgb), 0.18)" : "var(--primary-color-soft)",
                                    color: themeColor,
                                }}
                            >
                                <StatIcon type="maintenance" />
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold" style={{ color: "var(--page-text)" }}>การบำรุงรักษาเดือนนี้</h2>
                                <p className="text-sm" style={mutedTextStyle}>สรุปรายการและค่าใช้จ่ายการบำรุงรักษา</p>
                            </div>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="rounded-xl p-5" style={surfaceSoftStyle}>
                                <p className="text-sm" style={mutedTextStyle}>รายการบำรุงรักษา</p>
                                <p className="mt-2 text-3xl font-semibold" style={{ color: "var(--page-text)" }}>
                                    {safeNumber(overview.maintenances_this_month)}
                                </p>
                                <p className="mt-1 text-xs" style={{ color: "var(--page-text)", opacity: 0.6 }}>ครั้ง</p>
                            </div>

                            <div className="rounded-xl p-5" style={surfaceSoftStyle}>
                                <p className="text-sm" style={mutedTextStyle}>ค่าใช้จ่าย</p>
                                <p className="mt-2 text-3xl font-semibold" style={{ color: "var(--page-text)" }}>
                                    ฿{formatCurrency(overview.maintenance_cost_this_month)}
                                </p>
                                <p className="mt-1 text-xs" style={{ color: "var(--page-text)", opacity: 0.6 }}>ค่าใช้จ่ายรวมเดือนนี้</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}