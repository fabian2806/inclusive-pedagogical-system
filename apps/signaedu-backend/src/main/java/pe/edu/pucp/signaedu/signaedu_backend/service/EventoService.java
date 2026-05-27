package pe.edu.pucp.signaedu.signaedu_backend.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.CancelarEventoRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.EventoCreateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.EventoUpdateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.InvitarUsuarioRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.RegistrarResultadoRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.EventoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.ResultadoEventoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.exception.IllegalOperationException;
import pe.edu.pucp.signaedu.signaedu_backend.exception.ResourceNotFoundException;
import pe.edu.pucp.signaedu.signaedu_backend.mapper.EntradaArchivoMapper;
import pe.edu.pucp.signaedu.signaedu_backend.mapper.EventoMapper;
import pe.edu.pucp.signaedu.signaedu_backend.mapper.UsuarioMapper;
import pe.edu.pucp.signaedu.signaedu_backend.model.Alumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.ArchivoAdjunto;
import pe.edu.pucp.signaedu.signaedu_backend.model.EntradaArchivo;
import pe.edu.pucp.signaedu.signaedu_backend.model.EntradaExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.Evento;
import pe.edu.pucp.signaedu.signaedu_backend.model.EventoUsuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.Expediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoAsistencia;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoEvento;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoEntrada;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoEvento;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoNotificacion;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;
import pe.edu.pucp.signaedu.signaedu_backend.repository.AlumnoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.ArchivoAdjuntoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.EntradaArchivoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.EntradaExpedienteRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.EventoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.ExpedienteRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.UsuarioRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.specs.EventoSpecs;
import pe.edu.pucp.signaedu.signaedu_backend.service.storage.ArchivoStorage;
import pe.edu.pucp.signaedu.signaedu_backend.service.storage.StorageException;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventoService {

    private final EventoRepository eventoRepository;
    private final AlumnoRepository alumnoRepository;
    private final UsuarioRepository usuarioRepository;
    private final EventoMapper eventoMapper;

    // Dependencias para registrar el resultado de un evento.
    private final EntradaExpedienteRepository entradaRepository;
    private final EntradaArchivoRepository entradaArchivoRepository;
    private final ArchivoAdjuntoRepository archivoRepository;
    private final ExpedienteRepository expedienteRepository;
    private final ConfiguracionService configuracionService;
    private final ArchivoStorage archivoStorage;
    private final EntradaArchivoMapper entradaArchivoMapper;
    private final UsuarioMapper usuarioMapper;

    // Notificaciones automaticas (4c.2).
    private final NotificacionService notificacionService;

    @Value("${storage.max-bytes:10485760}")
    private long maxBytes;

    @Value("${storage.allowed-mime-types}")
    private String allowedMimesCsv;

    private Set<String> mimesPermitidos;

    @PostConstruct
    void inicializarMimesPermitidos() {
        mimesPermitidos = Arrays.stream(allowedMimesCsv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toUnmodifiableSet());
    }

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

        // Notifica a cada invitado inicial.
        for (EventoUsuario inv : guardado.getInvitados()) {
            notificacionService.crear(
                    inv.getUsuario(),
                    mensajeInvitacion(creador, guardado),
                    TipoNotificacion.EVENTO,
                    guardado.getId(),
                    creador);
        }

        return eventoMapper.toResponse(guardado, true);
    }

    private void agregarInvitadosIniciales(Evento evento, List<Long> invitadosIds, Long creadorId) {
        // Calcula el set efectivo: deduplica y excluye al creador
        // (asistencia implicita) antes de validar.
        Set<Long> idsEfectivos = new HashSet<>();
        if (invitadosIds != null) {
            for (Long id : invitadosIds) {
                if (id != null && !id.equals(creadorId)) {
                    idsEfectivos.add(id);
                }
            }
        }
        if (idsEfectivos.isEmpty()) {
            throw new IllegalOperationException(
                    "El evento debe tener al menos un invitado distinto del creador");
        }
        for (Long usuarioId : idsEfectivos) {
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

        // Notifica a todos los invitados; el mensaje cambia segun el tipo de edicion.
        String mensaje = cambioFecha
                ? mensajeReprogramacion(solicitante, evento)
                : mensajeEdicion(solicitante, evento);
        for (EventoUsuario inv : evento.getInvitados()) {
            notificacionService.crear(
                    inv.getUsuario(),
                    mensaje,
                    TipoNotificacion.EVENTO,
                    evento.getId(),
                    solicitante);
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

        // Notifica a todos los invitados, independientemente de su estado de asistencia.
        String mensaje = mensajeCancelacion(solicitante, evento);
        for (EventoUsuario inv : evento.getInvitados()) {
            notificacionService.crear(
                    inv.getUsuario(),
                    mensaje,
                    TipoNotificacion.EVENTO,
                    evento.getId(),
                    solicitante);
        }

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

        notificacionService.crear(
                invitado,
                mensajeInvitacion(solicitante, evento),
                TipoNotificacion.EVENTO,
                evento.getId(),
                solicitante);

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

        EventoUsuario aRemover = evento.getInvitados().stream()
                .filter(inv -> inv.getUsuario().getId().equals(usuarioId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("EventoUsuario", "usuarioId", usuarioId));
        Usuario usuarioRemovido = aRemover.getUsuario();
        evento.getInvitados().remove(aRemover);

        notificacionService.crear(
                usuarioRemovido,
                mensajeRemocion(solicitante, evento),
                TipoNotificacion.EVENTO,
                evento.getId(),
                solicitante);

        return eventoMapper.toResponse(evento, true);
    }

    // ---------- Registrar resultado ----------

    /**
     * Cierra un evento registrando su resultado como una EntradaExpediente
     * de tipo EVENTO_AGENDA vinculada al evento (opcion b del plan de Fase 4):
     * el resultado vive en la bitacora del expediente del alumno y se puede
     * navegar desde el detalle del evento via evento_id.
     *
     * Patron espejo de DocumentoExpedienteService.subir: crea la entrada,
     * persiste los archivos con placeholder + key, escribe en storage como
     * ultimo paso para que cualquier fallo dispare rollback transaccional.
     *
     * Bypass intencional de BitacoraService: EVENTO_AGENDA esta en
     * TIPOS_DIFERIDOS para evitar creacion directa via POST /alumnos/{id}/bitacora;
     * aqui se invoca desde el service de eventos como side-effect del
     * cierre del evento, no como entrada manual.
     */
    @Transactional
    public ResultadoEventoResponse registrarResultado(Long eventoId,
                                                      RegistrarResultadoRequest request,
                                                      List<MultipartFile> archivos) {
        Usuario autor = obtenerUsuarioAutenticado();
        Evento evento = cargarEvento(eventoId);

        if (!esCreador(evento, autor)) {
            throw new AccessDeniedException("Solo el creador del evento puede registrar su resultado");
        }
        if (evento.getEstado() != EstadoEvento.ACTIVO) {
            throw new IllegalOperationException(
                    "Solo se puede registrar resultado en eventos en estado ACTIVO");
        }
        if (entradaRepository.existsByEvento_IdAndTipoEntrada(eventoId, TipoEntrada.EVENTO_AGENDA)) {
            throw new IllegalOperationException(
                    "El evento ya tiene un resultado registrado");
        }

        Expediente expediente = obtenerExpedienteVigenteOLanzar(evento.getAlumno().getId());
        validarArchivos(archivos);

        LocalDateTime ahora = LocalDateTime.now();

        EntradaExpediente entrada = entradaRepository.save(EntradaExpediente.builder()
                .expediente(expediente)
                .tipoEntrada(TipoEntrada.EVENTO_AGENDA)
                .usuario(autor)
                .fecha(ahora)
                .titulo(request.getTitulo())
                .descripcion(request.getDescripcion())
                .evento(evento)
                .build());

        List<EntradaArchivo> entradaArchivos = persistirArchivos(archivos, entrada, autor, ahora);

        evento.setEstado(EstadoEvento.FINALIZADO);
        evento.setFechaActualizacion(ahora);

        // Notifica a los invitados que no rechazaron la invitacion (CONFIRMADO
        // o PENDIENTE). Quienes rechazaron explicitamente no reciben el ping;
        // si quieren consultar el resultado, sigue accesible via la bitacora
        // del expediente. El creador no esta en la coleccion de invitados;
        // no se autonotifica.
        String mensaje = mensajeResultado(autor, evento);
        for (EventoUsuario inv : evento.getInvitados()) {
            if (inv.getEstadoAsistencia() != EstadoAsistencia.RECHAZADO) {
                notificacionService.crear(
                        inv.getUsuario(),
                        mensaje,
                        TipoNotificacion.EVENTO,
                        evento.getId(),
                        autor);
            }
        }

        return ResultadoEventoResponse.builder()
                .eventoId(evento.getId())
                .entradaId(entrada.getId())
                .titulo(entrada.getTitulo())
                .descripcion(entrada.getDescripcion())
                .fecha(entrada.getFecha())
                .autor(usuarioMapper.toBitacoraResponse(autor))
                .archivos(entradaArchivos.stream()
                        .map(entradaArchivoMapper::toResponse)
                        .toList())
                .build();
    }

    @Transactional(readOnly = true)
    public ResultadoEventoResponse obtenerResultado(Long eventoId) {
        Usuario usuario = obtenerUsuarioAutenticado();
        Evento evento = cargarEvento(eventoId);
        validarVisibilidad(evento, usuario);

        EntradaExpediente entrada = entradaRepository
                .findFirstByEvento_IdAndTipoEntrada(eventoId, TipoEntrada.EVENTO_AGENDA)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "ResultadoEvento", "eventoId", eventoId));

        List<EntradaArchivo> archivos = entradaArchivoRepository
                .findByEntrada_IdOrderByFechaSubidaAsc(entrada.getId());

        return ResultadoEventoResponse.builder()
                .eventoId(evento.getId())
                .entradaId(entrada.getId())
                .titulo(entrada.getTitulo())
                .descripcion(entrada.getDescripcion())
                .fecha(entrada.getFecha())
                .autor(usuarioMapper.toBitacoraResponse(entrada.getUsuario()))
                .archivos(archivos.stream()
                        .map(entradaArchivoMapper::toResponse)
                        .toList())
                .build();
    }

    // ---------- Helpers de resultado ----------

    private Expediente obtenerExpedienteVigenteOLanzar(Long alumnoId) {
        String periodo = configuracionService.obtenerValorPeriodo();
        return expedienteRepository
                .findByAlumnoIdAndPeriodoLectivoAndEstado(alumnoId, periodo, EstadoExpediente.ACTIVO)
                .orElseThrow(() -> new IllegalOperationException(
                        "El alumno del evento no tiene un expediente activo en el periodo vigente"));
    }

    private void validarArchivos(List<MultipartFile> archivos) {
        if (archivos == null || archivos.isEmpty()) {
            return;
        }
        for (MultipartFile archivo : archivos) {
            validarArchivo(archivo);
        }
    }

    private void validarArchivo(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalOperationException("El archivo es obligatorio y no puede estar vacio");
        }
        if (archivo.getSize() > maxBytes) {
            throw new IllegalOperationException(
                    "El archivo supera el tamano maximo permitido de " + maxBytes + " bytes");
        }
        String mime = archivo.getContentType();
        if (mime == null || !mimesPermitidos.contains(mime)) {
            throw new IllegalOperationException(
                    "Tipo MIME no permitido: " + (mime == null ? "(desconocido)" : mime));
        }
    }

    private List<EntradaArchivo> persistirArchivos(List<MultipartFile> archivos,
                                                   EntradaExpediente entrada,
                                                   Usuario autor,
                                                   LocalDateTime ahora) {
        if (archivos == null || archivos.isEmpty()) {
            return List.of();
        }
        return archivos.stream()
                .map(archivo -> persistirArchivo(archivo, entrada, autor, ahora))
                .toList();
    }

    private EntradaArchivo persistirArchivo(MultipartFile archivo,
                                            EntradaExpediente entrada,
                                            Usuario autor,
                                            LocalDateTime ahora) {
        ArchivoAdjunto archivoEntity = persistirArchivoConPlaceholder(archivo, ahora);
        String key = construirKey(archivoEntity.getId(), archivo.getOriginalFilename());
        archivoEntity.setRutaAlmacenamiento(key);

        EntradaArchivo entradaArchivo = entradaArchivoRepository.save(EntradaArchivo.builder()
                .entrada(entrada)
                .archivo(archivoEntity)
                .usuarioSubido(autor)
                .fechaSubida(ahora)
                .build());

        // Storage como ultimo paso: si falla, rollback transaccional + nada en disco.
        guardarArchivoEnStorage(archivo, key);
        return entradaArchivo;
    }

    private ArchivoAdjunto persistirArchivoConPlaceholder(MultipartFile archivo, LocalDateTime ahora) {
        ArchivoAdjunto entity = ArchivoAdjunto.builder()
                .nombreOriginal(archivo.getOriginalFilename() != null
                        ? archivo.getOriginalFilename()
                        : "sin-nombre")
                .mimeType(archivo.getContentType() != null
                        ? archivo.getContentType()
                        : "application/octet-stream")
                .tamano(archivo.getSize())
                .rutaAlmacenamiento("PENDIENTE-" + UUID.randomUUID())
                .fechaSubida(ahora)
                .build();
        return archivoRepository.save(entity);
    }

    private String construirKey(Long archivoId, String filenameOriginal) {
        String ext = "";
        if (filenameOriginal != null) {
            int dot = filenameOriginal.lastIndexOf('.');
            if (dot >= 0 && dot < filenameOriginal.length() - 1) {
                ext = filenameOriginal.substring(dot);
            }
        }
        return "expedientes/" + archivoId + ext;
    }

    private void guardarArchivoEnStorage(MultipartFile archivo, String key) {
        try {
            archivoStorage.guardar(key, archivo.getInputStream(), archivo.getSize());
        } catch (IOException e) {
            throw new StorageException("Error al leer archivo recibido para guardar", e);
        }
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

    // ---------- Builders de mensaje (notificaciones) ----------

    private String nombreCompleto(Usuario u) {
        return u.getNombre() + " " + u.getApellido();
    }

    private String mensajeInvitacion(Usuario creador, Evento evento) {
        return nombreCompleto(creador) + " te invito al evento \"" + evento.getTitulo() + "\"";
    }

    private String mensajeReprogramacion(Usuario creador, Evento evento) {
        return nombreCompleto(creador) + " cambio la fecha del evento \"" + evento.getTitulo()
                + "\". Por favor reconfirma tu asistencia.";
    }

    private String mensajeEdicion(Usuario creador, Evento evento) {
        return nombreCompleto(creador) + " actualizo el evento \"" + evento.getTitulo() + "\"";
    }

    private String mensajeCancelacion(Usuario creador, Evento evento) {
        String base = nombreCompleto(creador) + " cancelo el evento \"" + evento.getTitulo() + "\"";
        String motivo = evento.getMotivoCancelacion();
        if (motivo != null && !motivo.isBlank()) {
            base += " - Motivo: " + motivo.trim();
        }
        return base;
    }

    private String mensajeRemocion(Usuario creador, Evento evento) {
        return nombreCompleto(creador) + " te retiro del evento \"" + evento.getTitulo() + "\"";
    }

    private String mensajeResultado(Usuario creador, Evento evento) {
        return nombreCompleto(creador) + " registro el resultado del evento \"" + evento.getTitulo() + "\"";
    }
}
