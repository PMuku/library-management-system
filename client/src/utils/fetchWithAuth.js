const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const fetchWithAuth = async (url, options = {}) => {
    const accessToken = localStorage.getItem("access_token");

    // Clone options and inject Authorization header
    const opts = {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": options.body ? "application/json" : undefined,
        },
    };

    let res = await fetch(url, opts);

    if (res.status === 401) {
        // Try refreshing the token
        const refreshToken = localStorage.getItem("refresh_token");
        const refreshRes = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshRes.ok) {
            const data = await refreshRes.json();
            localStorage.setItem("access_token", data.access_token);

            // Retry original request with new token
            const retryOpts = {
                ...options,
                headers: {
                    ...(options.headers || {}),
                    Authorization: `Bearer ${data.access_token}`,
                    "Content-Type": options.body ? "application/json" : undefined,
                },
            };

            res = await fetch(url, retryOpts);
        } else {
            // Refresh failed – logout
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.reload(); // or redirect to login
            return null;
        }
    }

    return res;
};

export default fetchWithAuth;
