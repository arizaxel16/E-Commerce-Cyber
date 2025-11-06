// src/lib/api.ts
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    // withCredentials: false // keep default
});

/**
 * Request interceptor: always read token from localStorage and attach.
 * This keeps things simple and works across components without Context.
 */
api.interceptors.request.use((config) => {
    try {
        const token = localStorage.getItem("cognito_token");
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        } else if (config.headers) {
            delete config.headers.Authorization;
        }
    } catch (e) {
        // ignore localStorage errors in dev
    }
    return config;
}, (err) => Promise.reject(err));

/**
 * Optional: a simple response interceptor that triggers a logout-like event
 * when the backend returns 401. Components can listen for this event if desired.
 */
api.interceptors.response.use(
    r => r,
    (error) => {
        if (error?.response?.status === 401) {
            // broadcast a global event (optional, simple)
            window.dispatchEvent(new CustomEvent("cognito:unauthorized"));
        }
        return Promise.reject(error);
    }
);

/** Helpers to set/clear token from app code */
export function setToken(token: string | null) {
    try {
        if (token) {
            localStorage.setItem("cognito_token", token);
            api.defaults.headers.common.Authorization = `Bearer ${token}`;
        } else {
            localStorage.removeItem("cognito_token");
            delete api.defaults.headers.common.Authorization;
        }
    } catch (e) {
        // ignore
    }
}

export function getToken(): string | null {
    try {
        return localStorage.getItem("cognito_token");
    } catch {
        return null;
    }
}

export function clearToken() {
    setToken(null);
}

export default api;
