import { useState } from "react";
import { AuthContext } from "./authContextDefinition";

function getStoredUser() {
    const token = sessionStorage.getItem("token");
    if (!token) return null;

    return {
        token,
        user_id: sessionStorage.getItem("user_id"),
        username: sessionStorage.getItem("username"),
        role: sessionStorage.getItem("role"),
    };
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(getStoredUser);
    const [loading] = useState(false);
    const [redirectUrl, setRedirectUrl] = useState(null);

    const login = (token, username, user_id, role) => {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("username", username);
        sessionStorage.setItem("user_id", user_id);
        sessionStorage.setItem("role", role);
        setUser({ token, username, user_id, role });
    };

    const logout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("user_id");
        sessionStorage.removeItem("role");
        setUser(null);
    };

    const saveRedirectUrl = (url) => {
        sessionStorage.setItem("redirectUrl", url);
        setRedirectUrl(url);
    };

    const getRedirectUrl = () => {
        const url = sessionStorage.getItem("redirectUrl") || redirectUrl;
        return url;
    };

    const clearRedirectUrl = () => {
        sessionStorage.removeItem("redirectUrl");
        setRedirectUrl(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, saveRedirectUrl, getRedirectUrl, clearRedirectUrl }}>
            {children}
        </AuthContext.Provider>
    );
}
