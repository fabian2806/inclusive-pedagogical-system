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
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.AlumnoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.security.CustomUserDetailsService;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtAuthenticationFilter;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtService;
import pe.edu.pucp.signaedu.signaedu_backend.service.AlumnoService;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AlumnoConsultaController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@ActiveProfiles("test")
class AlumnoConsultaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AlumnoService alumnoService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    private AlumnoResponse alumnoResponse() {
        return AlumnoResponse.builder()
                .id(1L)
                .nombre("Carlos")
                .apellido("López")
                .fechaNacimiento(LocalDate.of(2015, 3, 10))
                .grado("3ro")
                .seccion("A")
                .estado("ACTIVO")
                .docentes(Collections.emptyList())
                .padres(Collections.emptyList())
                .build();
    }

    @Test
    @WithMockUser(authorities = {"ALUMNO_LEER"})
    void listarAlumnos_conPermisoLeer_devuelve200() throws Exception {
        when(alumnoService.listarAlumnos()).thenReturn(List.of(alumnoResponse()));

        mockMvc.perform(get("/alumnos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].grado").value("3ro"));
    }

    @Test
    @WithMockUser(authorities = {"USUARIO_LEER"})
    void listarAlumnos_sinPermisoLeer_devuelve403() throws Exception {
        mockMvc.perform(get("/alumnos"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = {"ALUMNO_LEER"})
    void obtenerAlumno_conPermisoLeer_devuelve200() throws Exception {
        when(alumnoService.obtenerAlumnoPorId(1L)).thenReturn(alumnoResponse());

        mockMvc.perform(get("/alumnos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @WithMockUser(authorities = {"USUARIO_LEER"})
    void obtenerAlumno_sinPermisoLeer_devuelve403() throws Exception {
        mockMvc.perform(get("/alumnos/1"))
                .andExpect(status().isForbidden());
    }
}
