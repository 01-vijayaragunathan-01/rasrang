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
            setUser(null);
            setCsrfToken(null);
            await fetch("http://localhost:5000/api/auth/logout", { method: "POST", credentials: "include" });
        } catch (err) {
            console.error("Logout API failed, but clearing session anyway.");
        } finally {
            toast.success("SESSION TERMINATED: You have been signed out.");
            window.location.href = "/login";
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

        const handleKickout = () => {
            setUser(null);
            toast.error("SESSION EXPIRED: Please log in again to continue.");
            window.location.href = "/login?expired=true";
        };

        window.addEventListener('unauthorized-kickout', handleKickout);

        return () => window.removeEventListener('unauthorized-kickout', handleKickout);
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, setUser, csrfToken, setCsrfToken, loading, checkAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
