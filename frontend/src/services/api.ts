import axios from 'axios';
import {
  RespuestaChat,
  RespuestaSignos,
  RespuestaCategorias,
  RespuestaPorCategoria,
  BusquedaSigno,
  HealthCheck,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const clienteApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    return requestAPI<RespuestaChat>('post', '/api/chat', {
      mensaje,
      conversacion_id: conversacion_id || null,
      clave_desambiguacion: clave_desambiguacion || null,
    });
  },

  obtenerTodosLosSignos: async (): Promise<RespuestaSignos> => {
    return requestAPI<RespuestaSignos>('get', '/api/signos');
  },

  obtenerCategorias: async (): Promise<RespuestaCategorias> => {
    return requestAPI<RespuestaCategorias>('get', '/api/categorias');
  },

  obtenerSignosPorCategoria: async (categoria: string): Promise<RespuestaPorCategoria> => {
    return requestAPI<RespuestaPorCategoria>(
      'get',
      `/api/categorias/${encodeURIComponent(categoria)}`
    );
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
};
