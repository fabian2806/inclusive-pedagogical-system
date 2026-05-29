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
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.EventoCreateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.ResponderAsistenciaRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.EventoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.ResultadoEventoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.UsuarioBitacoraResponse;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoAsistencia;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.ModalidadEvento;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoEvento;
import pe.edu.pucp.signaedu.signaedu_backend.security.CustomUserDetailsService;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtAuthenticationFilter;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtService;
import pe.edu.pucp.signaedu.signaedu_backend.service.EventoService;
import pe.edu.pucp.signaedu.signaedu_backend.service.EventoUsuarioService;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EventoController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@ActiveProfiles("test")
class EventoControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockitoBean private EventoService eventoService;
    @MockitoBean private EventoUsuarioService eventoUsuarioService;
    @MockitoBean private JwtService jwtService;
    @MockitoBean private CustomUserDetailsService customUserDetailsService;

    private EventoCreateRequest crearRequest() {
        EventoCreateRequest req = new EventoCreateRequest();
        req.setTitulo("Reunion familia");
        req.setFechaInicio(LocalDateTime.now().plusDays(1));
        req.setFechaFin(LocalDateTime.now().plusDays(1).plusMinutes(45));
        req.setTipoEvento(TipoEvento.REUNION_PADRES);
        req.setModalidad(ModalidadEvento.PRESENCIAL);
        req.setAlumnoId(1L);
        req.setInvitadosUsuarioIds(List.of(20L));
        return req;
    }

    // ============ POST /eventos (EVENTO_CREAR) ============

    @Test
    @WithMockUser(authorities = {"EVENTO_CREAR"})
    void crear_conAuthorityEventoCrear_devuelve201() throws Exception {
        when(eventoService.crear(any())).thenReturn(EventoResponse.builder().id(100L).titulo("Reunion familia").build());

        mockMvc.perform(post("/eventos")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(crearRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100));
    }

    @Test
    @WithMockUser(authorities = {"EVENTO_LEER"})
    void crear_sinAuthorityEventoCrear_devuelve403() throws Exception {
        mockMvc.perform(post("/eventos")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(crearRequest())))
                .andExpect(status().isForbidden());
    }

    // ============ GET /eventos (EVENTO_LEER) ============

    @Test
    @WithMockUser(authorities = {"EVENTO_LEER"})
    void listar_conAuthorityEventoLeer_devuelve200() throws Exception {
        when(eventoService.listar(any(), any(), any(), any(), any())).thenReturn(List.of());

        mockMvc.perform(get("/eventos"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = {"NOTIFICACION_LEER"})
    void listar_sinAuthorityEventoLeer_devuelve403() throws Exception {
        mockMvc.perform(get("/eventos"))
                .andExpect(status().isForbidden());
    }

    // ============ PATCH /eventos/{id}/respuesta (EVENTO_RESPONDER) ============

    @Test
    @WithMockUser(authorities = {"EVENTO_RESPONDER"})
    void responder_conAuthorityEventoResponder_devuelve200() throws Exception {
        when(eventoUsuarioService.responder(anyLong(), any()))
                .thenReturn(EventoResponse.builder().id(100L).build());

        ResponderAsistenciaRequest req = new ResponderAsistenciaRequest();
        req.setEstadoAsistencia(EstadoAsistencia.CONFIRMADO);

        mockMvc.perform(patch("/eventos/100/respuesta")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = {"EVENTO_LEER"})
    void responder_sinAuthorityEventoResponder_devuelve403() throws Exception {
        ResponderAsistenciaRequest req = new ResponderAsistenciaRequest();
        req.setEstadoAsistencia(EstadoAsistencia.CONFIRMADO);

        mockMvc.perform(patch("/eventos/100/respuesta")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    // ============ POST /eventos/{id}/resultado (EVENTO_RESULTADO_ESCRIBIR, multipart) ============

    @Test
    @WithMockUser(authorities = {"EVENTO_RESULTADO_ESCRIBIR"})
    void registrarResultado_conAuthority_devuelve201() throws Exception {
        when(eventoService.registrarResultado(anyLong(), any(), any()))
                .thenReturn(ResultadoEventoResponse.builder()
                        .eventoId(100L).entradaId(500L)
                        .descripcion("Acordamos plan")
                        .autor(UsuarioBitacoraResponse.builder()
                                .id(1L).nombre("Maria").apellido("Castro").rol("DOCENTE").build())
                        .archivos(List.of())
                        .build());

        MockMultipartFile data = new MockMultipartFile(
                "data", "data", "application/json",
                "{\"descripcion\":\"Acordamos plan\"}".getBytes());

        mockMvc.perform(multipart("/eventos/100/resultado")
                        .file(data)
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.entradaId").value(500));
    }

    @Test
    @WithMockUser(authorities = {"EVENTO_RESULTADO_LEER"})
    void registrarResultado_sinAuthorityEscribir_devuelve403() throws Exception {
        MockMultipartFile data = new MockMultipartFile(
                "data", "data", "application/json",
                "{\"descripcion\":\"Acordamos plan\"}".getBytes());

        mockMvc.perform(multipart("/eventos/100/resultado")
                        .file(data)
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isForbidden());
    }

    // ============ GET /eventos/{id}/resultado (EVENTO_RESULTADO_LEER) ============

    @Test
    @WithMockUser(authorities = {"EVENTO_RESULTADO_LEER"})
    void obtenerResultado_conAuthority_devuelve200() throws Exception {
        when(eventoService.obtenerResultado(100L))
                .thenReturn(ResultadoEventoResponse.builder()
                        .eventoId(100L).entradaId(500L)
                        .descripcion("Acordamos plan")
                        .autor(UsuarioBitacoraResponse.builder()
                                .id(1L).nombre("Maria").apellido("Castro").rol("DOCENTE").build())
                        .archivos(List.of())
                        .build());

        mockMvc.perform(get("/eventos/100/resultado"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.entradaId").value(500));
    }

    @Test
    @WithMockUser(authorities = {"EVENTO_LEER"})
    void obtenerResultado_sinAuthorityLeerResultado_devuelve403() throws Exception {
        mockMvc.perform(get("/eventos/100/resultado"))
                .andExpect(status().isForbidden());
    }
}
