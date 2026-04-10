import axios from 'axios';
import {
  RespuestaChat,
  RespuestaSignos,
  RespuestaCategorias,
  RespuestaPorCategoria,
  BusquedaSigno,
  HealthCheck,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  Reporte,
  CrearReporteRequest,
  ActualizarReporteRequest,
  RolSistema,
  UsuarioAdmin,
  CrearUsuarioAdminRequest,
  AsignarRolUsuarioRequest,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const clienteApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

clienteApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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
  chat: async (mensaje: string, conversacion_id?: string): Promise<RespuestaChat> => {
    return requestAPI<RespuestaChat>('post', '/api/chat', {
      mensaje,
      conversacion_id: conversacion_id || null,
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
      `/api/signo/${encodeURIComponent(palabra)}`
    );
  },

  verificarSalud: async (): Promise<HealthCheck> => {
    return requestAPI<HealthCheck>('get', '/api/health');
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return requestAPI<AuthResponse>('post', '/api/auth/login', data);
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    return requestAPI<AuthResponse>('post', '/api/auth/register', data);
  },

  loginGoogle: async (): Promise<{ url: string }> => {
    return requestAPI<{ url: string }>('get', '/api/auth/google');
  },

  perfil: async (): Promise<AuthResponse> => {
    return requestAPI<AuthResponse>('get', '/api/auth/me');
  },

  crearReporte: async (data: CrearReporteRequest): Promise<Reporte> => {
    return requestAPI<Reporte>('post', '/api/reportes', data);
  },

  listarReportes: async (estado?: string): Promise<Reporte[]> => {
    const suffix = estado ? `?estado=${encodeURIComponent(estado)}` : '';
    return requestAPI<Reporte[]>('get', `/api/reportes${suffix}`);
  },

  actualizarReporte: async (reporteId: string, data: ActualizarReporteRequest): Promise<Reporte> => {
    return requestAPI<Reporte>('patch', `/api/reportes/${encodeURIComponent(reporteId)}`, data);
  },

  listarRolesSistema: async (): Promise<RolSistema[]> => {
    return requestAPI<RolSistema[]>('get', '/api/admin/usuarios/roles');
  },

  listarUsuariosAdmin: async (email?: string): Promise<UsuarioAdmin[]> => {
    const suffix = email ? `?email=${encodeURIComponent(email)}` : '';
    return requestAPI<UsuarioAdmin[]>('get', `/api/admin/usuarios${suffix}`);
  },

  crearUsuarioAdmin: async (data: CrearUsuarioAdminRequest): Promise<UsuarioAdmin> => {
    return requestAPI<UsuarioAdmin>('post', '/api/admin/usuarios', data);
  },

  asignarRolUsuario: async (data: AsignarRolUsuarioRequest): Promise<UsuarioAdmin> => {
    return requestAPI<UsuarioAdmin>('patch', '/api/admin/usuarios/rol', data);
  },
};
