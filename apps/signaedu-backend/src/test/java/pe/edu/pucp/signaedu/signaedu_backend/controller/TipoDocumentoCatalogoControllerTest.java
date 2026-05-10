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
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.TipoDocumentoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.security.CustomUserDetailsService;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtAuthenticationFilter;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtService;
import pe.edu.pucp.signaedu.signaedu_backend.service.TipoDocumentoService;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TipoDocumentoCatalogoController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@ActiveProfiles("test")
class TipoDocumentoCatalogoControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private TipoDocumentoService tipoDocumentoService;
    @MockitoBean private JwtService jwtService;
    @MockitoBean private CustomUserDetailsService customUserDetailsService;

    @Test
    @WithMockUser(authorities = {"DOCUMENTO_EXPEDIENTE_LEER"})
    void getDevuelveCatalogoConPermisoDocumentoLeer() throws Exception {
        when(tipoDocumentoService.listarTiposDocumento())
                .thenReturn(List.of(TipoDocumentoResponse.builder()
                        .id(1L).nombre("PEP").esObligatorio(true)
                        .esVersionable(true).esPeriodico(false)
                        .esPredefinido(true).build()));

        mockMvc.perform(get("/tipos-documento"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombre").value("PEP"));
    }

    @Test
    @WithMockUser(authorities = {"TIPO_DOCUMENTO_GESTIONAR"})
    void getRechazaConPermisoSoloAdmin() throws Exception {
        // El permiso de admin (TIPO_DOCUMENTO_GESTIONAR) no abre este endpoint;
        // este es exclusivo de DOCUMENTO_EXPEDIENTE_LEER. Garantiza que no se
        // mezclan accidentalmente los dos permisos.
        mockMvc.perform(get("/tipos-documento"))
                .andExpect(status().isForbidden());
    }
}
