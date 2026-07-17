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
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.PeriodoLectivoRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.AperturaPeriodoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.ConfiguracionPeriodoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.exception.IllegalOperationException;
import pe.edu.pucp.signaedu.signaedu_backend.security.CustomUserDetailsService;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtAuthenticationFilter;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtService;
import pe.edu.pucp.signaedu.signaedu_backend.service.ConfiguracionService;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ConfiguracionController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@ActiveProfiles("test")
class ConfiguracionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ConfiguracionService configuracionService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    private String body(String periodo) throws Exception {
        PeriodoLectivoRequest req = new PeriodoLectivoRequest();
        req.setPeriodoLectivo(periodo);
        return objectMapper.writeValueAsString(req);
    }

    // ---------- PUT /admin/configuracion/periodo-vigente : formato ----------

    @Test
    @WithMockUser(authorities = {"EXPEDIENTE_CREAR"})
    void putDebeAceptarUnAnioDeCuatroDigitos() throws Exception {
        when(configuracionService.actualizarPeriodoVigente("2027")).thenReturn(
                ConfiguracionPeriodoResponse.builder()
                        .periodoLectivoVigente("2027").periodoAbierto(false).expedientesActivos(0).build());

        mockMvc.perform(put("/admin/configuracion/periodo-vigente")
                        .contentType(MediaType.APPLICATION_JSON).content(body("2027")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.periodoLectivoVigente").value("2027"));
    }

    @Test
    @WithMockUser(authorities = {"EXPEDIENTE_CREAR"})
    void putDebeRechazarPeriodoDeMasDeCuatroDigitos() throws Exception {
        mockMvc.perform(put("/admin/configuracion/periodo-vigente")
                        .contentType(MediaType.APPLICATION_JSON).content(body("20271")))
                .andExpect(status().isBadRequest());

        verify(configuracionService, never()).actualizarPeriodoVigente(anyString());
    }

    @Test
    @WithMockUser(authorities = {"EXPEDIENTE_CREAR"})
    void putDebeRechazarPeriodoNoNumerico() throws Exception {
        mockMvc.perform(put("/admin/configuracion/periodo-vigente")
                        .contentType(MediaType.APPLICATION_JSON).content(body("abcd")))
                .andExpect(status().isBadRequest());

        verify(configuracionService, never()).actualizarPeriodoVigente(anyString());
    }

    @Test
    @WithMockUser(authorities = {"EXPEDIENTE_CREAR"})
    void putDebeRechazarPeriodoVacio() throws Exception {
        mockMvc.perform(put("/admin/configuracion/periodo-vigente")
                        .contentType(MediaType.APPLICATION_JSON).content(body("")))
                .andExpect(status().isBadRequest());
    }

    // ---------- PUT periodo-vigente : guarda de orden ----------

    /** El servicio rechaza el cambio con el periodo abierto; el error llega como 400. */
    @Test
    @WithMockUser(authorities = {"EXPEDIENTE_CREAR"})
    void putDebeDevolverErrorSiElPeriodoVigenteSigueAbierto() throws Exception {
        when(configuracionService.actualizarPeriodoVigente("2027"))
                .thenThrow(new IllegalOperationException(
                        "No se puede cambiar el periodo vigente: el periodo 2026 tiene 6 "
                                + "expediente(s) activo(s). Cierralo primero."));

        mockMvc.perform(put("/admin/configuracion/periodo-vigente")
                        .contentType(MediaType.APPLICATION_JSON).content(body("2027")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value(
                        org.hamcrest.Matchers.containsString("Cierralo primero")));
    }

    // ---------- permisos ----------

    @Test
    @WithMockUser(authorities = {"BITACORA_LEER"})
    void putDebeRechazarSinPermisoExpedienteCrear() throws Exception {
        mockMvc.perform(put("/admin/configuracion/periodo-vigente")
                        .contentType(MediaType.APPLICATION_JSON).content(body("2027")))
                .andExpect(status().isForbidden());
    }

    // ---------- POST aperturar-periodo : omitidos ----------

    @Test
    @WithMockUser(authorities = {"EXPEDIENTE_CREAR"})
    void postAperturarDebeExponerLosOmitidos() throws Exception {
        when(configuracionService.aperturarPeriodo()).thenReturn(
                AperturaPeriodoResponse.builder()
                        .periodoLectivo("2027").expedientesCreados(4).expedientesOmitidos(2).build());

        mockMvc.perform(post("/admin/configuracion/aperturar-periodo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.expedientesCreados").value(4))
                .andExpect(jsonPath("$.expedientesOmitidos").value(2));
    }
}
