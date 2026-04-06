import { getCsrfTokenGlobal } from '../context/AuthContext';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * 📡 RASRANG UPLINK UTILITY
 * A wrapped fetch that handles CSRF, silent token refresh, 
 * and user-friendly error translation.
 */
export const api = async (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    
    // Auto-inject credentials and CSRF
    const defaultOptions = {
        ...options,
        credentials: 'include',
        headers: {
            ...options.headers,
            'Content-Type': options.headers?.['Content-Type'] || 'application/json',
            'x-csrf-token': getCsrfTokenGlobal()
        }
    };

    try {
        let response = await fetch(url, defaultOptions);

        // ─── 401 TOKEN EXPIRED: ATTEMPT SILENT REFRESH ───
        if (response.status === 401) {
            const data = await response.clone().json();
            
            if (data.code === 'TOKEN_EXPIRED') {
                console.log('📡 Session Refresh Initiated: Access token expired.');
                
                // Attempt to refresh the session
                const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh-token`, { credentials: 'include' });
                
                if (refreshRes.ok) {
                    const refreshData = await refreshRes.json();
                    const newToken = refreshData.csrfToken;
                    
                    // Re-try the original request with the new CSRF token
                    const retryOptions = {
                        ...defaultOptions,
                        headers: {
                            ...defaultOptions.headers,
                            'x-csrf-token': newToken
                        }
                    };
                    return await fetch(url, retryOptions);
                } else {
                    // Refresh failed - trigger global kickout
                    window.dispatchEvent(new CustomEvent('unauthorized-kickout'));
                    return response;
                }
            }
        }

        // ─── 403 CSRF MISMATCH: ATTEMPT SYNC ───
        if (response.status === 403) {
            const data = await response.clone().json();
            // If the backend specifically says session is out of sync
            if (data.error && data.error.includes('sync')) {
                 console.warn('📡 Security Sync: CSRF mismatch detected. Synchronizing...');
                 // Most likely the user has multiple tabs or session was silent-refreshed elsewhere
                 // We trigger a refresh to get the latest token and tell the user to retry
                 await fetch(`${BASE_URL}/api/auth/refresh-token`, { credentials: 'include' });
                 return response; 
            }
        }

        return response;
    } catch (err) {
        console.error('Critical Uplink Failure:', err);
        throw err;
    }
};
