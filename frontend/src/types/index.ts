export interface RespuestaChat {
  mensaje_usuario: string;
  conversacion_id: string;
  palabra_clave: string;
  signo_encontrado: boolean;
  signo_id: string | null;
  url_video: string | null;
  categoria: string | null;
  respuesta_ia: string;
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
  gcs_disponible: boolean;
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
