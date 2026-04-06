import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "./ToastContext";

const AuthContext = createContext();

// Global singleton for CSRF to allow the API utility to read it outside of React context
let _globalCsrfToken = null;
export const getCsrfTokenGlobal = () => _globalCsrfToken;

const updateGlobalCsrf = (token) => {
    _globalCsrfToken = token;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [csrfToken, setCsrfTokenState] = useState(null);
    const [loading, setLoading] = useState(true);

    const setCsrfToken = (token) => {
        setCsrfTokenState(token);
        updateGlobalCsrf(token);
    };
    const toast = useToast();

    const checkAuth = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/profile`, { credentials: "include" });
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
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`, { method: "POST", credentials: "include" });
        } catch (err) {
            console.error("Logout API failed, but clearing session anyway.");
        } finally {
            toast.success("SESSION TERMINATED: You have been signed out.");
            window.location.href = "/login";
        }
    };

    const refreshSession = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh-token`, { credentials: "include" });
            if (!res.ok) throw new Error("Sync failed");
            const data = await res.json();
            if (data.csrfToken) {
                setCsrfToken(data.csrfToken);
                return data.csrfToken;
            }
            return null;
        } catch (err) {
            console.error("Session sync failure", err);
            return null;
        }
    };

    useEffect(() => {
        // H-1 FIX: Read CSRF token from the short-lived _csrf_init cookie set by the backend
        // after Google OAuth redirect — NOT from the URL query param (which leaks to history/logs)
        const csrfFromCookie = document.cookie
            .split('; ')
            .find(r => r.startsWith('_csrf_init='))
            ?.split('=')[1];

        if (csrfFromCookie) {
            setCsrfToken(csrfFromCookie);
            // Immediately clear the one-time cookie — it's been consumed
            document.cookie = '_csrf_init=; Max-Age=0; path=/; SameSite=Lax';
        } else {
            // Fallback: support old ?csrf= URL param for backward compatibility during transition
            const params = new URLSearchParams(window.location.search);
            const csrf = params.get('csrf');
            if (csrf) {
                setCsrfToken(csrf);
                const url = new URL(window.location);
                url.searchParams.delete('csrf');
                window.history.replaceState({}, '', url);
            }
        }

        checkAuth();

        const handleKickout = () => {
            setUser(null);
            toast.error("🛡️ CONNECTION RE-SECURED: Your security session was out of sync. We've refreshed it—please log in once more to continue.");
            window.location.href = "/login?expired=true";
        };

        window.addEventListener('unauthorized-kickout', handleKickout);

        return () => window.removeEventListener('unauthorized-kickout', handleKickout);
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, setUser, csrfToken, setCsrfToken, refreshSession, loading, checkAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
