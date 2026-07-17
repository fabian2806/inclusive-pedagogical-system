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
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.ExpedientePeriodoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.security.CustomUserDetailsService;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtAuthenticationFilter;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtService;
import pe.edu.pucp.signaedu.signaedu_backend.service.ExpedienteConsultaService;

import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ExpedienteController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@ActiveProfiles("test")
class ExpedienteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ExpedienteConsultaService expedienteConsultaService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @WithMockUser(authorities = {"EXPEDIENTE_LEER"})
    void getDebeListarPeriodosConPermisoLeer() throws Exception {
        when(expedienteConsultaService.listarPeriodos(eq(5L))).thenReturn(List.of(
                ExpedientePeriodoResponse.builder()
                        .periodoLectivo("2026").estado("ACTIVO").vigente(true).editable(true).build(),
                ExpedientePeriodoResponse.builder()
                        .periodoLectivo("2024").estado("INACTIVO").vigente(false).editable(false).build()));

        mockMvc.perform(get("/alumnos/5/expedientes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].periodoLectivo").value("2026"))
                .andExpect(jsonPath("$[0].editable").value(true))
                .andExpect(jsonPath("$[1].periodoLectivo").value("2024"))
                .andExpect(jsonPath("$[1].estado").value("INACTIVO"))
                .andExpect(jsonPath("$[1].editable").value(false));
    }

    /**
     * El admin no lee contenido del expediente: no tiene EXPEDIENTE_LEER
     * (V5 se lo da solo a docente, padre y SAANEE). El historial no cambia eso.
     */
    @Test
    @WithMockUser(authorities = {"EXPEDIENTE_CREAR"})
    void getDebeRechazarSinPermisoLeer() throws Exception {
        mockMvc.perform(get("/alumnos/5/expedientes"))
                .andExpect(status().isForbidden());
    }
}
