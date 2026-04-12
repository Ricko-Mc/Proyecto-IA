from datetime import datetime, timezone
from typing import Any, Optional
import importlib

from src.config.configuracion import configuracion

SUPABASE_CLIENT: Optional[Any] = None
if configuracion.SUPABASE_URL.strip() and configuracion.SUPABASE_KEY.strip():
    try:
        modulo_supabase = importlib.import_module("supabase")
        create_client = getattr(modulo_supabase, "create_client")
        modulo_sync = importlib.import_module("supabase._sync.client")
        supabase_exception = getattr(modulo_sync, "SupabaseException")
    except (ImportError, AttributeError):
        SUPABASE_CLIENT = None
    else:
        try:
            SUPABASE_CLIENT = create_client(configuracion.SUPABASE_URL, configuracion.SUPABASE_KEY)
        except supabase_exception:
            SUPABASE_CLIENT = None

def obtener_cliente_supabase() -> Optional[Any]:
    return SUPABASE_CLIENT

def _cliente_requerido() -> Any:
    if SUPABASE_CLIENT is None:
        raise RuntimeError("Supabase no esta disponible, revisa URL y API key")
    return SUPABASE_CLIENT

def crear_conversacion(usuario_id: str, titulo: str | None) -> dict:
    cliente = _cliente_requerido()
    payload = {"usuario_id": usuario_id, "titulo": titulo}
    respuesta = cliente.table("conversacion").insert(payload).execute()
    return (respuesta.data or [{}])[0]

def guardar_mensaje(
    conversacion_id: str,
    rol: str,
    contenido: str,
    palabra_clave: str | None,
    signo_id: str | None,
    url_video: str | None,
) -> dict:
    cliente = _cliente_requerido()
    payload = {
        "conversacion_id": conversacion_id,
        "rol": rol,
        "contenido": contenido,
        "palabra_clave": palabra_clave,
        "signo_id": signo_id,
        "url_video": url_video,
    }
    respuesta = cliente.table("mensaje").insert(payload).execute()
    return (respuesta.data or [{}])[0]

def registrar_bitacora(usuario_id: str | None, accion: str, detalle: str | None, ip: str | None) -> None:
    cliente = _cliente_requerido()
    payload = {
        "usuario_id": usuario_id,
        "accion": accion,
        "detalle": detalle,
        "ip": ip,
    }
    cliente.table("bitacora").insert(payload).execute()

def agregar_favorito(usuario_id: str, signo_id: str, palabra: str | None, categoria: str | None) -> dict:
    cliente = _cliente_requerido()
    payload = {
        "usuario_id": usuario_id,
        "signo_id": signo_id,
        "palabra": palabra,
        "categoria": categoria,
    }
    respuesta = cliente.table("favorito").insert(payload).execute()
    return (respuesta.data or [{}])[0]

def eliminar_favorito(usuario_id: str, signo_id: str) -> None:
    cliente = _cliente_requerido()
    cliente.table("favorito").delete().eq("usuario_id", usuario_id).eq("signo_id", signo_id).execute()

def obtener_favoritos(usuario_id: str) -> list[dict]:
    cliente = _cliente_requerido()
    respuesta = (
        cliente.table("favorito")
        .select("id, signo_id, palabra, categoria, created_at")
        .eq("usuario_id", usuario_id)
        .order("created_at", desc=True)
        .execute()
    )
    return respuesta.data or []

def crear_reporte(usuario_id: str, signo_id: str, motivo: str, descripcion: str | None) -> dict:
    cliente = _cliente_requerido()
    payload = {
        "usuario_id": usuario_id,
        "signo_id": signo_id,
        "motivo": motivo,
        "descripcion": descripcion,
    }
    respuesta = cliente.table("reporte").insert(payload).execute()
    return (respuesta.data or [{}])[0]

def actualizar_estado_reporte(reporte_id: str, estado: str) -> dict:
    cliente = _cliente_requerido()
    respuesta = cliente.table("reporte").update({"estado": estado}).eq("id", reporte_id).execute()
    return (respuesta.data or [{}])[0]

def obtener_reportes(estado: str | None) -> list[dict]:
    cliente = _cliente_requerido()
    consulta = cliente.table("reporte").select("id, signo_id, motivo, estado, created_at, usuario_id")
    if estado:
        consulta = consulta.eq("estado", estado)
    respuesta = consulta.order("created_at", desc=True).execute()
    return respuesta.data or []

def actualizar_estadisticas_signo(signo_id: str, palabra: str | None, categoria: str | None) -> dict:
    cliente = _cliente_requerido()
    actual = (
        cliente.table("estadistica_signo")
        .select("id, total_busquedas")
        .eq("signo_id", signo_id)
        .limit(1)
        .execute()
    )
    ahora = datetime.now(timezone.utc).isoformat()
    if actual.data:
        fila = actual.data[0]
        nuevos_busquedas = int(fila.get("total_busquedas") or 0) + 1
        respuesta = (
            cliente.table("estadistica_signo")
            .update(
                {
                    "palabra": palabra,
                    "categoria": categoria,
                    "total_busquedas": nuevos_busquedas,
                    "ultima_busqueda": ahora,
                }
            )
            .eq("id", fila["id"])
            .execute()
        )
        return (respuesta.data or [{}])[0]

    respuesta = (
        cliente.table("estadistica_signo")
        .insert(
            {
                "signo_id": signo_id,
                "palabra": palabra,
                "categoria": categoria,
                "total_busquedas": 1,
                "ultima_busqueda": ahora,
            }
        )
        .execute()
    )
    return (respuesta.data or [{}])[0]

def actualizar_estadisticas_usuario(usuario_id: str) -> dict:
    cliente = _cliente_requerido()

    total_conversaciones = (
        cliente.table("conversacion")
        .select("id", count="exact")
        .eq("usuario_id", usuario_id)
        .execute()
    )
    total_mensajes = (
        cliente.table("mensaje")
        .select("id, conversacion!inner(usuario_id)", count="exact")
        .eq("conversacion.usuario_id", usuario_id)
        .execute()
    )
    total_favoritos = (
        cliente.table("favorito")
        .select("id", count="exact")
        .eq("usuario_id", usuario_id)
        .execute()
    )

    payload = {
        "usuario_id": usuario_id,
        "total_conversaciones": total_conversaciones.count or 0,
        "total_mensajes": total_mensajes.count or 0,
        "total_favoritos": total_favoritos.count or 0,
        "ultima_actividad": datetime.now(timezone.utc).isoformat(),
    }
    respuesta = cliente.table("estadistica_usuario").upsert(payload, on_conflict="usuario_id").execute()
    return (respuesta.data or [{}])[0]

def obtener_roles_usuario(usuario_id: str) -> list[str]:
    cliente = _cliente_requerido()
    respuesta = (
        cliente.table("usuario")
        .select("rol(nombre)")
        .eq("id", usuario_id)
        .limit(1)
        .execute()
    )
    filas = respuesta.data or []
    roles: list[str] = []
    for fila in filas:
        rol = fila.get("rol")
        if isinstance(rol, dict) and rol.get("nombre"):
            roles.append(rol["nombre"])
    return roles
