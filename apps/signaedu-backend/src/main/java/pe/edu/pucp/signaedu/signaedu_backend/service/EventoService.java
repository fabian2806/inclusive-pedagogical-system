package pe.edu.pucp.signaedu.signaedu_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.CancelarEventoRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.EventoCreateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.EventoUpdateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.InvitarUsuarioRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.EventoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.exception.IllegalOperationException;
import pe.edu.pucp.signaedu.signaedu_backend.exception.ResourceNotFoundException;
import pe.edu.pucp.signaedu.signaedu_backend.mapper.EventoMapper;
import pe.edu.pucp.signaedu.signaedu_backend.model.Alumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.Evento;
import pe.edu.pucp.signaedu.signaedu_backend.model.EventoUsuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoAsistencia;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoEvento;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoEvento;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;
import pe.edu.pucp.signaedu.signaedu_backend.repository.AlumnoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.EventoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.UsuarioRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.specs.EventoSpecs;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class EventoService {

    private final EventoRepository eventoRepository;
    private final AlumnoRepository alumnoRepository;
    private final UsuarioRepository usuarioRepository;
    private final EventoMapper eventoMapper;

    // ---------- Crear ----------

    @Transactional
    public EventoResponse crear(EventoCreateRequest request) {
        Usuario creador = obtenerUsuarioAutenticado();

        validarRangoFechas(request.getFechaInicio(), request.getFechaFin());

        Alumno alumno = alumnoRepository.findById(request.getAlumnoId())
                .orElseThrow(() -> new ResourceNotFoundException("Alumno", "id", request.getAlumnoId()));

        // Docente solo puede crear eventos para alumnos a su cargo. Admin (fallback) puede para cualquiera.
        if (esDocente(creador) && !alumnoRepository.existsByIdAndDocentesId(alumno.getId(), creador.getId())) {
            throw new AccessDeniedException("No tiene acceso al alumno con id " + alumno.getId());
        }

        Evento evento = Evento.builder()
                .titulo(request.getTitulo())
                .descripcion(request.getDescripcion())
                .fechaInicio(request.getFechaInicio())
                .fechaFin(request.getFechaFin())
                .tipoEvento(request.getTipoEvento())
                .modalidad(request.getModalidad())
                .ubicacion(request.getUbicacion())
                .estado(EstadoEvento.ACTIVO)
                .alumno(alumno)
                .usuarioCreador(creador)
                .fechaCreacion(LocalDateTime.now())
                .build();

        agregarInvitadosIniciales(evento, request.getInvitadosUsuarioIds(), creador.getId());

        Evento guardado = eventoRepository.save(evento);
        return eventoMapper.toResponse(guardado, true);
    }

    private void agregarInvitadosIniciales(Evento evento, List<Long> invitadosIds, Long creadorId) {
        if (invitadosIds == null || invitadosIds.isEmpty()) {
            return;
        }
        Set<Long> idsUnicos = new HashSet<>(invitadosIds);
        for (Long usuarioId : idsUnicos) {
            if (usuarioId.equals(creadorId)) {
                // El creador no se agrega como invitado (asistencia implicita).
                continue;
            }
            Usuario invitado = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", usuarioId));
            EventoUsuario relacion = EventoUsuario.builder()
                    .evento(evento)
                    .usuario(invitado)
                    .estadoAsistencia(EstadoAsistencia.PENDIENTE)
                    .build();
            evento.getInvitados().add(relacion);
        }
    }

    // ---------- Listar y detalle ----------

    @Transactional(readOnly = true)
    public List<EventoResponse> listar(Long alumnoId, TipoEvento tipo, EstadoEvento estado,
                                       LocalDateTime desde, LocalDateTime hasta) {
        Usuario usuario = obtenerUsuarioAutenticado();
        Specification<Evento> visibilidad = filtroVisibilidad(usuario);

        Specification<Evento> spec = Specification.allOf(
                visibilidad,
                EventoSpecs.delAlumno(alumnoId),
                EventoSpecs.conTipo(tipo),
                EventoSpecs.conEstado(estado),
                EventoSpecs.desde(desde),
                EventoSpecs.hasta(hasta)
        );

        return eventoRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "fechaInicio")).stream()
                .map(ev -> eventoMapper.toResponse(ev, esCreador(ev, usuario)))
                .toList();
    }

    @Transactional(readOnly = true)
    public EventoResponse obtener(Long eventoId) {
        Usuario usuario = obtenerUsuarioAutenticado();
        Evento evento = cargarEvento(eventoId);
        validarVisibilidad(evento, usuario);
        return eventoMapper.toResponse(evento, esCreador(evento, usuario));
    }

    // ---------- Editar ----------

    @Transactional
    public EventoResponse editar(Long eventoId, EventoUpdateRequest request) {
        Evento evento = cargarEvento(eventoId);
        Usuario solicitante = obtenerUsuarioAutenticado();

        if (!esCreador(evento, solicitante)) {
            throw new AccessDeniedException("Solo el creador puede editar el evento");
        }
        if (evento.getEstado() != EstadoEvento.ACTIVO) {
            throw new IllegalOperationException("Solo se pueden editar eventos en estado ACTIVO");
        }
        validarRangoFechas(request.getFechaInicio(), request.getFechaFin());

        boolean cambioFecha =
                !evento.getFechaInicio().equals(request.getFechaInicio())
                        || !evento.getFechaFin().equals(request.getFechaFin());

        evento.setTitulo(request.getTitulo());
        evento.setDescripcion(request.getDescripcion());
        evento.setFechaInicio(request.getFechaInicio());
        evento.setFechaFin(request.getFechaFin());
        evento.setModalidad(request.getModalidad());
        evento.setUbicacion(request.getUbicacion());
        evento.setFechaActualizacion(LocalDateTime.now());

        if (cambioFecha) {
            // Re-confirmacion: cualquier respuesta previa pierde validez.
            for (EventoUsuario inv : evento.getInvitados()) {
                inv.setEstadoAsistencia(EstadoAsistencia.PENDIENTE);
                inv.setFechaRespuesta(null);
                inv.setMotivoRechazo(null);
            }
        }

        return eventoMapper.toResponse(evento, true);
    }

    // ---------- Cancelar ----------

    @Transactional
    public EventoResponse cancelar(Long eventoId, CancelarEventoRequest request) {
        Evento evento = cargarEvento(eventoId);
        Usuario solicitante = obtenerUsuarioAutenticado();

        if (!esCreador(evento, solicitante) && !esAdmin(solicitante)) {
            throw new AccessDeniedException("Solo el creador o un administrador pueden cancelar el evento");
        }
        if (evento.getEstado() != EstadoEvento.ACTIVO) {
            throw new IllegalOperationException("Solo se pueden cancelar eventos en estado ACTIVO");
        }

        evento.setEstado(EstadoEvento.CANCELADO);
        evento.setMotivoCancelacion(request != null ? request.getMotivoCancelacion() : null);
        evento.setFechaActualizacion(LocalDateTime.now());

        return eventoMapper.toResponse(evento, esCreador(evento, solicitante));
    }

    // ---------- Invitados ----------

    @Transactional
    public EventoResponse agregarInvitado(Long eventoId, InvitarUsuarioRequest request) {
        Evento evento = cargarEvento(eventoId);
        Usuario solicitante = obtenerUsuarioAutenticado();

        if (!esCreador(evento, solicitante)) {
            throw new AccessDeniedException("Solo el creador puede modificar los invitados");
        }
        if (evento.getEstado() != EstadoEvento.ACTIVO) {
            throw new IllegalOperationException("Solo se pueden modificar invitados de eventos en estado ACTIVO");
        }
        if (request.getUsuarioId().equals(evento.getUsuarioCreador().getId())) {
            throw new IllegalOperationException("El creador del evento no se agrega como invitado");
        }

        boolean yaInvitado = evento.getInvitados().stream()
                .anyMatch(inv -> inv.getUsuario().getId().equals(request.getUsuarioId()));
        if (yaInvitado) {
            throw new IllegalOperationException("El usuario ya esta invitado al evento");
        }

        Usuario invitado = usuarioRepository.findById(request.getUsuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", request.getUsuarioId()));

        EventoUsuario relacion = EventoUsuario.builder()
                .evento(evento)
                .usuario(invitado)
                .estadoAsistencia(EstadoAsistencia.PENDIENTE)
                .build();
        evento.getInvitados().add(relacion);

        return eventoMapper.toResponse(evento, true);
    }

    @Transactional
    public EventoResponse removerInvitado(Long eventoId, Long usuarioId) {
        Evento evento = cargarEvento(eventoId);
        Usuario solicitante = obtenerUsuarioAutenticado();

        if (!esCreador(evento, solicitante)) {
            throw new AccessDeniedException("Solo el creador puede modificar los invitados");
        }
        if (evento.getEstado() != EstadoEvento.ACTIVO) {
            throw new IllegalOperationException("Solo se pueden modificar invitados de eventos en estado ACTIVO");
        }

        boolean removido = evento.getInvitados().removeIf(inv -> inv.getUsuario().getId().equals(usuarioId));
        if (!removido) {
            throw new ResourceNotFoundException("EventoUsuario", "usuarioId", usuarioId);
        }

        return eventoMapper.toResponse(evento, true);
    }

    // ---------- Helpers ----------

    private Evento cargarEvento(Long eventoId) {
        return eventoRepository.findById(eventoId)
                .orElseThrow(() -> new ResourceNotFoundException("Evento", "id", eventoId));
    }

    private void validarRangoFechas(LocalDateTime inicio, LocalDateTime fin) {
        if (!fin.isAfter(inicio)) {
            throw new IllegalOperationException("La fecha de fin debe ser posterior a la fecha de inicio");
        }
    }

    private void validarVisibilidad(Evento evento, Usuario usuario) {
        if (esAdmin(usuario) || esCreador(evento, usuario)) {
            return;
        }
        boolean invitado = evento.getInvitados().stream()
                .anyMatch(inv -> inv.getUsuario().getId().equals(usuario.getId()));
        if (!invitado) {
            throw new AccessDeniedException("No tiene acceso al evento con id " + evento.getId());
        }
    }

    /**
     * Especificacion de visibilidad para listados:
     *   ADMIN -> sin restriccion (null)
     *   resto -> eventos donde es creador o esta en evento_usuario
     */
    private Specification<Evento> filtroVisibilidad(Usuario usuario) {
        if (esAdmin(usuario)) {
            return null;
        }
        return EventoSpecs.visibleParaUsuario(usuario.getId());
    }

    private boolean esCreador(Evento evento, Usuario usuario) {
        return evento.getUsuarioCreador().getId().equals(usuario.getId());
    }

    private boolean esDocente(Usuario usuario) {
        return tieneRol(usuario, TipoRol.DOCENTE);
    }

    private boolean esAdmin(Usuario usuario) {
        return tieneRol(usuario, TipoRol.ADMIN);
    }

    private boolean tieneRol(Usuario usuario, TipoRol rol) {
        return usuario.getRoles().stream().anyMatch(r -> r.getNombre() == rol);
    }

    private Usuario obtenerUsuarioAutenticado() {
        String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "correo", correo));
    }
}
