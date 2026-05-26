package pe.edu.pucp.signaedu.signaedu_backend.service;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.AdminDashboardResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.DocenteDashboardResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.PadreDashboardResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.SaaneeDashboardResponse;
import pe.edu.pucp.signaedu.signaedu_backend.model.Alumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.Expediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.Rol;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoAlumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoUsuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;
import pe.edu.pucp.signaedu.signaedu_backend.repository.AlumnoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.EntradaExpedienteRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.ExpedienteRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.UsuarioRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private AlumnoRepository alumnoRepository;

    @Mock
    private ExpedienteRepository expedienteRepository;

    @Mock
    private EntradaExpedienteRepository entradaExpedienteRepository;

    @Mock
    private ConfiguracionService configuracionService;

    @InjectMocks
    private DashboardService dashboardService;

    @AfterEach
    void limpiarSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    private Usuario usuarioConRol(TipoRol tipoRol) {
        Rol rol = Rol.builder().id(1L).nombre(tipoRol).build();
        return Usuario.builder()
                .id(10L)
                .nombre("María")
                .apellido("Torres")
                .correo("maria@signaedu.pe")
                .passwordHash("hashed")
                .roles(new HashSet<>(Set.of(rol)))
                .build();
    }

    private void autenticarComo(Usuario usuario) {
        Authentication auth = new UsernamePasswordAuthenticationToken(usuario.getCorreo(), null);
        SecurityContextHolder.getContext().setAuthentication(auth);
        when(usuarioRepository.findByCorreo(usuario.getCorreo())).thenReturn(Optional.of(usuario));
    }

    private Alumno alumno(Long id, String nombre) {
        return Alumno.builder()
                .id(id)
                .nombre(nombre)
                .apellido("López")
                .fechaNacimiento(LocalDate.of(2015, 3, 10))
                .grado("3ro")
                .seccion("A")
                .estado(EstadoAlumno.ACTIVO)
                .docentes(new HashSet<>())
                .padres(new HashSet<>())
                .build();
    }

    @Test
    void obtenerResumenAdmin_devuelveContadoresYUsuariosPorRol() {
        when(configuracionService.obtenerValorPeriodo()).thenReturn("2026");
        when(usuarioRepository.countByEstado(EstadoUsuario.ACTIVO)).thenReturn(40L);
        when(alumnoRepository.countByEstado(EstadoAlumno.ACTIVO)).thenReturn(32L);
        when(expedienteRepository.countByPeriodoLectivoAndEstado("2026", EstadoExpediente.ACTIVO))
                .thenReturn(30L);
        when(usuarioRepository.countByRoles_Nombre(TipoRol.ADMIN)).thenReturn(2L);
        when(usuarioRepository.countByRoles_Nombre(TipoRol.DOCENTE)).thenReturn(8L);
        when(usuarioRepository.countByRoles_Nombre(TipoRol.PADRE)).thenReturn(26L);
        when(usuarioRepository.countByRoles_Nombre(TipoRol.SAANEE)).thenReturn(4L);

        AdminDashboardResponse resumen = dashboardService.obtenerResumenAdmin();

        assertThat(resumen.getTotalUsuarios()).isEqualTo(40L);
        assertThat(resumen.getTotalAlumnosActivos()).isEqualTo(32L);
        assertThat(resumen.getExpedientesAbiertos()).isEqualTo(30L);
        assertThat(resumen.getPeriodoVigente()).isEqualTo("2026");
        assertThat(resumen.getUsuariosPorRol())
                .containsEntry(TipoRol.ADMIN, 2L)
                .containsEntry(TipoRol.DOCENTE, 8L)
                .containsEntry(TipoRol.PADRE, 26L)
                .containsEntry(TipoRol.SAANEE, 4L);
    }

    @Test
    void obtenerResumenDocente_devuelveKPIsDelDocenteAutenticado() {
        Usuario docente = usuarioConRol(TipoRol.DOCENTE);
        autenticarComo(docente);
        when(alumnoRepository.countByDocentes_Id(docente.getId())).thenReturn(5L);
        when(entradaExpedienteRepository.contarEntradasDesdeFechaParaDocente(
                eq(docente.getId()), any(LocalDateTime.class))).thenReturn(3L);
        when(alumnoRepository.contarAsignadosSinPerfilDiscapacidad(docente.getId())).thenReturn(2L);

        DocenteDashboardResponse resumen = dashboardService.obtenerResumenDocente();

        assertThat(resumen.getAlumnosAsignados()).isEqualTo(5L);
        assertThat(resumen.getEntradasBitacoraHoy()).isEqualTo(3L);
        assertThat(resumen.getAlumnosSinPerfilDiscapacidad()).isEqualTo(2L);
    }

    @Test
    void obtenerResumenDocente_usaInicioDelDiaComoDesde() {
        Usuario docente = usuarioConRol(TipoRol.DOCENTE);
        autenticarComo(docente);
        when(alumnoRepository.countByDocentes_Id(docente.getId())).thenReturn(0L);
        when(entradaExpedienteRepository.contarEntradasDesdeFechaParaDocente(
                any(), any(LocalDateTime.class))).thenReturn(0L);
        when(alumnoRepository.contarAsignadosSinPerfilDiscapacidad(docente.getId())).thenReturn(0L);

        dashboardService.obtenerResumenDocente();

        ArgumentCaptor<LocalDateTime> desdeCaptor = ArgumentCaptor.forClass(LocalDateTime.class);
        verify(entradaExpedienteRepository)
                .contarEntradasDesdeFechaParaDocente(eq(docente.getId()), desdeCaptor.capture());
        LocalDateTime desde = desdeCaptor.getValue();
        assertThat(desde.toLocalTime()).isEqualTo(LocalTime.MIDNIGHT);
        assertThat(desde.toLocalDate()).isEqualTo(LocalDate.now());
    }

    @Test
    void obtenerResumenPadre_devuelveHijosYEntradasHoy() {
        Usuario padre = usuarioConRol(TipoRol.PADRE);
        autenticarComo(padre);
        when(configuracionService.obtenerValorPeriodo()).thenReturn("2026");

        Alumno hijo1 = alumno(1L, "Carlos");
        Alumno hijo2 = alumno(2L, "Ana");
        when(alumnoRepository.findByPadres_Id(padre.getId())).thenReturn(List.of(hijo1, hijo2));

        Expediente exp1 = Expediente.builder().id(100L).build();
        when(expedienteRepository.findByAlumnoIdAndPeriodoLectivoAndEstado(
                1L, "2026", EstadoExpediente.ACTIVO)).thenReturn(Optional.of(exp1));
        when(expedienteRepository.findByAlumnoIdAndPeriodoLectivoAndEstado(
                2L, "2026", EstadoExpediente.ACTIVO)).thenReturn(Optional.empty());

        when(entradaExpedienteRepository.contarEntradasDesdeFechaParaPadre(
                eq(padre.getId()), any(LocalDateTime.class))).thenReturn(7L);

        PadreDashboardResponse resumen = dashboardService.obtenerResumenPadre();

        assertThat(resumen.getHijos()).hasSize(2);
        assertThat(resumen.getHijos().get(0).getNombre()).isEqualTo("Carlos");
        assertThat(resumen.getHijos().get(0).getExpedienteId()).isEqualTo(100L);
        assertThat(resumen.getHijos().get(1).getNombre()).isEqualTo("Ana");
        assertThat(resumen.getHijos().get(1).getExpedienteId()).isNull();
        assertThat(resumen.getEntradasNuevasHoy()).isEqualTo(7L);
    }

    @Test
    void obtenerResumenSaanee_devuelveTotalAlumnosActivos() {
        when(alumnoRepository.countByEstado(EstadoAlumno.ACTIVO)).thenReturn(50L);

        SaaneeDashboardResponse resumen = dashboardService.obtenerResumenSaanee();

        assertThat(resumen.getTotalAlumnosActivos()).isEqualTo(50L);
    }
}
