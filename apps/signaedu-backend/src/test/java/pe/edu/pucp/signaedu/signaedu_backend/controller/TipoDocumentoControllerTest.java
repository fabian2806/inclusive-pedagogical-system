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
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.TipoDocumentoCreateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.TipoDocumentoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.security.CustomUserDetailsService;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtAuthenticationFilter;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtService;
import pe.edu.pucp.signaedu.signaedu_backend.service.TipoDocumentoService;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TipoDocumentoController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@ActiveProfiles("test")
class TipoDocumentoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private TipoDocumentoService tipoDocumentoService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    private TipoDocumentoResponse tipoResponse() {
        return TipoDocumentoResponse.builder()
                .id(10L)
                .nombre("Informe Especial")
                .esObligatorio(false)
                .esVersionable(false)
                .esPeriodico(false)
                .esPredefinido(false)
                .build();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void debeCrearTipoDocumento201ConRolAdmin() throws Exception {
        TipoDocumentoCreateRequest request = new TipoDocumentoCreateRequest();
        request.setNombre("Informe Especial");
        request.setEsObligatorio(false);
        request.setEsVersionable(false);
        request.setEsPeriodico(false);

        when(tipoDocumentoService.crearTipoDocumento(any(TipoDocumentoCreateRequest.class)))
                .thenReturn(tipoResponse());

        mockMvc.perform(post("/admin/tipos-documento")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nombre").value("Informe Especial"))
                .andExpect(jsonPath("$.esPredefinido").value(false));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void debeListarTiposDocumento200() throws Exception {
        when(tipoDocumentoService.listarTiposDocumento()).thenReturn(List.of(tipoResponse()));

        mockMvc.perform(get("/admin/tipos-documento"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombre").value("Informe Especial"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void debeEliminarTipoDocumento204() throws Exception {
        mockMvc.perform(delete("/admin/tipos-documento/10"))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(roles = "DOCENTE")
    void debeRetornar403SinRolAdmin() throws Exception {
        mockMvc.perform(get("/admin/tipos-documento"))
                .andExpect(status().isForbidden());
    }
}
