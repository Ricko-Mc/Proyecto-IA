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

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
    return requestAPI<RespuestaSignos>('get', '/signos');
  },

  obtenerCategorias: async (): Promise<RespuestaCategorias> => {
    return requestAPI<RespuestaCategorias>('get', '/categorias');
  },

  obtenerSignosPorCategoria: async (categoria: string): Promise<RespuestaPorCategoria> => {
    return requestAPI<RespuestaPorCategoria>(
      'get',
      `/categorias/${encodeURIComponent(categoria)}`
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

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return requestAPI<AuthResponse>('post', '/auth/login', data);
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    return requestAPI<AuthResponse>('post', '/auth/register', data);
  },

  loginGoogle: async (): Promise<{ url: string }> => {
    return requestAPI<{ url: string }>('get', '/auth/google');
  },

  perfil: async (): Promise<AuthResponse> => {
    return requestAPI<AuthResponse>('get', '/auth/me');
  },

  crearReporte: async (data: CrearReporteRequest): Promise<Reporte> => {
    return requestAPI<Reporte>('post', '/reportes', data);
  },

  listarReportes: async (estado?: string): Promise<Reporte[]> => {
    const suffix = estado ? `?estado=${encodeURIComponent(estado)}` : '';
    return requestAPI<Reporte[]>('get', `/reportes${suffix}`);
  },

  actualizarReporte: async (reporteId: string, data: ActualizarReporteRequest): Promise<Reporte> => {
    return requestAPI<Reporte>('patch', `/reportes/${encodeURIComponent(reporteId)}`, data);
  },

  listarRolesSistema: async (): Promise<RolSistema[]> => {
    return requestAPI<RolSistema[]>('get', '/admin/usuarios/roles');
  },

  listarUsuariosAdmin: async (email?: string): Promise<UsuarioAdmin[]> => {
    const suffix = email ? `?email=${encodeURIComponent(email)}` : '';
    return requestAPI<UsuarioAdmin[]>('get', `/admin/usuarios${suffix}`);
  },

  crearUsuarioAdmin: async (data: CrearUsuarioAdminRequest): Promise<UsuarioAdmin> => {
    return requestAPI<UsuarioAdmin>('post', '/admin/usuarios', data);
  },

  asignarRolUsuario: async (data: AsignarRolUsuarioRequest): Promise<UsuarioAdmin> => {
    return requestAPI<UsuarioAdmin>('patch', '/admin/usuarios/rol', data);
  },
};
