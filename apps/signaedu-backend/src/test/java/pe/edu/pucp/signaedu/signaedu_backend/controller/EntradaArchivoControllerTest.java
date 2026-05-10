package pe.edu.pucp.signaedu.signaedu_backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import pe.edu.pucp.signaedu.signaedu_backend.config.SecurityConfig;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.ArchivoAdjuntoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.EntradaArchivoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.security.CustomUserDetailsService;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtAuthenticationFilter;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtService;
import pe.edu.pucp.signaedu.signaedu_backend.service.ArchivoDescargaResource;
import pe.edu.pucp.signaedu.signaedu_backend.service.EntradaArchivoService;

import java.io.ByteArrayInputStream;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EntradaArchivoController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@ActiveProfiles("test")
class EntradaArchivoControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private EntradaArchivoService entradaArchivoService;
    @MockitoBean private JwtService jwtService;
    @MockitoBean private CustomUserDetailsService customUserDetailsService;

    private EntradaArchivoResponse responseEjemplo() {
        return EntradaArchivoResponse.builder()
                .id(15L)
                .entradaId(30L)
                .archivo(ArchivoAdjuntoResponse.builder()
                        .id(7L).nombreOriginal("foto.jpg")
                        .mimeType("image/jpeg").tamano(2048L).build())
                .build();
    }

    @Test
    @WithMockUser(authorities = {"BITACORA_ESCRIBIR"})
    void postDebeAdjuntarArchivoSinDescripcion() throws Exception {
        when(entradaArchivoService.adjuntar(eq(5L), eq(30L), isNull(), any()))
                .thenReturn(responseEjemplo());

        MockMultipartFile archivo = new MockMultipartFile(
                "archivo", "foto.jpg", "image/jpeg", "binario".getBytes());

        mockMvc.perform(multipart("/alumnos/5/bitacora/30/archivos").file(archivo))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(15))
                .andExpect(jsonPath("$.archivo.nombreOriginal").value("foto.jpg"));
    }

    @Test
    @WithMockUser(authorities = {"BITACORA_LEER"})
    void postDebeRechazarSinPermisoEscribir() throws Exception {
        MockMultipartFile archivo = new MockMultipartFile(
                "archivo", "foto.jpg", "image/jpeg", "x".getBytes());

        mockMvc.perform(multipart("/alumnos/5/bitacora/30/archivos").file(archivo))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = {"BITACORA_LEER"})
    void getListarDevuelveArchivosDeLaEntrada() throws Exception {
        when(entradaArchivoService.listar(eq(5L), eq(30L)))
                .thenReturn(List.of(responseEjemplo()));

        mockMvc.perform(get("/alumnos/5/bitacora/30/archivos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(15));
    }

    @Test
    @WithMockUser(authorities = {"BITACORA_LEER"})
    void getDescargarRetornaArchivoConHeaders() throws Exception {
        ArchivoDescargaResource recurso = new ArchivoDescargaResource(
                new ByteArrayInputStream("data".getBytes()),
                "foto.jpg",
                "image/jpeg",
                4L);
        when(entradaArchivoService.descargar(eq(5L), eq(15L))).thenReturn(recurso);

        mockMvc.perform(get("/alumnos/5/bitacora/archivos/15/descargar"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "image/jpeg"))
                .andExpect(header().string("Content-Length", "4"))
                .andExpect(header().exists("Content-Disposition"));
    }
}
