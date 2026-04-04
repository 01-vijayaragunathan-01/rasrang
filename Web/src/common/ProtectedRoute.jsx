import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
    const { user, loading, logout } = useAuth();
    const location = useLocation();

    useEffect(() => {
        // If the module has finished loading and the user is null, aggressively purge the session.
        if (!loading && !user) {
            logout();
        }
    }, [loading, user, logout]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center font-black uppercase text-2xl tracking-[0.4em] animate-pulse">
                Verifying Access...
            </div>
        );
    }

    if (!user) {
        // Not logged in: The useEffect block above is already executing logout() to purge HTTPOnly cookies.
        // We still return Navigate to visually throw them back to Auth screen immediately.
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    if (!user.isOnboarded && location.pathname !== "/onboarding") {
        return <Navigate to="/onboarding" replace />;
    }

    return children;
}
