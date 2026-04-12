from fastapi import HTTPException

from src.modulos.auth.servicio import validar_roles
from src.modulos.reportes.esquemas import ActualizarReporteRequest, ReporteRequest
from src.utilidades.supabase_client import (
    actualizar_estado_reporte,
    crear_reporte,
    obtener_reportes,
    registrar_bitacora,
)

class ServicioReportes:
    def crear_reporte(self, usuario_id: str, data: ReporteRequest, ip: str | None) -> dict:
        try:
            reporte = crear_reporte(usuario_id, data.signo_id, data.motivo, data.descripcion)
            registrar_bitacora(usuario_id, "crear_reporte", f"Se reporto signo {data.signo_id}", ip)
            return reporte
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"No se pudo crear el reporte: {exc}") from exc

    def obtener_reportes(self, roles_usuario: list[str], estado: str | None) -> list[dict]:
        validar_roles(roles_usuario, ["admin", "moderador"])
        try:
            return obtener_reportes(estado)
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"No se pudieron leer reportes: {exc}") from exc

    def actualizar_reporte(
        self,
        usuario_id: str,
        roles_usuario: list[str],
        reporte_id: str,
        data: ActualizarReporteRequest,
        ip: str | None,
    ) -> dict:
        validar_roles(roles_usuario, ["admin", "moderador"])
        try:
            actualizado = actualizar_estado_reporte(reporte_id, data.estado)
            registrar_bitacora(usuario_id, "actualizar_reporte", f"Reporte {reporte_id} a {data.estado}", ip)
            return actualizado
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"No se pudo actualizar el reporte: {exc}") from exc
