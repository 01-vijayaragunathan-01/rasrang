import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "./ToastContext";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [csrfToken, setCsrfToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    const checkAuth = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/auth/profile", { credentials: "include" });
            if (res.status === 401) {
                 setUser(null);
                 setLoading(false);
                 return;
            }
            const data = await res.json();
            if (data.id) {
                setUser(data);
                if (data.csrfToken) setCsrfToken(data.csrfToken);
            } else {
                setUser(null);
            }
        } catch (err) {
            toast.error("CONNECTION PROTOCOL CRITICAL: Auth server unreachable.");
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await fetch("http://localhost:5000/api/auth/logout", { method: "POST", credentials: "include" });
            toast.success("SESSION TERMINATED: You have been signed out.");
            window.location.href = "/login";
        } catch (err) {
            toast.error("TERMINATION FAILURE: Logout protocol interrupted.");
        }
    };

    useEffect(() => {
        // Capture CSRF from URL if present (after Google Redirect)
        const params = new URLSearchParams(window.location.search);
        const csrf = params.get('csrf');
        if (csrf) {
            setCsrfToken(csrf);
            // Clean URL
            const url = new URL(window.location);
            url.searchParams.delete('csrf');
            window.history.replaceState({}, '', url);
        }

        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, csrfToken, setCsrfToken, loading, checkAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
