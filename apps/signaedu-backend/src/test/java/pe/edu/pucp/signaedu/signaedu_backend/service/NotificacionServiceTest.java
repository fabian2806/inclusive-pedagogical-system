package pe.edu.pucp.signaedu.signaedu_backend.service;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import pe.edu.pucp.signaedu.signaedu_backend.exception.ResourceNotFoundException;
import pe.edu.pucp.signaedu.signaedu_backend.mapper.NotificacionMapper;
import pe.edu.pucp.signaedu.signaedu_backend.model.Notificacion;
import pe.edu.pucp.signaedu.signaedu_backend.model.Rol;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoNotificacion;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;
import pe.edu.pucp.signaedu.signaedu_backend.repository.NotificacionRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.UsuarioRepository;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificacionServiceTest {

    private static final Long USUARIO_ID = 10L;
    private static final Long OTRO_USUARIO_ID = 99L;
    private static final String CORREO = "user@signaedu.pe";

    @Mock private NotificacionRepository notificacionRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private NotificacionMapper notificacionMapper;

    @InjectMocks
    private NotificacionService notificacionService;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.getContext().setAuthentication(
                new TestingAuthenticationToken(CORREO, "x"));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private Usuario usuario(Long id) {
        Rol rol = Rol.builder().id(2L).nombre(TipoRol.DOCENTE).build();
        return Usuario.builder()
                .id(id).nombre("Test").apellido("User")
                .correo(CORREO).passwordHash("hash")
                .roles(new HashSet<>(Set.of(rol)))
                .build();
    }

    private void stubUsuarioAutenticado() {
        lenient().when(usuarioRepository.findByCorreo(CORREO))
                .thenReturn(Optional.of(usuario(USUARIO_ID)));
    }

    // ============ crear (API interna) ============

    @Test
    void crear_persisteNotificacionConFechaCreacionYSinFechaLectura() {
        Usuario destinatario = usuario(USUARIO_ID);
        Usuario creador = usuario(OTRO_USUARIO_ID);

        notificacionService.crear(destinatario, "Te invito al evento", TipoNotificacion.EVENTO, 100L, creador);

        ArgumentCaptor<Notificacion> captor = ArgumentCaptor.forClass(Notificacion.class);
        verify(notificacionRepository).save(captor.capture());
        Notificacion saved = captor.getValue();
        assertThat(saved.getUsuario()).isEqualTo(destinatario);
        assertThat(saved.getMensaje()).isEqualTo("Te invito al evento");
        assertThat(saved.getReferenciaTipo()).isEqualTo(TipoNotificacion.EVENTO);
        assertThat(saved.getReferenciaId()).isEqualTo(100L);
        assertThat(saved.getUsuarioCreador()).isEqualTo(creador);
        assertThat(saved.getFechaCreacion()).isNotNull();
        assertThat(saved.getFechaLectura()).isNull();
    }

    // ============ marcarLeida ============

    @Test
    void marcarLeida_pertenenciaInvalida_lanzaAccessDenied() {
        stubUsuarioAutenticado();
        Notificacion deOtroUsuario = Notificacion.builder()
                .id(1L)
                .usuario(usuario(OTRO_USUARIO_ID))
                .mensaje("ajena")
                .referenciaTipo(TipoNotificacion.EVENTO)
                .fechaCreacion(LocalDateTime.now())
                .build();
        when(notificacionRepository.findById(1L)).thenReturn(Optional.of(deOtroUsuario));

        assertThatThrownBy(() -> notificacionService.marcarLeida(1L))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void marcarLeida_yaLeida_esIdempotenteYNoTocaFechaLectura() {
        stubUsuarioAutenticado();
        LocalDateTime lecturaPrevia = LocalDateTime.now().minusHours(2);
        Notificacion ya = Notificacion.builder()
                .id(1L)
                .usuario(usuario(USUARIO_ID))
                .mensaje("ya leida")
                .referenciaTipo(TipoNotificacion.EVENTO)
                .fechaCreacion(LocalDateTime.now().minusHours(3))
                .fechaLectura(lecturaPrevia)
                .build();
        when(notificacionRepository.findById(1L)).thenReturn(Optional.of(ya));

        notificacionService.marcarLeida(1L);

        assertThat(ya.getFechaLectura()).isEqualTo(lecturaPrevia);
    }

    @Test
    void marcarLeida_primeraVez_seteaFechaLectura() {
        stubUsuarioAutenticado();
        Notificacion noLeida = Notificacion.builder()
                .id(1L)
                .usuario(usuario(USUARIO_ID))
                .mensaje("nueva")
                .referenciaTipo(TipoNotificacion.EVENTO)
                .fechaCreacion(LocalDateTime.now().minusMinutes(5))
                .build();
        when(notificacionRepository.findById(1L)).thenReturn(Optional.of(noLeida));

        notificacionService.marcarLeida(1L);

        assertThat(noLeida.getFechaLectura()).isNotNull();
    }

    @Test
    void marcarLeida_idInexistente_lanzaResourceNotFound() {
        stubUsuarioAutenticado();
        when(notificacionRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificacionService.marcarLeida(404L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ============ marcarTodasLeidas ============

    @Test
    void marcarTodasLeidas_invocaUpdateMasivoConElIdDelUsuarioAutenticado() {
        stubUsuarioAutenticado();
        when(notificacionRepository.marcarTodasLeidasParaUsuario(any(), any()))
                .thenReturn(5);

        int marcadas = notificacionService.marcarTodasLeidas();

        assertThat(marcadas).isEqualTo(5);
        verify(notificacionRepository).marcarTodasLeidasParaUsuario(
                org.mockito.ArgumentMatchers.eq(USUARIO_ID),
                any(LocalDateTime.class));
    }

    // ============ listarMias ============

    @Test
    void listarMias_pasaIdDelUsuarioAutenticadoAlRepo() {
        stubUsuarioAutenticado();
        when(notificacionRepository.findByUsuarioIdOrderByFechaCreacionDesc(USUARIO_ID))
                .thenReturn(java.util.List.of());

        notificacionService.listarMias();

        verify(notificacionRepository).findByUsuarioIdOrderByFechaCreacionDesc(USUARIO_ID);
    }
}
