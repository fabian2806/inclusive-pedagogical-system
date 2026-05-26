package pe.edu.pucp.signaedu.signaedu_backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import pe.edu.pucp.signaedu.signaedu_backend.config.SecurityConfig;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.ActividadEntradaResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.AdminDashboardResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.DocenteDashboardResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.HijoResumen;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.PadreDashboardResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.SaaneeDashboardResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.UsuarioBitacoraResponse;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoEntrada;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;
import pe.edu.pucp.signaedu.signaedu_backend.security.CustomUserDetailsService;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtAuthenticationFilter;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtService;
import pe.edu.pucp.signaedu.signaedu_backend.service.DashboardService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DashboardController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@ActiveProfiles("test")
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DashboardService dashboardService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    // --- ADMIN ---

    @Test
    @WithMockUser(roles = "ADMIN")
    void resumenAdmin_conRolAdmin_devuelve200ConPayloadEsperado() throws Exception {
        when(dashboardService.obtenerResumenAdmin()).thenReturn(AdminDashboardResponse.builder()
                .totalUsuarios(40L)
                .totalAlumnosActivos(32L)
                .expedientesAbiertos(30L)
                .periodoVigente("2026")
                .usuariosPorRol(Map.of(
                        TipoRol.ADMIN, 2L,
                        TipoRol.DOCENTE, 8L,
                        TipoRol.PADRE, 26L,
                        TipoRol.SAANEE, 4L))
                .build());

        mockMvc.perform(get("/dashboard/admin/resumen"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsuarios").value(40))
                .andExpect(jsonPath("$.totalAlumnosActivos").value(32))
                .andExpect(jsonPath("$.expedientesAbiertos").value(30))
                .andExpect(jsonPath("$.periodoVigente").value("2026"))
                .andExpect(jsonPath("$.usuariosPorRol.DOCENTE").value(8));
    }

    @Test
    @WithMockUser(roles = "DOCENTE")
    void resumenAdmin_conRolDocente_devuelve403() throws Exception {
        mockMvc.perform(get("/dashboard/admin/resumen"))
                .andExpect(status().isForbidden());
    }

    // --- DOCENTE ---

    @Test
    @WithMockUser(roles = "DOCENTE")
    void resumenDocente_conRolDocente_devuelve200ConPayloadEsperado() throws Exception {
        when(dashboardService.obtenerResumenDocente()).thenReturn(DocenteDashboardResponse.builder()
                .alumnosAsignados(5L)
                .entradasBitacoraHoy(3L)
                .alumnosSinPerfilDiscapacidad(2L)
                .build());

        mockMvc.perform(get("/dashboard/docente/resumen"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.alumnosAsignados").value(5))
                .andExpect(jsonPath("$.entradasBitacoraHoy").value(3))
                .andExpect(jsonPath("$.alumnosSinPerfilDiscapacidad").value(2));
    }

    @Test
    @WithMockUser(roles = "PADRE")
    void resumenDocente_conRolPadre_devuelve403() throws Exception {
        mockMvc.perform(get("/dashboard/docente/resumen"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "DOCENTE")
    void actividadRecienteDocente_conRolDocente_devuelve200ConLista() throws Exception {
        ActividadEntradaResponse entrada = ActividadEntradaResponse.builder()
                .id(1L)
                .tipo(TipoEntrada.COMUNICACION_FAMILIAR)
                .fecha(LocalDateTime.of(2026, 5, 25, 10, 30))
                .autor(UsuarioBitacoraResponse.builder()
                        .id(2L).nombre("Padre").apellido("Lopez").rol("PADRE").build())
                .alumnoId(7L).alumnoNombre("Carlos").alumnoApellido("Lopez")
                .titulo("Consulta")
                .descripcion("Hola profe")
                .build();
        when(dashboardService.obtenerActividadRecienteDocente(anyInt()))
                .thenReturn(List.of(entrada));

        mockMvc.perform(get("/dashboard/docente/actividad-reciente?limit=5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].tipo").value("COMUNICACION_FAMILIAR"))
                .andExpect(jsonPath("$[0].alumnoNombre").value("Carlos"))
                .andExpect(jsonPath("$[0].autor.rol").value("PADRE"));
    }

    @Test
    @WithMockUser(roles = "PADRE")
    void actividadRecienteDocente_conRolPadre_devuelve403() throws Exception {
        mockMvc.perform(get("/dashboard/docente/actividad-reciente"))
                .andExpect(status().isForbidden());
    }

    // --- PADRE ---

    @Test
    @WithMockUser(roles = "PADRE")
    void resumenPadre_conRolPadre_devuelve200ConHijos() throws Exception {
        HijoResumen hijo = HijoResumen.builder()
                .id(1L).nombre("Carlos").apellido("López")
                .grado("3ro").seccion("A").expedienteId(100L)
                .build();
        when(dashboardService.obtenerResumenPadre()).thenReturn(PadreDashboardResponse.builder()
                .hijos(List.of(hijo))
                .entradasNuevasHoy(7L)
                .build());

        mockMvc.perform(get("/dashboard/padre/resumen"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hijos[0].id").value(1))
                .andExpect(jsonPath("$.hijos[0].nombre").value("Carlos"))
                .andExpect(jsonPath("$.hijos[0].expedienteId").value(100))
                .andExpect(jsonPath("$.entradasNuevasHoy").value(7));
    }

    @Test
    @WithMockUser(roles = "SAANEE")
    void resumenPadre_conRolSaanee_devuelve403() throws Exception {
        mockMvc.perform(get("/dashboard/padre/resumen"))
                .andExpect(status().isForbidden());
    }

    // --- SAANEE ---

    @Test
    @WithMockUser(roles = "SAANEE")
    void resumenSaanee_conRolSaanee_devuelve200ConTotalAlumnos() throws Exception {
        when(dashboardService.obtenerResumenSaanee()).thenReturn(SaaneeDashboardResponse.builder()
                .totalAlumnosActivos(50L)
                .build());

        mockMvc.perform(get("/dashboard/saanee/resumen"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAlumnosActivos").value(50));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void resumenSaanee_conRolAdmin_devuelve403() throws Exception {
        mockMvc.perform(get("/dashboard/saanee/resumen"))
                .andExpect(status().isForbidden());
    }
}
