package pe.edu.pucp.signaedu.signaedu_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import pe.edu.pucp.signaedu.signaedu_backend.config.SecurityConfig;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.LoginRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.LoginResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.UsuarioResponse;
import pe.edu.pucp.signaedu.signaedu_backend.mapper.UsuarioMapper;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.repository.UsuarioRepository;
import pe.edu.pucp.signaedu.signaedu_backend.security.CustomUserDetailsService;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtAuthenticationFilter;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtService;
import pe.edu.pucp.signaedu.signaedu_backend.service.AuthService;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private UsuarioRepository usuarioRepository;

    @MockitoBean
    private UsuarioMapper usuarioMapper;

    @Test
    void loginDebeRetornar200ConCredencialesValidas() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setCorreo("admin@signaedu.pe");
        request.setPassword("admin123");

        when(authService.login(any(LoginRequest.class)))
                .thenReturn(LoginResponse.builder()
                        .accessToken("token-jwt")
                        .authorities(List.of())
                        .build());

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("token-jwt"));
    }

    @Test
    void loginDebeIncluirAuthoritiesEnResponse() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setCorreo("docente@signaedu.pe");
        request.setPassword("docente123");

        when(authService.login(any(LoginRequest.class)))
                .thenReturn(LoginResponse.builder()
                        .accessToken("token-docente")
                        .authorities(List.of("ALUMNO_LEER", "BITACORA_ESCRIBIR"))
                        .build());

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("token-docente"))
                .andExpect(jsonPath("$.authorities[0]").value("ALUMNO_LEER"))
                .andExpect(jsonPath("$.authorities[1]").value("BITACORA_ESCRIBIR"));
    }

    @Test
    @WithMockUser(username = "docente@signaedu.pe")
    void getMeDebeIncluirAuthoritiesYRoles() throws Exception {
        Usuario usuario = Usuario.builder()
                .id(2L)
                .nombre("María")
                .apellido("Torres")
                .correo("docente@signaedu.pe")
                .build();
        UsuarioResponse response = UsuarioResponse.builder()
                .id(2L)
                .nombre("María")
                .apellido("Torres")
                .correo("docente@signaedu.pe")
                .roles(List.of("DOCENTE"))
                .authorities(List.of("ALUMNO_LEER", "BITACORA_ESCRIBIR", "INDICADOR_GESTIONAR"))
                .build();

        when(usuarioRepository.findByCorreo("docente@signaedu.pe")).thenReturn(Optional.of(usuario));
        when(usuarioMapper.toResponse(usuario)).thenReturn(response);

        mockMvc.perform(get("/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correo").value("docente@signaedu.pe"))
                .andExpect(jsonPath("$.roles[0]").value("DOCENTE"))
                .andExpect(jsonPath("$.authorities[0]").value("ALUMNO_LEER"))
                .andExpect(jsonPath("$.authorities[2]").value("INDICADOR_GESTIONAR"));
    }

    @Test
    void loginDebeRetornar401ConCredencialesInvalidas() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setCorreo("admin@signaedu.pe");
        request.setPassword("wrongpass");

        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new BadCredentialsException("Credenciales inválidas"));

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void loginDebeRetornar400ConBodyInvalido() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setCorreo("");
        request.setPassword("");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
