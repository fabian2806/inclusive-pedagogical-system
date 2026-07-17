package pe.edu.pucp.signaedu.signaedu_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import pe.edu.pucp.signaedu.signaedu_backend.config.SecurityConfig;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.DocumentoExpedienteCreateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.ArchivoAdjuntoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.DocumentoExpedienteResponse;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoDocumento;
import pe.edu.pucp.signaedu.signaedu_backend.security.CustomUserDetailsService;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtAuthenticationFilter;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtService;
import pe.edu.pucp.signaedu.signaedu_backend.service.ArchivoDescargaResource;
import pe.edu.pucp.signaedu.signaedu_backend.service.DocumentoExpedienteService;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DocumentoExpedienteController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@ActiveProfiles("test")
class DocumentoExpedienteControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockitoBean private DocumentoExpedienteService documentoService;
    @MockitoBean private JwtService jwtService;
    @MockitoBean private CustomUserDetailsService customUserDetailsService;

    private DocumentoExpedienteResponse responseEjemplo() {
        return DocumentoExpedienteResponse.builder()
                .id(1L)
                .titulo("PEP 2026")
                .estado(EstadoDocumento.VIGENTE)
                .archivo(ArchivoAdjuntoResponse.builder()
                        .id(1L).nombreOriginal("doc.pdf")
                        .mimeType("application/pdf").tamano(1024L).build())
                .entradaExpedienteId(50L)
                .build();
    }

    private DocumentoExpedienteCreateRequest requestValido() {
        DocumentoExpedienteCreateRequest req = new DocumentoExpedienteCreateRequest();
        req.setTipoDocumentoId(1L);
        req.setTitulo("PEP 2026");
        req.setFechaEmision(LocalDate.of(2026, 1, 15));
        return req;
    }

    @Test
    @WithMockUser(authorities = {"DOCUMENTO_EXPEDIENTE_ESCRIBIR"})
    void postDebeSubirDocumentoConPermisoEscribir() throws Exception {
        when(documentoService.subir(eq(5L), any(), any())).thenReturn(responseEjemplo());

        MockMultipartFile data = new MockMultipartFile(
                "data", "data", "application/json",
                objectMapper.writeValueAsBytes(requestValido()));
        MockMultipartFile archivo = new MockMultipartFile(
                "archivo", "doc.pdf", "application/pdf", "contenido".getBytes());

        mockMvc.perform(multipart("/alumnos/5/documentos").file(data).file(archivo))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.titulo").value("PEP 2026"))
                .andExpect(jsonPath("$.estado").value("VIGENTE"));
    }

    @Test
    @WithMockUser(authorities = {"DOCUMENTO_EXPEDIENTE_LEER"})
    void postDebeRechazarSinPermisoEscribir() throws Exception {
        MockMultipartFile data = new MockMultipartFile(
                "data", "data", "application/json",
                objectMapper.writeValueAsBytes(requestValido()));
        MockMultipartFile archivo = new MockMultipartFile(
                "archivo", "doc.pdf", "application/pdf", "x".getBytes());

        mockMvc.perform(multipart("/alumnos/5/documentos").file(data).file(archivo))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = {"DOCUMENTO_EXPEDIENTE_LEER"})
    void getListarDevuelveDocumentos() throws Exception {
        when(documentoService.listar(eq(5L), any())).thenReturn(List.of(responseEjemplo()));

        mockMvc.perform(get("/alumnos/5/documentos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
    }

    @Test
    @WithMockUser(authorities = {"DOCUMENTO_EXPEDIENTE_ESCRIBIR"})
    void getListarRechazaSinPermisoLeer() throws Exception {
        mockMvc.perform(get("/alumnos/5/documentos"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = {"DOCUMENTO_EXPEDIENTE_LEER"})
    void getDescargarRetornaArchivoConContentDisposition() throws Exception {
        ArchivoDescargaResource recurso = new ArchivoDescargaResource(
                new ByteArrayInputStream("contenido pdf".getBytes()),
                "doc.pdf",
                "application/pdf",
                13L);
        when(documentoService.descargar(eq(5L), eq(1L))).thenReturn(recurso);

        mockMvc.perform(get("/alumnos/5/documentos/1/descargar"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(header().string("Content-Length", "13"))
                .andExpect(header().exists("Content-Disposition"));
    }
}
