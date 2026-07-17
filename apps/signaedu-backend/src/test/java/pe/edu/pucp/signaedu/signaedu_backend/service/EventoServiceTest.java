package pe.edu.pucp.signaedu.signaedu_backend.service;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;
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
import pe.edu.pucp.signaedu.signaedu_backend.model.Rol;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoAlumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoAsistencia;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoEvento;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.ModalidadEvento;
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
import pe.edu.pucp.signaedu.signaedu_backend.service.storage.ArchivoStorage;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventoServiceTest {

    private static final Long ALUMNO_ID = 1L;
    private static final Long DOCENTE_ID = 10L;
    private static final Long OTRO_DOCENTE_ID = 11L;
    private static final Long INVITADO_PADRE_ID = 20L;
    private static final Long INVITADO_SAANEE_ID = 21L;
    private static final Long EVENTO_ID = 100L;
    private static final Long EXPEDIENTE_ID = 500L;
    private static final String PERIODO = "2026";
    private static final String DOCENTE_CORREO = "docente@signaedu.pe";

    @Mock private EventoRepository eventoRepository;
    @Mock private AlumnoRepository alumnoRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private EventoMapper eventoMapper;
    @Mock private EntradaExpedienteRepository entradaRepository;
    @Mock private EntradaArchivoRepository entradaArchivoRepository;
    @Mock private ArchivoAdjuntoRepository archivoRepository;
    @Mock private ExpedienteRepository expedienteRepository;
    @Mock private ConfiguracionService configuracionService;
    @Mock private ArchivoStorage archivoStorage;
    @Mock private EntradaArchivoMapper entradaArchivoMapper;
    @Mock private UsuarioMapper usuarioMapper;
    @Mock private NotificacionService notificacionService;

    @InjectMocks
    private EventoService eventoService;

    @BeforeEach
    void setUp() {
        // Bypass @PostConstruct y @Value.
        ReflectionTestUtils.setField(eventoService, "maxBytes", 10_485_760L);
        ReflectionTestUtils.setField(eventoService, "allowedMimesCsv",
                "application/pdf,image/jpeg,image/png");
        ReflectionTestUtils.setField(eventoService, "mimesPermitidos",
                Set.of("application/pdf", "image/jpeg", "image/png"));

        SecurityContextHolder.getContext().setAuthentication(
                new TestingAuthenticationToken(DOCENTE_CORREO, "x"));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // ============ Helpers ============

    private Usuario docente() {
        Rol rol = Rol.builder().id(2L).nombre(TipoRol.DOCENTE).build();
        return Usuario.builder()
                .id(DOCENTE_ID)
                .nombre("María").apellido("Castro")
                .correo(DOCENTE_CORREO)
                .passwordHash("hash")
                .roles(new HashSet<>(Set.of(rol)))
                .build();
    }

    private Usuario otroDocente() {
        Rol rol = Rol.builder().id(2L).nombre(TipoRol.DOCENTE).build();
        return Usuario.builder()
                .id(OTRO_DOCENTE_ID)
                .nombre("Pedro").apellido("Soto")
                .correo("pedro@signaedu.pe")
                .passwordHash("hash")
                .roles(new HashSet<>(Set.of(rol)))
                .build();
    }

    private Usuario padre() {
        Rol rol = Rol.builder().id(3L).nombre(TipoRol.PADRE).build();
        return Usuario.builder()
                .id(INVITADO_PADRE_ID)
                .nombre("Laura").apellido("Diaz")
                .correo("laura@signaedu.pe")
                .passwordHash("hash")
                .roles(new HashSet<>(Set.of(rol)))
                .build();
    }

    private Usuario saanee() {
        Rol rol = Rol.builder().id(4L).nombre(TipoRol.SAANEE).build();
        return Usuario.builder()
                .id(INVITADO_SAANEE_ID)
                .nombre("Roberto").apellido("Quispe")
                .correo("roberto@signaedu.pe")
                .passwordHash("hash")
                .roles(new HashSet<>(Set.of(rol)))
                .build();
    }

    private Alumno alumno() {
        return Alumno.builder()
                .id(ALUMNO_ID)
                .nombre("Sofia").apellido("Rodriguez")
                .fechaNacimiento(LocalDate.of(2015, 3, 10))
                .grado("3ro").seccion("A")
                .estado(EstadoAlumno.ACTIVO)
                .docentes(new HashSet<>())
                .padres(new HashSet<>())
                .build();
    }

    private EventoCreateRequest crearRequest(List<Long> invitados) {
        EventoCreateRequest req = new EventoCreateRequest();
        req.setTitulo("Reunion con familia Rodriguez");
        req.setDescripcion(null);
        req.setFechaInicio(LocalDateTime.now().plusDays(1));
        req.setFechaFin(LocalDateTime.now().plusDays(1).plusMinutes(45));
        req.setTipoEvento(TipoEvento.REUNION_PADRES);
        req.setModalidad(ModalidadEvento.PRESENCIAL);
        req.setUbicacion("Sala A");
        req.setAlumnoId(ALUMNO_ID);
        req.setInvitadosUsuarioIds(invitados);
        return req;
    }

    private Evento eventoActivoCreadoPorDocente() {
        Evento ev = Evento.builder()
                .id(EVENTO_ID)
                .titulo("Reunion con familia Rodriguez")
                .fechaInicio(LocalDateTime.now().plusDays(1))
                .fechaFin(LocalDateTime.now().plusDays(1).plusMinutes(45))
                .tipoEvento(TipoEvento.REUNION_PADRES)
                .modalidad(ModalidadEvento.PRESENCIAL)
                .estado(EstadoEvento.ACTIVO)
                .alumno(alumno())
                .usuarioCreador(docente())
                .fechaCreacion(LocalDateTime.now())
                .invitados(new ArrayList<>())
                .build();
        // Padre invitado en PENDIENTE
        EventoUsuario inv = EventoUsuario.builder()
                .id(1000L)
                .evento(ev)
                .usuario(padre())
                .estadoAsistencia(EstadoAsistencia.PENDIENTE)
                .build();
        ev.getInvitados().add(inv);
        return ev;
    }

    /** Util para acceder al unico invitado del helper en los asserts/setup. */
    private EventoUsuario primerInvitado(Evento ev) {
        return ev.getInvitados().iterator().next();
    }

    private Expediente expedienteVigente() {
        return Expediente.builder()
                .id(EXPEDIENTE_ID)
                .alumno(alumno())
                .periodoLectivo(PERIODO)
                .fechaApertura(LocalDate.now())
                .estado(EstadoExpediente.ACTIVO)
                .build();
    }

    private void stubDocenteAutenticado() {
        lenient().when(usuarioRepository.findByCorreo(DOCENTE_CORREO))
                .thenReturn(Optional.of(docente()));
    }

    private void stubAlumnoAsignadoADocente() {
        lenient().when(alumnoRepository.findById(ALUMNO_ID))
                .thenReturn(Optional.of(alumno()));
        lenient().when(alumnoRepository.existsByIdAndDocentesId(ALUMNO_ID, DOCENTE_ID))
                .thenReturn(true);
    }

    private void stubEventoCargable(Evento ev) {
        lenient().when(eventoRepository.findById(EVENTO_ID)).thenReturn(Optional.of(ev));
    }

    private void stubSaveDevuelveMismoEvento() {
        // Asigna id al save para que las notificaciones reciban un Long no-null
        // como referenciaId (any(Long.class) no matchea null).
        when(eventoRepository.save(any(Evento.class))).thenAnswer(inv -> {
            Evento e = inv.getArgument(0);
            if (e.getId() == null) {
                e.setId(EVENTO_ID);
            }
            return e;
        });
    }

    private void stubMapperOK() {
        lenient().when(eventoMapper.toResponse(any(Evento.class), org.mockito.ArgumentMatchers.anyBoolean()))
                .thenReturn(EventoResponse.builder().id(EVENTO_ID).build());
    }

    // ============ crear ============

    @Test
    void crear_happyPath_docenteSobreAlumnoAsignadoConInvitado_devuelveEventoYNotificaAlInvitado() {
        stubDocenteAutenticado();
        stubAlumnoAsignadoADocente();
        when(usuarioRepository.findById(INVITADO_PADRE_ID)).thenReturn(Optional.of(padre()));
        stubSaveDevuelveMismoEvento();
        stubMapperOK();

        eventoService.crear(crearRequest(List.of(INVITADO_PADRE_ID)));

        verify(eventoRepository).save(any(Evento.class));
        verify(notificacionService).crear(
                eq(padre()),
                anyString(),
                eq(TipoNotificacion.EVENTO),
                any(Long.class),
                eq(docente()));
    }

    @Test
    void crear_sinInvitados_lanzaIllegalOperation() {
        stubDocenteAutenticado();
        stubAlumnoAsignadoADocente();

        assertThatThrownBy(() -> eventoService.crear(crearRequest(List.of())))
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("al menos un invitado");

        verify(eventoRepository, never()).save(any());
        verify(notificacionService, never()).crear(any(), anyString(), any(), any(), any());
    }

    @Test
    void crear_invitadosSoloElCreador_lanzaIllegalOperation() {
        stubDocenteAutenticado();
        stubAlumnoAsignadoADocente();

        // Solo el creador en la lista: tras excluirlo queda vacio.
        assertThatThrownBy(() -> eventoService.crear(crearRequest(List.of(DOCENTE_ID))))
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("al menos un invitado");

        verify(eventoRepository, never()).save(any());
    }

    @Test
    void crear_docenteSobreAlumnoNoAsignado_lanzaAccessDenied() {
        stubDocenteAutenticado();
        when(alumnoRepository.findById(ALUMNO_ID)).thenReturn(Optional.of(alumno()));
        when(alumnoRepository.existsByIdAndDocentesId(ALUMNO_ID, DOCENTE_ID)).thenReturn(false);

        assertThatThrownBy(() -> eventoService.crear(crearRequest(List.of(INVITADO_PADRE_ID))))
                .isInstanceOf(AccessDeniedException.class);

        verify(eventoRepository, never()).save(any());
    }

    @Test
    void crear_fechaFinAntesDeInicio_lanzaIllegalOperation() {
        stubDocenteAutenticado();
        EventoCreateRequest req = crearRequest(List.of(INVITADO_PADRE_ID));
        req.setFechaInicio(LocalDateTime.now().plusDays(2));
        req.setFechaFin(LocalDateTime.now().plusDays(1));

        assertThatThrownBy(() -> eventoService.crear(req))
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("posterior");

        verify(eventoRepository, never()).save(any());
    }

    // ============ editar ============

    @Test
    void editar_soloCreador_otroDocenteNoPuede() {
        // Autenticamos como otro docente, distinto al creador del evento.
        SecurityContextHolder.getContext().setAuthentication(
                new TestingAuthenticationToken("pedro@signaedu.pe", "x"));
        when(usuarioRepository.findByCorreo("pedro@signaedu.pe"))
                .thenReturn(Optional.of(otroDocente()));
        stubEventoCargable(eventoActivoCreadoPorDocente());

        EventoUpdateRequest req = new EventoUpdateRequest();
        req.setTitulo("Cambio no autorizado");
        req.setFechaInicio(LocalDateTime.now().plusDays(1));
        req.setFechaFin(LocalDateTime.now().plusDays(1).plusMinutes(60));
        req.setModalidad(ModalidadEvento.PRESENCIAL);

        assertThatThrownBy(() -> eventoService.editar(EVENTO_ID, req))
                .isInstanceOf(AccessDeniedException.class);

        verify(notificacionService, never()).crear(any(), anyString(), any(), any(), any());
    }

    @Test
    void editar_cambioDeFecha_reseteaRespuestasYNotificaAReconfirmar() {
        stubDocenteAutenticado();
        Evento evento = eventoActivoCreadoPorDocente();
        primerInvitado(evento).setEstadoAsistencia(EstadoAsistencia.CONFIRMADO);
        primerInvitado(evento).setFechaRespuesta(LocalDateTime.now().minusHours(1));
        stubEventoCargable(evento);
        stubMapperOK();

        EventoUpdateRequest req = new EventoUpdateRequest();
        req.setTitulo(evento.getTitulo());
        // Nueva fecha distinta.
        req.setFechaInicio(evento.getFechaInicio().plusDays(2));
        req.setFechaFin(evento.getFechaFin().plusDays(2));
        req.setModalidad(evento.getModalidad());

        eventoService.editar(EVENTO_ID, req);

        EventoUsuario inv = primerInvitado(evento);
        assertThat(inv.getEstadoAsistencia()).isEqualTo(EstadoAsistencia.PENDIENTE);
        assertThat(inv.getFechaRespuesta()).isNull();
        assertThat(inv.getMotivoRechazo()).isNull();
        // Notif de reconfirmacion debe haberse enviado al invitado.
        verify(notificacionService).crear(
                eq(padre()),
                org.mockito.ArgumentMatchers.contains("reconfirma"),
                eq(TipoNotificacion.EVENTO),
                any(Long.class),
                any(Usuario.class));
    }

    @Test
    void editar_sinCambioDeFecha_noReseteaRespuestasYNotificaInformativo() {
        stubDocenteAutenticado();
        Evento evento = eventoActivoCreadoPorDocente();
        primerInvitado(evento).setEstadoAsistencia(EstadoAsistencia.CONFIRMADO);
        primerInvitado(evento).setFechaRespuesta(LocalDateTime.now().minusHours(1));
        stubEventoCargable(evento);
        stubMapperOK();

        EventoUpdateRequest req = new EventoUpdateRequest();
        req.setTitulo("Titulo actualizado");
        // Mismas fechas: no debe resetear.
        req.setFechaInicio(evento.getFechaInicio());
        req.setFechaFin(evento.getFechaFin());
        req.setModalidad(evento.getModalidad());

        eventoService.editar(EVENTO_ID, req);

        EventoUsuario inv = primerInvitado(evento);
        assertThat(inv.getEstadoAsistencia()).isEqualTo(EstadoAsistencia.CONFIRMADO);
        assertThat(inv.getFechaRespuesta()).isNotNull();
        // Notif informativa al invitado.
        verify(notificacionService).crear(
                eq(padre()),
                org.mockito.ArgumentMatchers.contains("actualizo"),
                eq(TipoNotificacion.EVENTO),
                any(Long.class),
                any(Usuario.class));
    }

    // ============ cancelar ============

    @Test
    void cancelar_soloCreador_otroDocenteNoPuede() {
        SecurityContextHolder.getContext().setAuthentication(
                new TestingAuthenticationToken("pedro@signaedu.pe", "x"));
        when(usuarioRepository.findByCorreo("pedro@signaedu.pe"))
                .thenReturn(Optional.of(otroDocente()));
        stubEventoCargable(eventoActivoCreadoPorDocente());

        assertThatThrownBy(() -> eventoService.cancelar(EVENTO_ID, null))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void cancelar_eventoYaFinalizado_lanzaIllegalOperation() {
        stubDocenteAutenticado();
        Evento evento = eventoActivoCreadoPorDocente();
        evento.setEstado(EstadoEvento.FINALIZADO);
        stubEventoCargable(evento);

        assertThatThrownBy(() -> eventoService.cancelar(EVENTO_ID, null))
                .isInstanceOf(IllegalOperationException.class);
    }

    @Test
    void cancelar_happyPath_persisteMotivoYNotificaATodosLosInvitados() {
        stubDocenteAutenticado();
        Evento evento = eventoActivoCreadoPorDocente();
        stubEventoCargable(evento);
        stubMapperOK();

        CancelarEventoRequest req = new CancelarEventoRequest();
        req.setMotivoCancelacion("Conflicto de agenda");

        eventoService.cancelar(EVENTO_ID, req);

        assertThat(evento.getEstado()).isEqualTo(EstadoEvento.CANCELADO);
        assertThat(evento.getMotivoCancelacion()).isEqualTo("Conflicto de agenda");
        verify(notificacionService).crear(
                eq(padre()),
                org.mockito.ArgumentMatchers.contains("Conflicto"),
                eq(TipoNotificacion.EVENTO),
                any(Long.class),
                any(Usuario.class));
    }

    // ============ invitados ============

    @Test
    void agregarInvitado_soloCreador_notificaAlNuevo() {
        stubDocenteAutenticado();
        Evento evento = eventoActivoCreadoPorDocente();
        stubEventoCargable(evento);
        when(usuarioRepository.findById(INVITADO_SAANEE_ID)).thenReturn(Optional.of(saanee()));
        stubMapperOK();

        InvitarUsuarioRequest req = new InvitarUsuarioRequest();
        req.setUsuarioId(INVITADO_SAANEE_ID);

        eventoService.agregarInvitado(EVENTO_ID, req);

        verify(notificacionService).crear(
                eq(saanee()),
                anyString(),
                eq(TipoNotificacion.EVENTO),
                any(Long.class),
                eq(docente()));
    }

    @Test
    void removerInvitado_notificaAlUsuarioRemovido() {
        stubDocenteAutenticado();
        Evento evento = eventoActivoCreadoPorDocente();
        stubEventoCargable(evento);
        stubMapperOK();

        eventoService.removerInvitado(EVENTO_ID, INVITADO_PADRE_ID);

        verify(notificacionService).crear(
                eq(padre()),
                org.mockito.ArgumentMatchers.contains("retiro"),
                eq(TipoNotificacion.EVENTO),
                any(Long.class),
                eq(docente()));
        assertThat(evento.getInvitados()).isEmpty();
    }

    // ============ registrarResultado ============

    @Test
    void registrarResultado_soloCreador_otroDocenteNoPuede() {
        SecurityContextHolder.getContext().setAuthentication(
                new TestingAuthenticationToken("pedro@signaedu.pe", "x"));
        when(usuarioRepository.findByCorreo("pedro@signaedu.pe"))
                .thenReturn(Optional.of(otroDocente()));
        stubEventoCargable(eventoActivoCreadoPorDocente());

        RegistrarResultadoRequest req = new RegistrarResultadoRequest();
        req.setDescripcion("Acordamos plan");

        assertThatThrownBy(() -> eventoService.registrarResultado(EVENTO_ID, req, null))
                .isInstanceOf(AccessDeniedException.class);

        verify(entradaRepository, never()).save(any());
    }

    @Test
    void registrarResultado_eventoNoActivo_lanzaIllegalOperation() {
        stubDocenteAutenticado();
        Evento evento = eventoActivoCreadoPorDocente();
        evento.setEstado(EstadoEvento.FINALIZADO);
        stubEventoCargable(evento);

        RegistrarResultadoRequest req = new RegistrarResultadoRequest();
        req.setDescripcion("Acordamos plan");

        assertThatThrownBy(() -> eventoService.registrarResultado(EVENTO_ID, req, null))
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("ACTIVO");
    }

    @Test
    void registrarResultado_conResultadoPrevio_lanzaIllegalOperationPorUnicidad() {
        stubDocenteAutenticado();
        stubEventoCargable(eventoActivoCreadoPorDocente());
        when(entradaRepository.existsByEvento_IdAndTipoEntrada(EVENTO_ID, TipoEntrada.EVENTO_AGENDA))
                .thenReturn(true);

        RegistrarResultadoRequest req = new RegistrarResultadoRequest();
        req.setDescripcion("Acordamos plan");

        assertThatThrownBy(() -> eventoService.registrarResultado(EVENTO_ID, req, null))
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("ya tiene un resultado");
    }

    @Test
    void registrarResultado_happyPathSinArchivos_creaEntradaEventoAgendaConEventoIdYFinalizaEvento() {
        stubDocenteAutenticado();
        Evento evento = eventoActivoCreadoPorDocente();
        // Invitado pendiente: por politica B, recibe notif del resultado.
        stubEventoCargable(evento);
        when(entradaRepository.existsByEvento_IdAndTipoEntrada(EVENTO_ID, TipoEntrada.EVENTO_AGENDA))
                .thenReturn(false);
        when(configuracionService.obtenerValorPeriodo()).thenReturn(PERIODO);
        when(expedienteRepository.findByAlumnoIdAndPeriodoLectivoAndEstado(
                ALUMNO_ID, PERIODO, EstadoExpediente.ACTIVO))
                .thenReturn(Optional.of(expedienteVigente()));
        when(entradaRepository.save(any(EntradaExpediente.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        RegistrarResultadoRequest req = new RegistrarResultadoRequest();
        req.setTitulo("Cierre de reunion");
        req.setDescripcion("Acordamos plan LSP en casa");

        ResultadoEventoResponse response = eventoService.registrarResultado(EVENTO_ID, req, null);

        // Evento queda FINALIZADO.
        assertThat(evento.getEstado()).isEqualTo(EstadoEvento.FINALIZADO);
        assertThat(evento.getFechaActualizacion()).isNotNull();
        // La entrada se persistio con tipo EVENTO_AGENDA y evento_id poblado.
        ArgumentCaptor<EntradaExpediente> captor = ArgumentCaptor.forClass(EntradaExpediente.class);
        verify(entradaRepository).save(captor.capture());
        EntradaExpediente persisted = captor.getValue();
        assertThat(persisted.getTipoEntrada()).isEqualTo(TipoEntrada.EVENTO_AGENDA);
        assertThat(persisted.getEvento()).isEqualTo(evento);
        assertThat(persisted.getDescripcion()).isEqualTo("Acordamos plan LSP en casa");
        // Politica B: notif a invitado pendiente (no rechazado).
        verify(notificacionService).crear(
                eq(padre()),
                org.mockito.ArgumentMatchers.contains("resultado"),
                eq(TipoNotificacion.EVENTO),
                any(Long.class),
                eq(docente()));
        assertThat(response).isNotNull();
    }

    @Test
    void registrarResultado_invitadoRechazado_noRecibeNotificacionPorPoliticaB() {
        stubDocenteAutenticado();
        Evento evento = eventoActivoCreadoPorDocente();
        primerInvitado(evento).setEstadoAsistencia(EstadoAsistencia.RECHAZADO);
        stubEventoCargable(evento);
        when(entradaRepository.existsByEvento_IdAndTipoEntrada(EVENTO_ID, TipoEntrada.EVENTO_AGENDA))
                .thenReturn(false);
        when(configuracionService.obtenerValorPeriodo()).thenReturn(PERIODO);
        when(expedienteRepository.findByAlumnoIdAndPeriodoLectivoAndEstado(
                ALUMNO_ID, PERIODO, EstadoExpediente.ACTIVO))
                .thenReturn(Optional.of(expedienteVigente()));
        when(entradaRepository.save(any(EntradaExpediente.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        RegistrarResultadoRequest req = new RegistrarResultadoRequest();
        req.setDescripcion("Acordamos plan");

        eventoService.registrarResultado(EVENTO_ID, req, null);

        // Quien rechazo no debe recibir notif del resultado.
        verify(notificacionService, never()).crear(any(), anyString(), any(), any(), any());
    }

    @Test
    void registrarResultado_conArchivos_persisteEntradaArchivoYGuardaEnStorageComoUltimoPaso()
            throws Exception {
        stubDocenteAutenticado();
        stubEventoCargable(eventoActivoCreadoPorDocente());
        when(entradaRepository.existsByEvento_IdAndTipoEntrada(EVENTO_ID, TipoEntrada.EVENTO_AGENDA))
                .thenReturn(false);
        when(configuracionService.obtenerValorPeriodo()).thenReturn(PERIODO);
        when(expedienteRepository.findByAlumnoIdAndPeriodoLectivoAndEstado(
                ALUMNO_ID, PERIODO, EstadoExpediente.ACTIVO))
                .thenReturn(Optional.of(expedienteVigente()));
        when(entradaRepository.save(any(EntradaExpediente.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        // ArchivoAdjunto persistido devuelve la misma entidad con id seteado.
        when(archivoRepository.save(any(ArchivoAdjunto.class)))
                .thenAnswer(inv -> {
                    ArchivoAdjunto a = inv.getArgument(0);
                    a.setId(999L);
                    return a;
                });
        when(entradaArchivoRepository.save(any(EntradaArchivo.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        MockMultipartFile archivo = new MockMultipartFile(
                "archivos", "acta.pdf", "application/pdf", "contenido".getBytes());

        RegistrarResultadoRequest req = new RegistrarResultadoRequest();
        req.setDescripcion("Acordamos plan");

        eventoService.registrarResultado(EVENTO_ID, req, List.of(archivo));

        verify(archivoRepository).save(any(ArchivoAdjunto.class));
        verify(entradaArchivoRepository).save(any(EntradaArchivo.class));
        // Storage como ultimo paso: si fallara, el rollback transaccional
        // deshace BD. Aqui validamos que se invoca.
        verify(archivoStorage, times(1))
                .guardar(anyString(), any(), org.mockito.ArgumentMatchers.anyLong());
    }

    @Test
    void registrarResultado_archivoMimeNoPermitido_lanzaIllegalOperation() {
        stubDocenteAutenticado();
        stubEventoCargable(eventoActivoCreadoPorDocente());
        when(entradaRepository.existsByEvento_IdAndTipoEntrada(EVENTO_ID, TipoEntrada.EVENTO_AGENDA))
                .thenReturn(false);
        when(configuracionService.obtenerValorPeriodo()).thenReturn(PERIODO);
        when(expedienteRepository.findByAlumnoIdAndPeriodoLectivoAndEstado(
                ALUMNO_ID, PERIODO, EstadoExpediente.ACTIVO))
                .thenReturn(Optional.of(expedienteVigente()));

        MockMultipartFile archivo = new MockMultipartFile(
                "archivos", "malo.exe", "application/x-msdownload", "abc".getBytes());

        RegistrarResultadoRequest req = new RegistrarResultadoRequest();
        req.setDescripcion("Acordamos plan");

        assertThatThrownBy(() -> eventoService.registrarResultado(EVENTO_ID, req, List.of(archivo)))
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("MIME");

        verify(entradaRepository, never()).save(any(EntradaExpediente.class));
        verify(archivoStorage, never()).guardar(anyString(), any(), org.mockito.ArgumentMatchers.anyLong());
    }

    // ============ obtenerResultado ============

    @Test
    void obtenerResultado_sinResultadoRegistrado_lanzaResourceNotFound() {
        stubDocenteAutenticado();
        stubEventoCargable(eventoActivoCreadoPorDocente());
        when(entradaRepository.findFirstByEvento_IdAndTipoEntrada(EVENTO_ID, TipoEntrada.EVENTO_AGENDA))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> eventoService.obtenerResultado(EVENTO_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ============ listar / obtener: visibilidad por rol ============

    @Test
    void listar_invocaSpecificationFilteringPorUsuarioAutenticado() {
        stubDocenteAutenticado();
        when(eventoRepository.findAll(any(Specification.class), any(Sort.class)))
                .thenReturn(List.of());

        eventoService.listar(null, null, null, null, null);

        verify(eventoRepository).findAll(any(Specification.class), any(Sort.class));
    }

    @Test
    void obtener_usuarioSinVisibilidad_lanzaAccessDenied() {
        // Autenticamos como otroDocente; el evento fue creado por docente (no es creador)
        // y otroDocente no figura en invitados → no visible.
        SecurityContextHolder.getContext().setAuthentication(
                new TestingAuthenticationToken("pedro@signaedu.pe", "x"));
        when(usuarioRepository.findByCorreo("pedro@signaedu.pe"))
                .thenReturn(Optional.of(otroDocente()));
        stubEventoCargable(eventoActivoCreadoPorDocente());

        assertThatThrownBy(() -> eventoService.obtener(EVENTO_ID))
                .isInstanceOf(AccessDeniedException.class);
    }
}
