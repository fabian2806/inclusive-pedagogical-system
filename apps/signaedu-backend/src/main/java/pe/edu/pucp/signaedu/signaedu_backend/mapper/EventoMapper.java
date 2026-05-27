package pe.edu.pucp.signaedu.signaedu_backend.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.AlumnoBasicoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.EventoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.EventoUsuarioResponse;
import pe.edu.pucp.signaedu.signaedu_backend.model.Alumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.Evento;
import pe.edu.pucp.signaedu.signaedu_backend.model.EventoUsuario;

import java.util.Comparator;
import java.util.List;

@Component
@RequiredArgsConstructor
public class EventoMapper {

    private final UsuarioMapper usuarioMapper;

    /**
     * Construye el response del evento. Si {@code esCreador} es true, se
     * incluye {@code motivoRechazo} de cada invitado; en caso contrario se
     * omite (privacidad: solo el creador ve por que un invitado rechazo).
     */
    public EventoResponse toResponse(Evento evento, boolean esCreador) {
        List<EventoUsuarioResponse> invitados = evento.getInvitados().stream()
                .sorted(Comparator.comparing(EventoUsuario::getId))
                .map(inv -> toInvitadoResponse(inv, esCreador))
                .toList();

        return EventoResponse.builder()
                .id(evento.getId())
                .titulo(evento.getTitulo())
                .descripcion(evento.getDescripcion())
                .fechaInicio(evento.getFechaInicio())
                .fechaFin(evento.getFechaFin())
                .tipoEvento(evento.getTipoEvento().name())
                .modalidad(evento.getModalidad().name())
                .ubicacion(evento.getUbicacion())
                .estado(evento.getEstado().name())
                .motivoCancelacion(evento.getMotivoCancelacion())
                .alumno(toAlumnoBasico(evento.getAlumno()))
                .usuarioCreador(usuarioMapper.toBitacoraResponse(evento.getUsuarioCreador()))
                .fechaCreacion(evento.getFechaCreacion())
                .fechaActualizacion(evento.getFechaActualizacion())
                .invitados(invitados)
                .build();
    }

    private EventoUsuarioResponse toInvitadoResponse(EventoUsuario inv, boolean esCreador) {
        return EventoUsuarioResponse.builder()
                .id(inv.getId())
                .usuario(usuarioMapper.toBitacoraResponse(inv.getUsuario()))
                .estadoAsistencia(inv.getEstadoAsistencia().name())
                .fechaRespuesta(inv.getFechaRespuesta())
                .motivoRechazo(esCreador ? inv.getMotivoRechazo() : null)
                .build();
    }

    private AlumnoBasicoResponse toAlumnoBasico(Alumno alumno) {
        return AlumnoBasicoResponse.builder()
                .id(alumno.getId())
                .nombre(alumno.getNombre())
                .apellido(alumno.getApellido())
                .grado(alumno.getGrado())
                .seccion(alumno.getSeccion())
                .build();
    }
}
