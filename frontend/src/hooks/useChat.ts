import { useState, useCallback } from 'react';
import { api } from '../services/api';
import { RespuestaChat } from '../types';

export interface MensajeChat {
  id: string;
  tipo: 'usuario' | 'asistente';
  contenido: string;
  timestamp: Date;
  datosChat?: RespuestaChat;
}

interface EstadoChat {
  mensajes: MensajeChat[];
  cargando: boolean;
  error: string | null;
  respuestaActual: RespuestaChat | null;
}

export const useChat = () => {
  const [estado, setEstado] = useState<EstadoChat>({
    mensajes: [],
    cargando: false,
    error: null,
    respuestaActual: null,
  });

  const enviarMensaje = useCallback(async (mensaje: string) => {
    if (!mensaje.trim()) {
      setEstado((prev) => ({
        ...prev,
        error: 'El mensaje no puede estar vacío',
      }));
      return;
    }

    const idMensajeUsuario = `msg-${Date.now()}`;
    setEstado((prev) => ({
      ...prev,
      mensajes: [
        ...prev.mensajes,
        {
          id: idMensajeUsuario,
          tipo: 'usuario',
          contenido: mensaje,
          timestamp: new Date(),
        },
      ],
      cargando: true,
      error: null,
    }));

    try {
      const respuesta = await api.chat(mensaje);

      setEstado((prev) => ({
        ...prev,
        respuestaActual: respuesta,
        mensajes: [
          ...prev.mensajes,
          {
            id: `msg-${Date.now()}`,
            tipo: 'asistente',
            contenido: respuesta.respuesta_ia,
            timestamp: new Date(),
            datosChat: respuesta,
          },
        ],
        cargando: false,
        error: null,
      }));
    } catch (error) {
      const mensajeError = error instanceof Error ? error.message : 'Error desconocido';
      setEstado((prev) => ({
        ...prev,
        cargando: false,
        error: mensajeError,
      }));
    }
  }, []);

  const limpiarChat = useCallback(() => {
    setEstado({
      mensajes: [],
      cargando: false,
      error: null,
      respuestaActual: null,
    });
  }, []);

  const limpiarError = useCallback(() => {
    setEstado((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    mensajes: estado.mensajes,
    cargando: estado.cargando,
    error: estado.error,
    respuestaActual: estado.respuestaActual,
    enviarMensaje,
    limpiarChat,
    limpiarError,
  };
};
