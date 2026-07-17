package pe.edu.pucp.signaedu.signaedu_backend.service;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;
import pe.edu.pucp.signaedu.signaedu_backend.exception.IllegalOperationException;
import pe.edu.pucp.signaedu.signaedu_backend.mapper.EventoArchivoMapper;
import pe.edu.pucp.signaedu.signaedu_backend.model.Alumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.ArchivoAdjunto;
import pe.edu.pucp.signaedu.signaedu_backend.model.Evento;
import pe.edu.pucp.signaedu.signaedu_backend.model.EventoArchivo;
import pe.edu.pucp.signaedu.signaedu_backend.model.Rol;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoAlumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoEvento;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.ModalidadEvento;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoEvento;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;
import pe.edu.pucp.signaedu.signaedu_backend.repository.ArchivoAdjuntoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.EventoArchivoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.EventoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.UsuarioRepository;
import pe.edu.pucp.signaedu.signaedu_backend.service.storage.ArchivoStorage;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventoArchivoServiceTest {

    private static final Long EVENTO_ID = 100L;
    private static final Long CREADOR_ID = 10L;
    private static final Long OTRO_DOCENTE_ID = 11L;
    private static final String CREADOR_CORREO = "maria@signaedu.pe";

    @Mock private EventoArchivoRepository eventoArchivoRepository;
    @Mock private EventoRepository eventoRepository;
    @Mock private ArchivoAdjuntoRepository archivoRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private ArchivoStorage archivoStorage;
    @Mock private EventoArchivoMapper eventoArchivoMapper;

    @InjectMocks
    private EventoArchivoService eventoArchivoService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(eventoArchivoService, "maxBytes", 10_485_760L);
        ReflectionTestUtils.setField(eventoArchivoService, "allowedMimesCsv",
                "application/pdf,image/jpeg,image/png");
        ReflectionTestUtils.setField(eventoArchivoService, "mimesPermitidos",
                Set.of("application/pdf", "image/jpeg", "image/png"));

        SecurityContextHolder.getContext().setAuthentication(
                new TestingAuthenticationToken(CREADOR_CORREO, "x"));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private Usuario creador() {
        Rol rol = Rol.builder().id(2L).nombre(TipoRol.DOCENTE).build();
        return Usuario.builder()
                .id(CREADOR_ID).nombre("Maria").apellido("Castro")
                .correo(CREADOR_CORREO).passwordHash("hash")
                .roles(new HashSet<>(Set.of(rol)))
                .build();
    }

    private Usuario otroDocente() {
        Rol rol = Rol.builder().id(2L).nombre(TipoRol.DOCENTE).build();
        return Usuario.builder()
                .id(OTRO_DOCENTE_ID).nombre("Pedro").apellido("Soto")
                .correo("pedro@signaedu.pe").passwordHash("hash")
                .roles(new HashSet<>(Set.of(rol)))
                .build();
    }

    private Evento eventoActivo() {
        Alumno alumno = Alumno.builder()
                .id(1L).nombre("Sofia").apellido("R")
                .fechaNacimiento(LocalDate.of(2015, 1, 1))
                .grado("3ro").seccion("A")
                .estado(EstadoAlumno.ACTIVO)
                .docentes(new HashSet<>()).padres(new HashSet<>())
                .build();
        return Evento.builder()
                .id(EVENTO_ID)
                .titulo("Reunion")
                .fechaInicio(LocalDateTime.now().plusDays(1))
                .fechaFin(LocalDateTime.now().plusDays(1).plusHours(1))
                .tipoEvento(TipoEvento.REUNION_PADRES)
                .modalidad(ModalidadEvento.PRESENCIAL)
                .estado(EstadoEvento.ACTIVO)
                .alumno(alumno)
                .usuarioCreador(creador())
                .fechaCreacion(LocalDateTime.now())
                .invitados(new ArrayList<>())
                .build();
    }

    @Test
    void adjuntar_noEsCreador_lanzaAccessDenied() {
        SecurityContextHolder.getContext().setAuthentication(
                new TestingAuthenticationToken("pedro@signaedu.pe", "x"));
        when(usuarioRepository.findByCorreo("pedro@signaedu.pe"))
                .thenReturn(Optional.of(otroDocente()));
        when(eventoRepository.findById(EVENTO_ID)).thenReturn(Optional.of(eventoActivo()));

        MockMultipartFile archivo = new MockMultipartFile(
                "archivo", "agenda.pdf", "application/pdf", "abc".getBytes());

        assertThatThrownBy(() -> eventoArchivoService.adjuntar(EVENTO_ID, null, archivo))
                .isInstanceOf(AccessDeniedException.class);

        verify(eventoArchivoRepository, never()).save(any());
        verify(archivoStorage, never()).guardar(anyString(), any(), anyLong());
    }

    @Test
    void adjuntar_eventoNoActivo_lanzaIllegalOperation() {
        lenient().when(usuarioRepository.findByCorreo(CREADOR_CORREO))
                .thenReturn(Optional.of(creador()));
        Evento evento = eventoActivo();
        evento.setEstado(EstadoEvento.FINALIZADO);
        when(eventoRepository.findById(EVENTO_ID)).thenReturn(Optional.of(evento));

        MockMultipartFile archivo = new MockMultipartFile(
                "archivo", "agenda.pdf", "application/pdf", "abc".getBytes());

        assertThatThrownBy(() -> eventoArchivoService.adjuntar(EVENTO_ID, null, archivo))
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("ACTIVO");
    }

    @Test
    void adjuntar_mimeNoPermitido_lanzaIllegalOperation() {
        when(usuarioRepository.findByCorreo(CREADOR_CORREO))
                .thenReturn(Optional.of(creador()));
        when(eventoRepository.findById(EVENTO_ID)).thenReturn(Optional.of(eventoActivo()));

        MockMultipartFile archivo = new MockMultipartFile(
                "archivo", "malo.exe", "application/x-msdownload", "abc".getBytes());

        assertThatThrownBy(() -> eventoArchivoService.adjuntar(EVENTO_ID, null, archivo))
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("MIME");

        verify(archivoStorage, never()).guardar(anyString(), any(), anyLong());
    }

    @Test
    void adjuntar_archivoExcedeMaxBytes_lanzaIllegalOperation() {
        when(usuarioRepository.findByCorreo(CREADOR_CORREO))
                .thenReturn(Optional.of(creador()));
        when(eventoRepository.findById(EVENTO_ID)).thenReturn(Optional.of(eventoActivo()));
        // bytes = 11 MB (excede 10 MB de maxBytes).
        byte[] enorme = new byte[11 * 1024 * 1024];
        MockMultipartFile archivo = new MockMultipartFile(
                "archivo", "grande.pdf", "application/pdf", enorme);

        assertThatThrownBy(() -> eventoArchivoService.adjuntar(EVENTO_ID, null, archivo))
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("tamano");

        verify(archivoStorage, never()).guardar(anyString(), any(), anyLong());
    }

    @Test
    void adjuntar_happyPath_creaArchivoAdjuntoYEventoArchivoYGuardaEnStorageAlFinal() throws Exception {
        when(usuarioRepository.findByCorreo(CREADOR_CORREO))
                .thenReturn(Optional.of(creador()));
        when(eventoRepository.findById(EVENTO_ID)).thenReturn(Optional.of(eventoActivo()));
        when(archivoRepository.save(any(ArchivoAdjunto.class))).thenAnswer(inv -> {
            ArchivoAdjunto a = inv.getArgument(0);
            a.setId(999L);
            return a;
        });
        when(eventoArchivoRepository.save(any(EventoArchivo.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        MockMultipartFile archivo = new MockMultipartFile(
                "archivo", "agenda.pdf", "application/pdf", "abc".getBytes());

        eventoArchivoService.adjuntar(EVENTO_ID, null, archivo);

        verify(archivoRepository).save(any(ArchivoAdjunto.class));
        verify(eventoArchivoRepository).save(any(EventoArchivo.class));
        verify(archivoStorage).guardar(anyString(), any(), anyLong());
    }
}
