import {
  RespuestaChat,
  RespuestaSignos,
  RespuestaCategorias,
  RespuestaPorCategoria,
  BusquedaSigno,
  HealthCheck,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_VERSION = 'v1';

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  chat: async (mensaje: string): Promise<RespuestaChat> => {
    return fetchAPI<RespuestaChat>(`/api/${API_VERSION}/chat`, {
      method: 'POST',
      body: JSON.stringify({ mensaje }),
    });
  },

  obtenerTodosLosSignos: async (): Promise<RespuestaSignos> => {
    return fetchAPI<RespuestaSignos>(`/api/${API_VERSION}/signos`);
  },

  obtenerCategorias: async (): Promise<RespuestaCategorias> => {
    return fetchAPI<RespuestaCategorias>(`/api/${API_VERSION}/categorias`);
  },

  obtenerSignosPorCategoria: async (categoria: string): Promise<RespuestaPorCategoria> => {
    return fetchAPI<RespuestaPorCategoria>(
      `/api/${API_VERSION}/categorias/${encodeURIComponent(categoria)}`
    );
  },

  buscarSigno: async (palabra: string): Promise<BusquedaSigno> => {
    return fetchAPI<BusquedaSigno>(
      `/api/${API_VERSION}/signo/${encodeURIComponent(palabra)}`
    );
  },

  verificarSalud: async (): Promise<HealthCheck> => {
    return fetchAPI<HealthCheck>('/api/health');
  },
};
