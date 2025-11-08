// Ruta: frontend/src/lib/api.ts (COMPLETO Y CORREGIDO)

import axios from 'axios';

// 1. Lee la variable de entorno (ej. "/api" en producción)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * 2. ¡FUNCIÓN CORREGIDA!
 * Determina el origen (http://...) de la API de forma segura.
 */
function getApiOrigin(baseUrl: string): string {
  if (baseUrl.startsWith('http')) {
    // Si es una URL completa (ej. http://localhost:8080/api), extrae el origen.
    return new URL(baseUrl).origin;
  }
  // Si es una ruta relativa (ej. /api), usa el origen actual del frontend.
  // En tu caso de Docker, esto será "http://localhost:8081"
  return window.location.origin; 
}

// 3. Exporta las constantes que tus componentes necesitan
export const API_ORIGIN = getApiOrigin(API_BASE_URL);
export const API_URL = API_BASE_URL;

// 4. Crea la instancia de Axios
const api = axios.create({
  baseURL: API_URL, // Usa la URL base (ej. /api)
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ¡Correcto!
});

// 5. Tu interceptor (Perfecto, se queda igual)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('cognito:unauthorized'));
    }
    return Promise.reject(error);
  }
);

// 6. Tu función de logout (Perfecta, se queda igual)
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