export const setupApiInterceptor = () => {
  const originalFetch = window.fetch;
  let isRefreshing = false;
  let refreshSubscribers = [];

  const onRefreshed = (isSuccess) => {
    refreshSubscribers.forEach((cb) => cb(isSuccess));
    refreshSubscribers = [];
  };

  window.fetch = async (...args) => {
    const url = typeof args[0] === 'string' ? args[0] : args[0].url;
    const response = await originalFetch(...args);

    // If a request hits a 401 (Unauthorized) or 403 (Forbidden/CSRF Mismatch), 
    // we attempt to silently refresh the session.
    if (
      (response.status !== 401 && response.status !== 403) ||
      url.includes("/api/auth/refresh-token") ||
      url.includes("/api/auth/login") ||
      url.includes("/api/auth/signup") ||
      url.includes("/api/auth/google") ||
      url.includes("/api/auth/profile") ||
      url.includes("/api/auth/logout")
    ) {
      return response;
    }

    // We hit an unauthorized endpoint.
    // If a refresh is already in progress, queue this request.
    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshSubscribers.push((isSuccess) => {
          if (isSuccess) {
            resolve(originalFetch(...args)); // Retry with new session
          } else {
            resolve(response); // Return original 401
          }
        });
      });
    }

    isRefreshing = true;

    try {
      // Attempt to refresh the session
      const refreshRes = await originalFetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh-token`, {
        method: "GET",
        credentials: "include"
      });

      if (refreshRes.ok) {
        // Success! The backend gave us a new access token cookie.
        isRefreshing = false;
        onRefreshed(true);
        // Retry the original request that failed
        return originalFetch(...args);
      } else {
        // Refresh token is expired or invalid. Hard kickout.
        isRefreshing = false;
        onRefreshed(false);
        // Dispatch custom event to notify React app
        window.dispatchEvent(new CustomEvent('unauthorized-kickout'));
        return response;
      }
    } catch (err) {
      // Network failure during refresh
      isRefreshing = false;
      onRefreshed(false);
      window.dispatchEvent(new CustomEvent('unauthorized-kickout'));
      return response;
    }
  };
};
