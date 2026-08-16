import { useState } from "react";
import { useAuth } from "../../context/auth/useAuth";
import { useNavigate } from "react-router-dom";
import "../../css/login.css";
import { loginUser } from "../../services/authApi";
import { Logo } from "../../components/auth/Logo";
import { useTheme } from "../../context/theme/useTheme";

const validate = (form) => {
    const errors = {};
    if (!form.username.trim()) errors.username = "กรุณากรอก Username";
    if (!form.password) errors.password = "กรุณากรอกรหัสผ่าน";
    return errors;
};

export default function Login() {
    const { login, getRedirectUrl, clearRedirectUrl } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: "", password: "", remember: false });
    const [fieldErrors, setFieldErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const { themeMode } = useTheme();

    const handleChange = (field) => (e) => {
        const value = field === "remember" ? e.target.checked : e.target.value;
        setForm((p) => ({ ...p, [field]: value }));
        if (fieldErrors[field]) setFieldErrors((p) => ({ ...p, [field]: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");
        const errors = validate(form);
        if (Object.keys(errors).length > 0) return setFieldErrors(errors);
        setLoading(true);
        try {
            const res = await loginUser({ username: form.username, password: form.password });

            if (!res.success) {
                console.log(res)
                return setServerError(res.message || "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
            }

            const banned = res.data.user.role === "banned";
            const deleted = res.data.user.deleted;

            if (banned || deleted) {
                clearRedirectUrl();
                return setServerError("คุณไม่สามารถเข้าสู่ระบบได้ด้วยเหตุผลบางประการ กรุณาติดต่อผู้ดูแลระบบ");
            }

            login(res.data.token, res.data.user.username, res.data.user.user_id, res.data.user.role);
            const redirectUrl = getRedirectUrl();
            clearRedirectUrl();
            navigate(redirectUrl || "/");
        } catch {
            setServerError("เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่อีกครั้งในภายหลัง");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: '100vh', background: 'var(--page-bg, #F4EBDC)' }}>

            {/* LEFT — brand panel (hidden on small screens) */}
            <div className="hidden lg:flex flex-col justify-between px-14 py-12 relative overflow-hidden" style={{ background: themeMode === 'dark' ? 'rgba(var(--primary-color-rgb), 0.7)' : 'var(--primary-color, #4A3524)', color: 'var(--on-primary, #EDEFE9)', transition: 'background 0.3s ease' }}>
                <div className="flex items-center gap-3 ">
                    <div>
                        <Logo primary={true}></Logo>
                        <div style={{ fontSize: 14, color: 'var(--on-primary-soft)', marginTop: 2 }}>ระบบจัดการรถและเอกสาร</div>
                    </div>
                </div>

                <div style={{ maxWidth: 420 }}>

                    <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }} className="tracking-wide">ระบบจัดการรถและเอกสาร</h2>
                    <p style={{ fontSize: 14.5, color: 'var(--on-primary-soft)', lineHeight: 1.4 }}>ติดตามวันต่อ พ.ร.บ. ใบเสร็จ ใบสั่ง และคนขับของคุณ พร้อมแจ้งเตือนก่อนเอกสารหมดอายุ ไม่ต้องพลาดวันสำคัญอีกต่อไป</p>
                </div>

                <div style={{ fontSize: 11, color: 'var(--on-primary-soft)' }}>© 2569 Suchat Car Rental · สงวนลิขสิทธิ์ทุกประการ</div>
            </div>

            {/* RIGHT — form panel */}
            <div className="flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-sm">
                    <div className="flex lg:hidden items-center gap-3 mb-10 justify-center">
                        <Logo></Logo>
                    </div>

                    <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6, color: 'var(--page-text, #111827)' }}>เข้าสู่ระบบ</h1>
                    <p style={{ fontSize: 13.5, color: 'var(--sub-text)', marginBottom: 24, opacity: 0.85 }}>กรอกข้อมูลบัญชีของคุณเพื่อเข้าใช้</p>

                    {serverError && <div className="server-error">{serverError}</div>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-[13px] font-semibold mb-1.5">ชื่อผู้ใช้</label>
                            <div 
                                className={`px-4 auth-input auth-input-inline ${fieldErrors.username ? 'error' : ''}`}
                                style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                border: `1px solid ${focusedField === 'username' ? 'var(--primary-color)' : 'var(--surface-border, #E3D5BE)'}`,
                                borderRadius: 10,
                                boxShadow: focusedField === 'username' ? '0 0 0 3px var(--primary-color-soft, transparent)' : 'none',
                                transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
                            }}>
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: focusedField === 'username' ? 'var(--primary-color)' : 'var(--sub-text)', transition: 'color 0.18s ease' }}><circle cx="12" cy="8" r="3.4" /><path d="M5 20c1-3.6 4-5.5 7-5.5s6 1.9 7 5.5" /></svg>
                                <input
                                    className="outline-0"
                                    value={form.username}
                                    onChange={handleChange('username')}
                                    onFocus={() => setFocusedField('username')}
                                    onBlur={() => setFocusedField(null)}
                                    style={{ flex: 1, minWidth: 0 }}
                                />
                            </div>
                            {fieldErrors.username && <p className="field-error">⚠ {fieldErrors.username}</p>}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-[13px] font-semibold">รหัสผ่าน</label>
                            </div>
                            <div
                                className={`px-4 auth-input auth-input-inline ${fieldErrors.password ? 'error' : ''}`}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    border: `1px solid ${focusedField === 'password' ? 'var(--primary-color)' : 'var(--surface-border, #E3D5BE)'}`,
                                    borderRadius: 10,
                                    boxShadow: focusedField === 'password' ? '0 0 0 3px var(--primary-color-soft, transparent)' : 'none',
                                    transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
                                }}>
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: focusedField === 'password' ? 'var(--primary-color)' : 'var(--sub-text)', transition: 'color 0.18s ease' }}><rect x="4.5" y="10.5" width="15" height="9.5" rx="2" /><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" /></svg>
                                <input
                                    className="outline-0"
                                    id="pw"
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={handleChange('password')}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    style={{ flex: 1, minWidth: 0 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((s) => !s)}
                                    aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                                    style={{ background: 'transparent', border: 0, padding: 2, cursor: 'pointer', color: 'var(--sub-text)', display: 'flex' }}
                                >
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                </button>
                            </div>
                            {fieldErrors.password && <p className="field-error">⚠ {fieldErrors.password}</p>}
                        </div>

                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded"
                                checked={form.remember}
                                onChange={handleChange('remember')}
                                style={{ accentColor: 'var(--primary-color)', borderColor: 'var(--surface-border)' }}
                            />
                            <span style={{ fontSize: 13, color: 'var(--sub-text)' }}>จดจำการเข้าสู่ระบบไว้ 30 วัน</span>
                        </label>

                        <button type="submit" className="w-full submit-btn" disabled={loading}>
                            {loading && <span className="spinner" />}
                            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                        </button>
                    </form>

                    {/* <p className="text-[13px] text-center mt-8" style={{ color: 'var(--page-text, rgba(0,0,0,0.65))', opacity: 0.85 }}>
                        ยังไม่มีบัญชี? <Link to="/register" className="footer-link">สมัครสมาชิก</Link>
                    </p> */}
                </div>
            </div>

        </div>
    );
}