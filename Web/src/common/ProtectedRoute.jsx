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

    // 🛡️ IDENTITY GATEKEEPER: Ensure a non-empty, non-temporary registration ID exists (FOR STUDENTS ONLY).
    // Staff accounts are allowed to proceed with just their basic profile details.
    const isStudent = user.role === 'STUDENT';
    const isTempId = isStudent && user.regNo === user.email;
    const isMissingData = isStudent && (!user.regNo || user.regNo.trim() === "");
    const needsOnboarding = !user.isOnboarded || isTempId || isMissingData;

    if (needsOnboarding && location.pathname !== "/onboarding") {
        return <Navigate to="/onboarding" replace />;
    }
    
    // 🛡️ REVERSE ESCORT: If a user is at Onboarding but is already complete, send them out.
    // (Handled internally by Onboarding.jsx, but we keep ProtectedRoute clean for them).

    return children;
}
