package pe.edu.pucp.signaedu.signaedu_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.ResponderAsistenciaRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.EventoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.exception.IllegalOperationException;
import pe.edu.pucp.signaedu.signaedu_backend.exception.ResourceNotFoundException;
import pe.edu.pucp.signaedu.signaedu_backend.mapper.EventoMapper;
import pe.edu.pucp.signaedu.signaedu_backend.model.Evento;
import pe.edu.pucp.signaedu.signaedu_backend.model.EventoUsuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoAsistencia;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoEvento;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoNotificacion;
import pe.edu.pucp.signaedu.signaedu_backend.repository.EventoUsuarioRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.UsuarioRepository;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EventoUsuarioService {

    private final EventoUsuarioRepository eventoUsuarioRepository;
    private final UsuarioRepository usuarioRepository;
    private final EventoMapper eventoMapper;
    private final NotificacionService notificacionService;

    @Transactional
    public EventoResponse responder(Long eventoId, ResponderAsistenciaRequest request) {
        Usuario usuario = obtenerUsuarioAutenticado();

        EventoUsuario relacion = eventoUsuarioRepository
                .findByEventoIdAndUsuarioId(eventoId, usuario.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "EventoUsuario", "eventoId+usuarioId", eventoId + "+" + usuario.getId()));

        Evento evento = relacion.getEvento();

        if (evento.getEstado() != EstadoEvento.ACTIVO) {
            throw new IllegalOperationException(
                    "Solo se puede responder asistencia a eventos en estado ACTIVO");
        }
        if (LocalDateTime.now().isAfter(evento.getFechaInicio())) {
            throw new IllegalOperationException(
                    "No se puede responder asistencia despues del inicio del evento");
        }
        if (request.getEstadoAsistencia() == EstadoAsistencia.PENDIENTE) {
            throw new IllegalOperationException(
                    "La respuesta debe ser CONFIRMADO o RECHAZADO");
        }
        if (request.getEstadoAsistencia() != EstadoAsistencia.RECHAZADO
                && request.getMotivoRechazo() != null && !request.getMotivoRechazo().isBlank()) {
            throw new IllegalOperationException(
                    "El motivo de rechazo solo aplica cuando el estado es RECHAZADO");
        }

        EstadoAsistencia estadoAnterior = relacion.getEstadoAsistencia();

        relacion.setEstadoAsistencia(request.getEstadoAsistencia());
        relacion.setFechaRespuesta(LocalDateTime.now());
        relacion.setMotivoRechazo(
                request.getEstadoAsistencia() == EstadoAsistencia.RECHAZADO
                        ? request.getMotivoRechazo()
                        : null);

        // Notifica al creador del evento. Mensaje especifico si el invitado
        // venia de un CONFIRMADO previo y ahora rechaza (cambio relevante para
        // que el creador reaccione).
        boolean cambioDeConfirmadoARechazado =
                estadoAnterior == EstadoAsistencia.CONFIRMADO
                        && request.getEstadoAsistencia() == EstadoAsistencia.RECHAZADO;
        notificacionService.crear(
                evento.getUsuarioCreador(),
                construirMensajeRespuesta(usuario, evento, request.getEstadoAsistencia(), cambioDeConfirmadoARechazado),
                TipoNotificacion.EVENTO,
                evento.getId(),
                usuario);

        // Reload de invitados via la relacion gestionada; el flush al cierre del @Transactional persiste el cambio.
        return eventoMapper.toResponse(evento, evento.getUsuarioCreador().getId().equals(usuario.getId()));
    }

    private String construirMensajeRespuesta(Usuario invitado,
                                             Evento evento,
                                             EstadoAsistencia nuevo,
                                             boolean cambioDeConfirmadoARechazado) {
        String nombre = invitado.getNombre() + " " + invitado.getApellido();
        String titulo = "\"" + evento.getTitulo() + "\"";
        if (cambioDeConfirmadoARechazado) {
            return nombre + " cambio su confirmacion a rechazo en el evento " + titulo;
        }
        return switch (nuevo) {
            case CONFIRMADO -> nombre + " confirmo asistencia al evento " + titulo;
            case RECHAZADO -> nombre + " rechazo la invitacion al evento " + titulo;
            default -> nombre + " actualizo su respuesta al evento " + titulo;
        };
    }

    private Usuario obtenerUsuarioAutenticado() {
        String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "correo", correo));
    }
}
