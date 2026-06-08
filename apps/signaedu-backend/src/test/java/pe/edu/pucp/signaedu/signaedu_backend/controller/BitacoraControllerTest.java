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
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.EntradaExpedienteRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.EntradaExpedienteResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.UsuarioBitacoraResponse;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoEntrada;
import pe.edu.pucp.signaedu.signaedu_backend.security.CustomUserDetailsService;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtAuthenticationFilter;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtService;
import pe.edu.pucp.signaedu.signaedu_backend.service.BitacoraService;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BitacoraController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@ActiveProfiles("test")
class BitacoraControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private BitacoraService bitacoraService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    private EntradaExpedienteResponse responseEjemplo() {
        return EntradaExpedienteResponse.builder()
                .id(1L)
                .expedienteId(100L)
                .tipo("OBSERVACION_PEDAGOGICA")
                .autor(UsuarioBitacoraResponse.builder()
                        .id(10L).nombre("María").apellido("Torres").rol("DOCENTE").build())
                .titulo("Avance lectura")
                .descripcion("Sofía leyó 8/10 palabras.")
                .build();
    }

    private EntradaExpedienteRequest requestValido() {
        EntradaExpedienteRequest req = new EntradaExpedienteRequest();
        req.setTipo(TipoEntrada.OBSERVACION_PEDAGOGICA);
        req.setTitulo("Avance lectura");
        req.setDescripcion("Sofía leyó 8/10 palabras.");
        return req;
    }

    // ---------- POST /alumnos/{id}/bitacora ----------

    @Test
    @WithMockUser(authorities = {"BITACORA_ESCRIBIR"})
    void postDebeCrearEntradaConPermisoEscribir() throws Exception {
        when(bitacoraService.crear(eq(1L), any(EntradaExpedienteRequest.class)))
                .thenReturn(responseEjemplo());

        mockMvc.perform(post("/alumnos/1/bitacora")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestValido())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.titulo").value("Avance lectura"))
                .andExpect(jsonPath("$.autor.rol").value("DOCENTE"));
    }

    @Test
    @WithMockUser(authorities = {"BITACORA_LEER"})
    void postDebeRechazarSinPermisoEscribir() throws Exception {
        mockMvc.perform(post("/alumnos/1/bitacora")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestValido())))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = {"BITACORA_ESCRIBIR"})
    void postDebeRechazarRequestSinDescripcion() throws Exception {
        EntradaExpedienteRequest req = new EntradaExpedienteRequest();
        req.setTipo(TipoEntrada.OBSERVACION_PEDAGOGICA);
        req.setDescripcion("");

        mockMvc.perform(post("/alumnos/1/bitacora")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(authorities = {"BITACORA_ESCRIBIR"})
    void postDebeRechazarTituloMayorA150Caracteres() throws Exception {
        EntradaExpedienteRequest req = requestValido();
        req.setTitulo("a".repeat(151));

        mockMvc.perform(post("/alumnos/1/bitacora")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    // ---------- GET /alumnos/{id}/bitacora ----------

    @Test
    @WithMockUser(authorities = {"BITACORA_LEER"})
    void getDebeListarConPermisoLeer() throws Exception {
        when(bitacoraService.listar(eq(1L), any(), any(), any()))
                .thenReturn(List.of(responseEjemplo()));

        mockMvc.perform(get("/alumnos/1/bitacora"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].autor.rol").value("DOCENTE"));
    }

    @Test
    @WithMockUser(authorities = {"BITACORA_ESCRIBIR"})
    void getDebeRechazarSinPermisoLeer() throws Exception {
        mockMvc.perform(get("/alumnos/1/bitacora"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = {"BITACORA_LEER"})
    void getDebePasarFiltrosDeQueryParamAlService() throws Exception {
        when(bitacoraService.listar(eq(1L), eq(TipoEntrada.OBSERVACION_PEDAGOGICA), any(), any()))
                .thenReturn(List.of());

        mockMvc.perform(get("/alumnos/1/bitacora")
                        .param("tipo", "OBSERVACION_PEDAGOGICA")
                        .param("desde", "2026-01-01T00:00:00")
                        .param("hasta", "2026-12-31T23:59:00"))
                .andExpect(status().isOk());

        verify(bitacoraService).listar(
                eq(1L), eq(TipoEntrada.OBSERVACION_PEDAGOGICA), any(), any());
    }

    // ---------- GET /alumnos/{id}/bitacora/export (Fase 5) ----------

    @Test
    @WithMockUser(authorities = {"EXPEDIENTE_EXPORTAR"})
    void exportDebeRetornarCsvConPermisoExportar() throws Exception {
        String csvBody = "id,fecha,tipo,autor,rol_autor,titulo,contenido,"
                + "entrada_raiz_id,evento_id,archivos_adjuntos_count\r\n";
        when(bitacoraService.exportarCsv(eq(1L), any(), any(), any()))
                .thenReturn(csvBody);

        var resultado = mockMvc.perform(get("/alumnos/1/bitacora/export"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("text/csv"))
                .andExpect(header().string("Content-Disposition",
                        org.hamcrest.Matchers.containsString("attachment")))
                .andExpect(header().string("Content-Disposition",
                        org.hamcrest.Matchers.containsString("bitacora_alumno_1_")))
                .andReturn();

        assertThat(resultado.getResponse().getContentAsString())
                .isEqualTo(csvBody);
    }

    @Test
    @WithMockUser(authorities = {"BITACORA_LEER"})
    void exportDebeRechazarSinPermisoExportar() throws Exception {
        // BITACORA_LEER (lo tiene SAANEE) NO incluye EXPEDIENTE_EXPORTAR:
        // segun PERMISOS_RBAC, exportar es solo DOCENTE y PADRE.
        mockMvc.perform(get("/alumnos/1/bitacora/export"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = {"EXPEDIENTE_EXPORTAR"})
    void exportDebePasarFiltrosDeQueryParamAlService() throws Exception {
        when(bitacoraService.exportarCsv(
                eq(1L), eq(TipoEntrada.OBSERVACION_PEDAGOGICA), any(), any()))
                .thenReturn("");

        mockMvc.perform(get("/alumnos/1/bitacora/export")
                        .param("tipo", "OBSERVACION_PEDAGOGICA")
                        .param("desde", "2026-01-01T00:00:00")
                        .param("hasta", "2026-12-31T23:59:00"))
                .andExpect(status().isOk());

        verify(bitacoraService).exportarCsv(
                eq(1L), eq(TipoEntrada.OBSERVACION_PEDAGOGICA), any(), any());
    }
}
