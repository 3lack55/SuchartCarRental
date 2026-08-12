import { useState } from "react";
import { useAuth } from "../../../context/auth/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, ChevronDown, Settings, Palette } from "lucide-react";
import ThemeSelector from "./ThemeSelector";

function getInitials(name = "") {
    return name.slice(0, 2).toUpperCase();
}

function getGradientFromName(name = "") {
    const gradients = [
        "linear-gradient(135deg, #6366f1, #8b5cf6)", // indigo-violet
        "linear-gradient(135deg, #3b82f6, #06b6d4)", // blue-cyan
        "linear-gradient(135deg, #f43f5e, #f97316)", // rose-orange
        "linear-gradient(135deg, #10b981, #06b6d4)", // emerald-cyan
        "linear-gradient(135deg, #8b5cf6, #ec4899)", // violet-pink
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return gradients[Math.abs(hash) % gradients.length];
}

export default function Avatar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isThemeExpanded, setIsThemeExpanded] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleThemeToggle = (event) => {
        event.stopPropagation();
        setIsThemeExpanded((prev) => !prev);
    };

    const gradient = getGradientFromName(user?.username || "U");

    return (
        <div className="relative">
            <div
                className="avatar flex items-center gap-3 cursor-pointer group select-none rounded-l-full py-2 pl-2 transition-colors"
                onClick={() => { setIsMenuOpen(!isMenuOpen); setIsThemeExpanded(false); }}
            >
                <div
                    className="relative rounded-full w-11 h-11 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
                    style={{
                        background: gradient,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                    }}
                >
                    <span className="text-white font-semibold text-sm tracking-wide">
                        {getInitials(user?.username)}
                    </span>
                    {/* ring บางๆ รอบ avatar */}
                    <div className="absolute inset-0 rounded-full ring-2 ring-white/10" />
                    {/* online dot (ถ้าต้องการ) */}
                    <span
                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                        style={{ backgroundColor: "#22c55e", borderColor: "var(--surface)" }}
                    />
                </div>

                <div className="flex flex-col items-start justify-center leading-tight">
                    <span className="font-semibold text-sm">{user?.username}</span>
                    <span className="text-xs opacity-60">{user?.role}</span>
                </div>

                <ChevronDown
                    className={`w-4 h-4 opacity-50 transition-transform duration-200 mr-3 ${isMenuOpen ? "rotate-180" : ""}`}
                />
            </div>

            {isMenuOpen && (
                <>
                    <div className="fixed inset-0 z-1005" onClick={() => { setIsMenuOpen(false); setIsThemeExpanded(false); }}></div>

                    <div
                        className="absolute right-3 w-60 top-full mt-3 backdrop-blur-md border rounded-xl shadow-2xl overflow-hidden z-1006
                                   origin-top-right animate-in fade-in zoom-in-95 duration-150"
                        style={{ backgroundColor: "var(--surface)", borderColor: "var(--surface-border)" }}
                    >
                        <div className="flex items-center gap-3 px-3 py-3 border-b" style={{ borderColor: "var(--surface-border)" }}>
                            <div
                                className="rounded-full w-9 h-9 flex items-center justify-center shrink-0"
                                style={{ background: gradient }}
                            >
                                <span className="text-white font-semibold text-xs">{getInitials(user?.username)}</span>
                            </div>
                            <div className="flex flex-col leading-tight overflow-hidden">
                                <span className="font-medium text-sm truncate">{user?.username}</span>
                                <span className="text-xs opacity-60 truncate">{user?.role}</span>
                            </div>
                        </div>

                        {user?.role === "admin" && (
                            <div className="p-1 border-b " style={{ borderColor: "var(--surface-border)" }}>
                                <p className="text-xs text-slate-400 px-2 py-1">สำหรับผู้ดูแลระบบ (Admin)</p>

                                <Link to="/">
                                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-emerald-500/10 hover:text-emerald-400 rounded-lg transition-colors cursor-pointer">
                                        <Settings className="w-5 h-5" />
                                        <span>จัดการระบบ</span>
                                    </button>
                                </Link>
                            </div>
                        )}

                        <div className="p-1">
                            <button
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-emerald-500/10 hover:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                                onClick={handleThemeToggle}
                            >
                                <Palette className="w-4 h-4" />
                                <span>ธีม</span>
                            </button>

                            <div
                                className="overflow-hidden transition-all duration-200 ease-out"
                                style={{ maxHeight: isThemeExpanded ? 220 : 0, opacity: isThemeExpanded ? 1 : 0 }}
                            >
                                <div className="px-2 pb-2 pt-1">
                                    <ThemeSelector />
                                </div>
                            </div>
                        </div>

                        <div className="p-1">
                            <button
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors  cursor-pointer"
                                onClick={handleLogout}
                            >
                                <LogOut className="w-4 h-4" />
                                <span>ออกจากระบบ</span>
                            </button>
                        </div>

                    </div>
                </>
            )}
        </div>
    );
}