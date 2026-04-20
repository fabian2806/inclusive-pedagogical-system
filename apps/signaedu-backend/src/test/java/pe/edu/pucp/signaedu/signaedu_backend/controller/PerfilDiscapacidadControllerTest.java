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
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.ApoyoRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.BarreraRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.FortalezaRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.PerfilDiscapacidadRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.PerfilDiscapacidadResponse;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoBarrera;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoDimension;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoFuente;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoFuncion;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoIntensidad;
import pe.edu.pucp.signaedu.signaedu_backend.security.CustomUserDetailsService;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtAuthenticationFilter;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtService;
import pe.edu.pucp.signaedu.signaedu_backend.service.PerfilDiscapacidadService;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PerfilDiscapacidadController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@ActiveProfiles("test")
class PerfilDiscapacidadControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PerfilDiscapacidadService perfilDiscapacidadService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    private PerfilDiscapacidadResponse perfilResponse() {
        return PerfilDiscapacidadResponse.builder()
                .id(1L)
                .alumnoId(1L)
                .modoComunicacionPreferido("LSP")
                .observacionesGenerales("Observaciones")
                .barreras(List.of())
                .fortalezas(List.of())
                .apoyos(List.of())
                .build();
    }

    private PerfilDiscapacidadRequest perfilRequest() {
        PerfilDiscapacidadRequest req = new PerfilDiscapacidadRequest();
        req.setModoComunicacionPreferido("LSP");
        req.setObservacionesGenerales("obs");
        req.setBarreras(List.of(new BarreraRequest(TipoBarrera.PEDAGOGICA, "desc")));
        req.setFortalezas(List.of(new FortalezaRequest(TipoDimension.MOTIVACIONES, "desc")));
        req.setApoyos(List.of(new ApoyoRequest(TipoIntensidad.LIMITADO, TipoFuncion.ACCESO_INFORMACION, "desc", TipoFuente.PERSONAS)));
        return req;
    }

    @Test
    @WithMockUser(authorities = {"PERFIL_DISCAPACIDAD_LEER"})
    void debeRetornarPerfilConPermisoLeer() throws Exception {
        when(perfilDiscapacidadService.obtenerPorAlumnoId(1L)).thenReturn(perfilResponse());

        mockMvc.perform(get("/alumnos/1/perfil-discapacidad"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.alumnoId").value(1))
                .andExpect(jsonPath("$.modoComunicacionPreferido").value("LSP"));
    }

    @Test
    @WithMockUser(authorities = {"ALUMNO_LEER"})
    void debeRechazarGetSinPermiso() throws Exception {
        mockMvc.perform(get("/alumnos/1/perfil-discapacidad"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = {"PERFIL_DISCAPACIDAD_ESCRIBIR"})
    void debeGuardarPerfilConPermisoEscribir() throws Exception {
        when(perfilDiscapacidadService.guardar(eq(1L), any(PerfilDiscapacidadRequest.class)))
                .thenReturn(perfilResponse());

        mockMvc.perform(put("/alumnos/1/perfil-discapacidad")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(perfilRequest())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @WithMockUser(authorities = {"PERFIL_DISCAPACIDAD_LEER"})
    void debeRechazarPutSinPermiso() throws Exception {
        mockMvc.perform(put("/alumnos/1/perfil-discapacidad")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(perfilRequest())))
                .andExpect(status().isForbidden());
    }
}
