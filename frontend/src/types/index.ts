export interface OpcionDesambiguacion {
  label: string;
  clave: string;
}

export interface RespuestaChat {
  tipo_respuesta: 'video' | 'desambiguacion' | 'no_encontrado' | 'error_backend';
  mensaje_usuario: string;
  conversacion_id: string;
  palabra_clave: string;
  signo_encontrado: boolean;
  signo_id: string | null;
  url_video: string | null;
  categoria: string | null;
  respuesta_ia: string;
  opciones?: OpcionDesambiguacion[] | null;
  error?: string;
}

export interface Signo {
  palabra: string;
  categoria: string;
  signo_id: string;
  url_video?: string;
}

export interface RespuestaSignos {
  total: number;
  signos: Signo[];
}

export interface RespuestaCategorias {
  categorias: string[];
}

export interface RespuestaPorCategoria {
  categoria: string;
  total: number;
  signos: Signo[];
}

export interface BusquedaSigno {
  palabra: string;
  encontrado: boolean;
  signo_id: string | null;
  categoria: string | null;
  url_video: string | null;
}

export interface HealthCheck {
  status: string;
  proyecto: string;
  version: string;
  prolog_disponible: boolean;
  ia_disponible: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre_completo: string;
  email: string;
  password: string;
  confirmar_password: string;
}

export interface AuthResponse {
  usuario_id: string;
  email: string;
  nombre_completo: string;
  avatar_url: string | null;
  access_token: string;
  proveedor: string;
  roles: string[];
}

export interface Reporte {
  id: string;
  signo_id: string;
  motivo: string;
  estado: string;
  created_at: string;
}

export interface CrearReporteRequest {
  signo_id: string;
  motivo: string;
  descripcion?: string | null;
}

export interface ActualizarReporteRequest {
  estado: string;
}

export interface RolSistema {
  id: number;
  nombre: string;
  descripcion?: string | null;
}

export interface UsuarioAdmin {
  id: string;
  email: string;
  nombre_completo: string;
  rol: string;
  created_at?: string | null;
  last_seen?: string | null;
}

export interface CrearUsuarioAdminRequest {
  nombre_completo: string;
  email: string;
  password: string;
  rol: string;
}

export interface AsignarRolUsuarioRequest {
  email: string;
  rol: string;
}
