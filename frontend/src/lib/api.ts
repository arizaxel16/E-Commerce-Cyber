import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * Interceptor: in production we might use Firebase or an auth provider.
 * For now the instance will pick Authorization header from defaults (set by AuthContext).
 * Keep this minimal so components do the actual calls (commented) and handle mocks themselves.
 */
api.interceptors.request.use(
    (config) => {
        // NOTE: AuthContext will set api.defaults.headers.common.Authorization when token changes.
        // This interceptor intentionally stays minimal for future extensibility.
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
