// src/lib/api.ts
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'; //borrar el http directo

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401) {
        window.dispatchEvent(new CustomEvent('cognito:unauthorized'));
      }
      return Promise.reject(error);
    }
  );

  export async function logoutUser() {
    try {
      await api.post('/auth/logout');
      window.dispatchEvent(new CustomEvent('cognito:unauthorized'));
    } catch (error) {
      console.error('Error durante el logout:', error);

      window.dispatchEvent(new CustomEvent('cognito:unauthorized'));
    }
  }

export default api;
