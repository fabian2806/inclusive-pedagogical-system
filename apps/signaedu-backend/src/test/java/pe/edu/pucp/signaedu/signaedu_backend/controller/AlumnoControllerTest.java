package pe.edu.pucp.signaedu.signaedu_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import pe.edu.pucp.signaedu.signaedu_backend.config.SecurityConfig;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.AlumnoCreateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.AlumnoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.security.CustomUserDetailsService;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtAuthenticationFilter;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtService;
import pe.edu.pucp.signaedu.signaedu_backend.service.AlumnoService;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AlumnoController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@ActiveProfiles("test")
class AlumnoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

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
    @WithMockUser(authorities = {"ALUMNO_CREAR", "ALUMNO_LEER", "ALUMNO_ACTUALIZAR", "ALUMNO_DESACTIVAR"})
    void debeCrearAlumno201ConRolAdmin() throws Exception {
        AlumnoCreateRequest request = new AlumnoCreateRequest();
        request.setNombre("Carlos");
        request.setApellido("López");
        request.setFechaNacimiento(LocalDate.of(2015, 3, 10));
        request.setGrado("3ro");
        request.setSeccion("A");

        when(alumnoService.crearAlumno(any(AlumnoCreateRequest.class)))
                .thenReturn(alumnoResponse());

        mockMvc.perform(post("/admin/alumnos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nombre").value("Carlos"));
    }

    @Test
    @WithMockUser(authorities = {"ALUMNO_CREAR", "ALUMNO_LEER", "ALUMNO_ACTUALIZAR", "ALUMNO_DESACTIVAR"})
    void debeListarAlumnos200() throws Exception {
        when(alumnoService.listarAlumnos()).thenReturn(List.of(alumnoResponse()));

        mockMvc.perform(get("/admin/alumnos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].grado").value("3ro"));
    }

    @Test
    @WithMockUser(authorities = {"ALUMNO_CREAR", "ALUMNO_LEER", "ALUMNO_ACTUALIZAR", "ALUMNO_DESACTIVAR"})
    void debeAsignarDocente200() throws Exception {
        when(alumnoService.asignarDocente(1L, 10L)).thenReturn(alumnoResponse());

        mockMvc.perform(post("/admin/alumnos/1/docentes/10"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = {"USUARIO_LEER"})
    void debeRetornar403SinPermisoAlumnoLeer() throws Exception {
        mockMvc.perform(get("/admin/alumnos"))
                .andExpect(status().isForbidden());
    }
}
