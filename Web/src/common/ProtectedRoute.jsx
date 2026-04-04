import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center font-black uppercase text-2xl tracking-[0.4em] animate-pulse">
                Verifying Access...
            </div>
        );
    }

    if (!user) {
        // Not logged in: send them to /login with the intended path in state
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return children;
}
