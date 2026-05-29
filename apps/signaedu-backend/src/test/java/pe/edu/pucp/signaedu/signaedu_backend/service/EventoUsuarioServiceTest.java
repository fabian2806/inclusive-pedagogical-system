package pe.edu.pucp.signaedu.signaedu_backend.service;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.ResponderAsistenciaRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.EventoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.exception.IllegalOperationException;
import pe.edu.pucp.signaedu.signaedu_backend.exception.ResourceNotFoundException;
import pe.edu.pucp.signaedu.signaedu_backend.mapper.EventoMapper;
import pe.edu.pucp.signaedu.signaedu_backend.model.Alumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.Evento;
import pe.edu.pucp.signaedu.signaedu_backend.model.EventoUsuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.Rol;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoAlumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoAsistencia;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoEvento;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.ModalidadEvento;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoEvento;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoNotificacion;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;
import pe.edu.pucp.signaedu.signaedu_backend.repository.EventoUsuarioRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.UsuarioRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventoUsuarioServiceTest {

    private static final Long EVENTO_ID = 100L;
    private static final Long PADRE_ID = 20L;
    private static final Long DOCENTE_ID = 10L;
    private static final String PADRE_CORREO = "laura@signaedu.pe";

    @Mock private EventoUsuarioRepository eventoUsuarioRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private EventoMapper eventoMapper;
    @Mock private NotificacionService notificacionService;

    @InjectMocks
    private EventoUsuarioService eventoUsuarioService;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.getContext().setAuthentication(
                new TestingAuthenticationToken(PADRE_CORREO, "x"));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private Usuario padre() {
        Rol rol = Rol.builder().id(3L).nombre(TipoRol.PADRE).build();
        return Usuario.builder()
                .id(PADRE_ID).nombre("Laura").apellido("Diaz")
                .correo(PADRE_CORREO).passwordHash("hash")
                .roles(new HashSet<>(Set.of(rol)))
                .build();
    }

    private Usuario docenteCreador() {
        Rol rol = Rol.builder().id(2L).nombre(TipoRol.DOCENTE).build();
        return Usuario.builder()
                .id(DOCENTE_ID).nombre("Maria").apellido("Castro")
                .correo("maria@signaedu.pe").passwordHash("hash")
                .roles(new HashSet<>(Set.of(rol)))
                .build();
    }

    private Alumno alumno() {
        return Alumno.builder()
                .id(1L).nombre("Sofia").apellido("Rodriguez")
                .fechaNacimiento(LocalDate.of(2015, 1, 1))
                .grado("3ro").seccion("A")
                .estado(EstadoAlumno.ACTIVO)
                .docentes(new HashSet<>()).padres(new HashSet<>())
                .build();
    }

    private EventoUsuario invitacionPendienteFutura() {
        Evento ev = Evento.builder()
                .id(EVENTO_ID)
                .titulo("Reunion familia")
                .fechaInicio(LocalDateTime.now().plusDays(1))
                .fechaFin(LocalDateTime.now().plusDays(1).plusMinutes(45))
                .tipoEvento(TipoEvento.REUNION_PADRES)
                .modalidad(ModalidadEvento.PRESENCIAL)
                .estado(EstadoEvento.ACTIVO)
                .alumno(alumno())
                .usuarioCreador(docenteCreador())
                .fechaCreacion(LocalDateTime.now())
                .build();
        return EventoUsuario.builder()
                .id(1000L).evento(ev).usuario(padre())
                .estadoAsistencia(EstadoAsistencia.PENDIENTE)
                .build();
    }

    private void stubUsuarioAutenticado() {
        lenient().when(usuarioRepository.findByCorreo(PADRE_CORREO))
                .thenReturn(Optional.of(padre()));
    }

    private void stubMapperOK() {
        lenient().when(eventoMapper.toResponse(any(Evento.class), org.mockito.ArgumentMatchers.anyBoolean()))
                .thenReturn(EventoResponse.builder().id(EVENTO_ID).build());
    }

    @Test
    void responder_usuarioNoEsInvitado_lanzaResourceNotFound() {
        stubUsuarioAutenticado();
        when(eventoUsuarioRepository.findByEventoIdAndUsuarioId(EVENTO_ID, PADRE_ID))
                .thenReturn(Optional.empty());

        ResponderAsistenciaRequest req = new ResponderAsistenciaRequest();
        req.setEstadoAsistencia(EstadoAsistencia.CONFIRMADO);

        assertThatThrownBy(() -> eventoUsuarioService.responder(EVENTO_ID, req))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void responder_eventoYaInicio_lanzaIllegalOperation() {
        stubUsuarioAutenticado();
        EventoUsuario inv = invitacionPendienteFutura();
        // Adelanto la fecha de inicio al pasado.
        inv.getEvento().setFechaInicio(LocalDateTime.now().minusMinutes(5));
        when(eventoUsuarioRepository.findByEventoIdAndUsuarioId(EVENTO_ID, PADRE_ID))
                .thenReturn(Optional.of(inv));

        ResponderAsistenciaRequest req = new ResponderAsistenciaRequest();
        req.setEstadoAsistencia(EstadoAsistencia.CONFIRMADO);

        assertThatThrownBy(() -> eventoUsuarioService.responder(EVENTO_ID, req))
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("inicio");
    }

    @Test
    void responder_estadoPendiente_lanzaIllegalOperation() {
        stubUsuarioAutenticado();
        when(eventoUsuarioRepository.findByEventoIdAndUsuarioId(EVENTO_ID, PADRE_ID))
                .thenReturn(Optional.of(invitacionPendienteFutura()));

        ResponderAsistenciaRequest req = new ResponderAsistenciaRequest();
        req.setEstadoAsistencia(EstadoAsistencia.PENDIENTE);

        assertThatThrownBy(() -> eventoUsuarioService.responder(EVENTO_ID, req))
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("CONFIRMADO o RECHAZADO");
    }

    @Test
    void responder_motivoEnviadoSinRechazar_lanzaIllegalOperation() {
        stubUsuarioAutenticado();
        when(eventoUsuarioRepository.findByEventoIdAndUsuarioId(EVENTO_ID, PADRE_ID))
                .thenReturn(Optional.of(invitacionPendienteFutura()));

        ResponderAsistenciaRequest req = new ResponderAsistenciaRequest();
        req.setEstadoAsistencia(EstadoAsistencia.CONFIRMADO);
        req.setMotivoRechazo("aunque no rechazo, mando motivo");

        assertThatThrownBy(() -> eventoUsuarioService.responder(EVENTO_ID, req))
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("motivo");
    }

    @Test
    void responder_confirmar_persisteEstadoYNotificaAlCreador() {
        stubUsuarioAutenticado();
        EventoUsuario inv = invitacionPendienteFutura();
        when(eventoUsuarioRepository.findByEventoIdAndUsuarioId(EVENTO_ID, PADRE_ID))
                .thenReturn(Optional.of(inv));
        stubMapperOK();

        ResponderAsistenciaRequest req = new ResponderAsistenciaRequest();
        req.setEstadoAsistencia(EstadoAsistencia.CONFIRMADO);

        eventoUsuarioService.responder(EVENTO_ID, req);

        assertThat(inv.getEstadoAsistencia()).isEqualTo(EstadoAsistencia.CONFIRMADO);
        assertThat(inv.getFechaRespuesta()).isNotNull();
        assertThat(inv.getMotivoRechazo()).isNull();
        verify(notificacionService).crear(
                eq(docenteCreador()),
                org.mockito.ArgumentMatchers.contains("confirmo"),
                eq(TipoNotificacion.EVENTO),
                any(Long.class),
                eq(padre()));
    }

    @Test
    void responder_rechazarConMotivo_persisteMotivoYNotificaAlCreador() {
        stubUsuarioAutenticado();
        EventoUsuario inv = invitacionPendienteFutura();
        when(eventoUsuarioRepository.findByEventoIdAndUsuarioId(EVENTO_ID, PADRE_ID))
                .thenReturn(Optional.of(inv));
        stubMapperOK();

        ResponderAsistenciaRequest req = new ResponderAsistenciaRequest();
        req.setEstadoAsistencia(EstadoAsistencia.RECHAZADO);
        req.setMotivoRechazo("No tengo disponibilidad");

        eventoUsuarioService.responder(EVENTO_ID, req);

        assertThat(inv.getEstadoAsistencia()).isEqualTo(EstadoAsistencia.RECHAZADO);
        assertThat(inv.getMotivoRechazo()).isEqualTo("No tengo disponibilidad");
        verify(notificacionService).crear(
                eq(docenteCreador()),
                org.mockito.ArgumentMatchers.contains("rechazo"),
                eq(TipoNotificacion.EVENTO),
                any(Long.class),
                eq(padre()));
    }

    @Test
    void responder_cambioConfirmadoARechazado_usaMensajeEspecificoDeCambio() {
        stubUsuarioAutenticado();
        EventoUsuario inv = invitacionPendienteFutura();
        // Estado previo: CONFIRMADO.
        inv.setEstadoAsistencia(EstadoAsistencia.CONFIRMADO);
        inv.setFechaRespuesta(LocalDateTime.now().minusHours(1));
        when(eventoUsuarioRepository.findByEventoIdAndUsuarioId(EVENTO_ID, PADRE_ID))
                .thenReturn(Optional.of(inv));
        stubMapperOK();

        ResponderAsistenciaRequest req = new ResponderAsistenciaRequest();
        req.setEstadoAsistencia(EstadoAsistencia.RECHAZADO);

        eventoUsuarioService.responder(EVENTO_ID, req);

        // Mensaje especifico de "cambio su confirmacion a rechazo".
        verify(notificacionService).crear(
                eq(docenteCreador()),
                org.mockito.ArgumentMatchers.contains("cambio su confirmacion"),
                eq(TipoNotificacion.EVENTO),
                any(Long.class),
                eq(padre()));
    }

    @Test
    void responder_eventoCancelado_lanzaIllegalOperation() {
        stubUsuarioAutenticado();
        EventoUsuario inv = invitacionPendienteFutura();
        inv.getEvento().setEstado(EstadoEvento.CANCELADO);
        when(eventoUsuarioRepository.findByEventoIdAndUsuarioId(EVENTO_ID, PADRE_ID))
                .thenReturn(Optional.of(inv));

        ResponderAsistenciaRequest req = new ResponderAsistenciaRequest();
        req.setEstadoAsistencia(EstadoAsistencia.CONFIRMADO);

        assertThatThrownBy(() -> eventoUsuarioService.responder(EVENTO_ID, req))
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("ACTIVO");

        verify(notificacionService, never()).crear(any(), anyString(), any(), any(), any());
    }
}
