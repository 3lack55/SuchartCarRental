import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../css/register.css";
import { registerUser } from "../../services/authApi";

const validate = (form) => {
    const errors = {};
    if (!form.username.trim()) {
        errors.username = "กรุณากรอก Username";
    } else if (form.username.length < 3) {
        errors.username = "Username ต้องมีอย่างน้อย 3 ตัวอักษร";
    }
    if (!form.password) {
        errors.password = "กรุณากรอกรหัสผ่าน";
    } else if (form.password.length < 6) {
        errors.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    }
    if (!form.confirmPassword) {
        errors.confirmPassword = "กรุณายืนยันรหัสผ่าน";
    } else if (form.password !== form.confirmPassword) {
        errors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
    }
    return errors;
};

// Password strength indicator
function PasswordStrength({ password }) {
    if (!password) return null;
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const labels = ["", "อ่อนมาก", "อ่อน", "พอใช้", "ดี", "แข็งแกร่ง"];
    const colors = ["", "#f87171", "#fb923c", "#fbbf24", "#34d399", "#10b981"];
    const widths = ["0%", "20%", "40%", "60%", "80%", "100%"];

    return (
        <div style={{ marginTop: 6 }}>
            <div style={{
                height: 3,
                borderRadius: 99,
                background: "rgba(255,255,255,0.08)",
                overflow: "hidden",
            }}>
                <div style={{
                    height: "100%",
                    width: widths[strength],
                    background: colors[strength],
                    borderRadius: 99,
                    transition: "width 0.4s ease, background 0.4s ease",
                }} />
            </div>
            {strength > 0 && (
                <p style={{
                    fontSize: "0.72rem",
                    color: colors[strength],
                    marginTop: 4,
                    paddingLeft: 2,
                    transition: "color 0.3s",
                }}>
                    ความปลอดภัย: {labels[strength]}
                </p>
            )}
        </div>
    );
}

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: "", password: "", confirmPassword: "" });
    const [fieldErrors, setFieldErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [success, setSuccess] = useState("");
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
            const data = await registerUser({ username: form.username, password: form.password });
            if (!data.success) return setServerError(data.message || "การสมัครสมาชิกล้มเหลว กรุณาลองใหม่อีกครั้ง");
            setSuccess("สมัครสมาชิกสำเร็จแล้ว กำลังพาไปหน้าเข้าสู่ระบบ...");
            setTimeout(() => navigate("/login"), 2000);
        } catch {
            setServerError("เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่อีกครั้งในภายหลัง");
        } finally {
            setLoading(false);
        }
    };

    return (
            <main className="register-bg">
                <div className={`register-card ${mounted ? "mounted" : ""}`}>
                    {/* Logo */}
                    <div className="logo-ring-r">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <line x1="19" y1="8" x2="19" y2="14" />
                            <line x1="22" y1="11" x2="16" y2="11" />
                        </svg>
                    </div>

                    <h1 className="register-title">สมัครสมาชิก</h1>
                    <p className="register-subtitle">สร้างบัญชีใหม่ได้เลย ฟรี!</p>

                    {serverError && <div role="alert" className="server-error-r">{serverError}</div>}
                    {success && <div role="status" className="success-msg">✓ {success}</div>}

                    <form onSubmit={handleSubmit}>
                        {/* Username */}
                        <div className="field-group">
                            <label htmlFor="register-username" className="field-label">Username</label>
                            <div className={`input-wrapper-r ${focusedField === "username" ? "focused" : ""}`}>
                                <svg className="input-icon-r" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                <input
                                    id="register-username"
                                    className={`auth-input-r ${fieldErrors.username ? "error" : form.username.length >= 3 ? "valid" : ""}`}
                                    placeholder="อย่างน้อย 3 ตัวอักษร"
                                    value={form.username}
                                    onChange={handleChange("username")}
                                    onFocus={() => setFocusedField("username")}
                                    onBlur={() => setFocusedField(null)}
                                />
                                {form.username.length >= 3 && !fieldErrors.username && (
                                    <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </div>
                            {fieldErrors.username && <p role="alert" className="field-error">⚠ {fieldErrors.username}</p>}
                        </div>

                        {/* Password */}
                        <div className="field-group">
                            <label htmlFor="register-password" className="field-label">รหัสผ่าน</label>
                            <div className={`input-wrapper-r ${focusedField === "password" ? "focused" : ""}`}>
                                <svg className="input-icon-r" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <input
                                    id="register-password"
                                    type="password"
                                    className={`auth-input-r ${fieldErrors.password ? "error" : ""}`}
                                    placeholder="อย่างน้อย 6 ตัวอักษร"
                                    value={form.password}
                                    onChange={handleChange("password")}
                                    onFocus={() => setFocusedField("password")}
                                    onBlur={() => setFocusedField(null)}
                                />
                            </div>
                            <PasswordStrength password={form.password} />
                            {fieldErrors.password && <p role="alert" className="field-error">⚠ {fieldErrors.password}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div className="field-group">
                            <label htmlFor="register-confirm-password" className="field-label">ยืนยันรหัสผ่าน</label>
                            <div className={`input-wrapper-r ${focusedField === "confirmPassword" ? "focused" : ""}`}>
                                <svg className="input-icon-r" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                                <input
                                    id="register-confirm-password"
                                    type="password"
                                    className={`auth-input-r ${fieldErrors.confirmPassword ? "error" : form.confirmPassword && form.password === form.confirmPassword ? "valid" : ""}`}
                                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                                    value={form.confirmPassword}
                                    onChange={handleChange("confirmPassword")}
                                    onFocus={() => setFocusedField("confirmPassword")}
                                    onBlur={() => setFocusedField(null)}
                                />
                                {form.confirmPassword && form.password === form.confirmPassword && !fieldErrors.confirmPassword && (
                                    <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </div>
                            {fieldErrors.confirmPassword && <p role="alert" className="field-error">⚠ {fieldErrors.confirmPassword}</p>}
                        </div>

                        <button type="submit" className="submit-btn-r" disabled={loading}>
                            {loading && <span className="spinner-r" />}
                            {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
                        </button>
                    </form>

                    <div className="divider-r">
                        <div className="divider-line-r" />
                        <span className="divider-text-r">หรือ</span>
                        <div className="divider-line-r" />
                    </div>

                    <p className="footer-text-r">
                        มีบัญชีแล้ว?{" "}
                        <Link to="/login" className="footer-link-r">เข้าสู่ระบบ</Link>
                    </p>
                </div>
            </main>
    );
}