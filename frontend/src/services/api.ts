import axios from 'axios';
import {
  RespuestaChat,
  RespuestaSignos,
  RespuestaCategorias,
  RespuestaPorCategoria,
  BusquedaSigno,
  HealthCheck,
} from '../types';

const rawApiUrl = import.meta.env.VITE_API_URL;
const API_BASE_URL = rawApiUrl
  ? `${rawApiUrl.replace(/\/+$|\/api$/g, '').replace(/\/api$/, '')}/api`
  : '/api';

const clienteApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const cache: Record<string, any> = {};
const categoryCache: Record<string, any> = {};
const pendingRequests: Record<string, Promise<any> | undefined> = {};

async function requestAPI<T>(
  method: 'get' | 'post' | 'delete' | 'patch',
  endpoint: string,
  data?: unknown
): Promise<T> {
  try {
    const respuesta = await clienteApi.request<T>({
      method,
      url: endpoint,
      data,
    });
    return respuesta.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const detalle =
        (error.response?.data as { detail?: string } | undefined)?.detail ||
        error.message ||
        `Error HTTP ${error.response?.status || ''}`;
      throw new Error(detalle);
    }
    throw new Error('Error inesperado de red');
  }
}

export const api = {
  chat: async (
    mensaje: string,
    conversacion_id?: string,
    clave_desambiguacion?: string
  ): Promise<RespuestaChat> => {
    return requestAPI<RespuestaChat>('post', '/chat', {
      mensaje,
      conversacion_id: conversacion_id || null,
      clave_desambiguacion: clave_desambiguacion || null,
    });
  },

  obtenerTodosLosSignos: async (): Promise<RespuestaSignos> => {
    const cacheKey = '/signos';
    if (cache[cacheKey]) {
      return cache[cacheKey];
    }
    if (pendingRequests[cacheKey]) {
      return pendingRequests[cacheKey];
    }
    pendingRequests[cacheKey] = requestAPI<RespuestaSignos>('get', cacheKey)
      .then((resultado) => {
        cache[cacheKey] = resultado;
        delete pendingRequests[cacheKey];
        return resultado;
      })
      .catch((error) => {
        delete pendingRequests[cacheKey];
        throw error;
      });
    return pendingRequests[cacheKey];
  },

  obtenerCategorias: async (): Promise<RespuestaCategorias> => {
    const cacheKey = '/categorias';
    if (cache[cacheKey]) {
      return cache[cacheKey];
    }
    if (pendingRequests[cacheKey]) {
      return pendingRequests[cacheKey];
    }
    pendingRequests[cacheKey] = requestAPI<RespuestaCategorias>('get', cacheKey)
      .then((resultado) => {
        cache[cacheKey] = resultado;
        delete pendingRequests[cacheKey];
        return resultado;
      })
      .catch((error) => {
        delete pendingRequests[cacheKey];
        throw error;
      });
    return pendingRequests[cacheKey];
  },

  obtenerSignosPorCategoria: async (categoria: string): Promise<RespuestaPorCategoria> => {
    const cacheKey = categoria;
    if (categoryCache[cacheKey]) {
      return categoryCache[cacheKey];
    }
    if (pendingRequests[cacheKey]) {
      return pendingRequests[cacheKey];
    }
    pendingRequests[cacheKey] = requestAPI<RespuestaPorCategoria>(
      'get',
      `/categorias/${encodeURIComponent(categoria)}`
    )
      .then((resultado) => {
        categoryCache[cacheKey] = resultado;
        delete pendingRequests[cacheKey];
        return resultado;
      })
      .catch((error) => {
        delete pendingRequests[cacheKey];
        throw error;
      });
    return pendingRequests[cacheKey];
  },

  buscarSigno: async (palabra: string): Promise<BusquedaSigno> => {
    return requestAPI<BusquedaSigno>(
      'get',
      `/signo/${encodeURIComponent(palabra)}`
    );
  },

  verificarSalud: async (): Promise<HealthCheck> => {
    return requestAPI<HealthCheck>('get', '/health');
  },
  // juego de memoria

  obtenerParesMemoria: async (categoria: string): Promise<any[]> => {
    return requestAPI<any[]>(
      'get',
      `/memoria-pares?categoria=${encodeURIComponent(categoria)}`
    );
  },
};
