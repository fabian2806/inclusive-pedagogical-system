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
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.IndicadorCreateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.IndicadorResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.UsuarioSimpleResponse;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.AreaCurricular;
import pe.edu.pucp.signaedu.signaedu_backend.security.CustomUserDetailsService;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtAuthenticationFilter;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtService;
import pe.edu.pucp.signaedu.signaedu_backend.service.IndicadorService;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(IndicadorController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@ActiveProfiles("test")
class IndicadorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private IndicadorService indicadorService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    private IndicadorResponse responseEjemplo() {
        return IndicadorResponse.builder()
                .id(1L)
                .nombre("Comprensión LSP")
                .descripcion("desc")
                .categoria("Comunicación")
                .areaCurricular(AreaCurricular.COMUNICACION)
                .usuarioCreador(UsuarioSimpleResponse.builder()
                        .id(10L).nombre("María").apellido("Torres").correo("m@signaedu.pe").build())
                .activo(true)
                .build();
    }

    private IndicadorCreateRequest requestValido() {
        IndicadorCreateRequest req = new IndicadorCreateRequest();
        req.setNombre("Comprensión LSP");
        req.setDescripcion("desc");
        req.setCategoria("Comunicación");
        req.setAreaCurricular(AreaCurricular.COMUNICACION);
        return req;
    }

    // ---------- POST /indicadores ----------

    @Test
    @WithMockUser(authorities = {"INDICADOR_GESTIONAR"})
    void postDebeCrearConPermisoGestionar() throws Exception {
        when(indicadorService.crear(any(IndicadorCreateRequest.class)))
                .thenReturn(responseEjemplo());

        mockMvc.perform(post("/indicadores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestValido())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nombre").value("Comprensión LSP"))
                .andExpect(jsonPath("$.areaCurricular").value("COMUNICACION"))
                .andExpect(jsonPath("$.usuarioCreador.id").value(10))
                .andExpect(jsonPath("$.activo").value(true));
    }

    @Test
    @WithMockUser(authorities = {"INDICADOR_LEER"})
    void postDebeRechazarSinPermisoGestionar() throws Exception {
        mockMvc.perform(post("/indicadores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestValido())))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = {"INDICADOR_GESTIONAR"})
    void postDebeRechazarNombreVacio() throws Exception {
        IndicadorCreateRequest req = requestValido();
        req.setNombre("");

        mockMvc.perform(post("/indicadores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(authorities = {"INDICADOR_GESTIONAR"})
    void postDebeRechazarSinAreaCurricular() throws Exception {
        IndicadorCreateRequest req = requestValido();
        req.setAreaCurricular(null);

        mockMvc.perform(post("/indicadores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    // ---------- GET /indicadores ----------

    @Test
    @WithMockUser(authorities = {"INDICADOR_LEER"})
    void getDebeListarConPermisoLeer() throws Exception {
        when(indicadorService.listar(any(), any(), any()))
                .thenReturn(List.of(responseEjemplo()));

        mockMvc.perform(get("/indicadores"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].areaCurricular").value("COMUNICACION"));
    }

    @Test
    @WithMockUser(authorities = {"USUARIO_LEER"}) // permiso ajeno al módulo
    void getDebeRechazarSinPermisoLeer() throws Exception {
        mockMvc.perform(get("/indicadores"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = {"INDICADOR_LEER"})
    void getDebePropagarFiltrosAlService() throws Exception {
        when(indicadorService.listar(eq(AreaCurricular.MATEMATICA), eq("lsp"), eq(true)))
                .thenReturn(List.of());

        mockMvc.perform(get("/indicadores")
                        .param("areaCurricular", "MATEMATICA")
                        .param("q", "lsp")
                        .param("activo", "true"))
                .andExpect(status().isOk());

        verify(indicadorService).listar(
                eq(AreaCurricular.MATEMATICA), eq("lsp"), eq(true));
    }
}
