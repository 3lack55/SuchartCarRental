import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth/useAuth";
import { useNavigate, Link } from "react-router-dom";
import "../../css/login.css";
import { loginUser } from "../../services/authApi";

const validate = (form) => {
    const errors = {};
    if (!form.username.trim()) errors.username = "กรุณากรอก Username";
    if (!form.password) errors.password = "กรุณากรอกรหัสผ่าน";
    return errors;
};

export default function Login() {
    const { login, getRedirectUrl, clearRedirectUrl } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: "", password: "" });
    const [fieldErrors, setFieldErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    useEffect(() => {
        setTimeout(() => setMounted(true), 50);
    }, []);

    const handleChange = (field) => (e) => {
        setForm((p) => ({ ...p, [field]: e.target.value }));
        if (fieldErrors[field]) setFieldErrors((p) => ({ ...p, [field]: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");
        const errors = validate(form);
        if (Object.keys(errors).length > 0) return setFieldErrors(errors);
        setLoading(true);
        try {
            const res = await loginUser(form);

            if (!res.success) {
                return setServerError(res.data.message || "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
            }

            const banned = res.data.user.role === "banned" ? true : false;
            const deleted = res.data.user.deleted;

            if (banned || deleted) {
                clearRedirectUrl();
                return setServerError("คุณไม่สามารถเข้าสู่ระบบได้ด้วยเหตุผลบางอย่าง กรุณาติดต่อผู้ดูแลระบบ");
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
            <div className="login-bg">
                <div className={`login-card ${mounted ? "mounted" : ""}`}>
                    {/* Logo */}
                    <div className="logo-ring">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>

                    <h2 className="login-title">เข้าสู่ระบบ</h2>
                    <p className="login-subtitle">ยินดีต้อนรับกลับมา</p>

                    {serverError && <div className="server-error">{serverError}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="field-group">
                            <label className="field-label">Username</label>
                            <div className={`input-wrapper ${focusedField === "username" ? "focused" : ""}`}>
                                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                <input
                                    className={`auth-input ${fieldErrors.username ? "error" : ""}`}
                                    placeholder="กรอก username ของคุณ"
                                    value={form.username}
                                    onChange={handleChange("username")}
                                    onFocus={() => setFocusedField("username")}
                                    onBlur={() => setFocusedField(null)}
                                />
                            </div>
                            {fieldErrors.username && <p className="field-error">⚠ {fieldErrors.username}</p>}
                        </div>

                        <div className="field-group">
                            <label className="field-label">รหัสผ่าน</label>
                            <div className={`input-wrapper ${focusedField === "password" ? "focused" : ""}`}>
                                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <input
                                    type="password"
                                    className={`auth-input ${fieldErrors.password ? "error" : ""}`}
                                    placeholder="กรอกรหัสผ่านของคุณ"
                                    value={form.password}
                                    onChange={handleChange("password")}
                                    onFocus={() => setFocusedField("password")}
                                    onBlur={() => setFocusedField(null)}
                                />
                            </div>
                            {fieldErrors.password && <p className="field-error">⚠ {fieldErrors.password}</p>}
                        </div>

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading && <span className="spinner" />}
                            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                        </button>
                    </form>

                    <div className="divider">
                        <div className="divider-line" />
                        <span className="divider-text">หรือ</span>
                        <div className="divider-line" />
                    </div>

                    <p className="footer-text">
                        ยังไม่มีบัญชี?{" "}
                        <Link to="/register" className="footer-link">สมัครสมาชิก</Link>
                    </p>
                </div>
            </div>
    );
}