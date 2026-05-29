package pe.edu.pucp.signaedu.signaedu_backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import pe.edu.pucp.signaedu.signaedu_backend.config.SecurityConfig;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.NotificacionResponse;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoNotificacion;
import pe.edu.pucp.signaedu.signaedu_backend.security.CustomUserDetailsService;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtAuthenticationFilter;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtService;
import pe.edu.pucp.signaedu.signaedu_backend.service.NotificacionService;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(NotificacionController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@ActiveProfiles("test")
class NotificacionControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private NotificacionService notificacionService;
    @MockitoBean private JwtService jwtService;
    @MockitoBean private CustomUserDetailsService customUserDetailsService;

    @Test
    @WithMockUser(authorities = {"NOTIFICACION_LEER"})
    void listarMias_conAuthority_devuelve200ConLista() throws Exception {
        when(notificacionService.listarMias()).thenReturn(List.of(
                NotificacionResponse.builder()
                        .id(1L)
                        .mensaje("Te invito al evento")
                        .referenciaTipo(TipoNotificacion.EVENTO.name())
                        .referenciaId(100L)
                        .fechaCreacion(LocalDateTime.now())
                        .build()
        ));

        mockMvc.perform(get("/notificaciones/mias"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].referenciaTipo").value("EVENTO"));
    }

    @Test
    @WithMockUser(authorities = {"EVENTO_LEER"})
    void listarMias_sinAuthority_devuelve403() throws Exception {
        mockMvc.perform(get("/notificaciones/mias"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = {"NOTIFICACION_LEER"})
    void marcarLeida_conAuthority_devuelve200() throws Exception {
        when(notificacionService.marcarLeida(anyLong()))
                .thenReturn(NotificacionResponse.builder().id(1L).build());

        mockMvc.perform(patch("/notificaciones/1/marcar-leida")
                        .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = {"NOTIFICACION_LEER"})
    void marcarTodasLeidas_conAuthority_devuelve200ConConteo() throws Exception {
        when(notificacionService.marcarTodasLeidas()).thenReturn(7);

        mockMvc.perform(patch("/notificaciones/marcar-todas-leidas")
                        .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.marcadas").value(7));
    }
}
