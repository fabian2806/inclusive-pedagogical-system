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
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.UsuarioCreateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.UsuarioResponse;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;
import pe.edu.pucp.signaedu.signaedu_backend.security.CustomUserDetailsService;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtAuthenticationFilter;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtService;
import pe.edu.pucp.signaedu.signaedu_backend.service.UsuarioService;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UsuarioController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@ActiveProfiles("test")
class UsuarioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UsuarioService usuarioService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    private UsuarioResponse usuarioResponse() {
        return UsuarioResponse.builder()
                .id(1L)
                .nombre("Ana")
                .apellido("García")
                .correo("ana@signaedu.pe")
                .estado("ACTIVO")
                .roles(List.of("DOCENTE"))
                .build();
    }

    @Test
    @WithMockUser(authorities = {"USUARIO_CREAR", "USUARIO_LEER", "USUARIO_ACTUALIZAR", "USUARIO_DESACTIVAR"})
    void debeCrearUsuario201ConRolAdmin() throws Exception {
        UsuarioCreateRequest request = new UsuarioCreateRequest();
        request.setNombre("Ana");
        request.setApellido("García");
        request.setCorreo("ana@signaedu.pe");
        request.setPassword("password123");
        request.setRol(TipoRol.DOCENTE);

        when(usuarioService.crearUsuario(any(UsuarioCreateRequest.class)))
                .thenReturn(usuarioResponse());

        mockMvc.perform(post("/admin/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nombre").value("Ana"))
                .andExpect(jsonPath("$.roles[0]").value("DOCENTE"));
    }

    @Test
    @WithMockUser(authorities = {"USUARIO_CREAR", "USUARIO_LEER", "USUARIO_ACTUALIZAR", "USUARIO_DESACTIVAR"})
    void debeListarUsuarios200() throws Exception {
        when(usuarioService.listarUsuarios(null)).thenReturn(List.of(usuarioResponse()));

        mockMvc.perform(get("/admin/usuarios"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].correo").value("ana@signaedu.pe"));
    }

    @Test
    @WithMockUser(authorities = {"USUARIO_CREAR", "USUARIO_LEER", "USUARIO_ACTUALIZAR", "USUARIO_DESACTIVAR"})
    void debeObtenerUsuarioPorId200() throws Exception {
        when(usuarioService.obtenerUsuarioPorId(1L)).thenReturn(usuarioResponse());

        mockMvc.perform(get("/admin/usuarios/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @WithMockUser(authorities = {"USUARIO_CREAR", "USUARIO_LEER", "USUARIO_ACTUALIZAR", "USUARIO_DESACTIVAR"})
    void debeRetornar400ConDatosInvalidos() throws Exception {
        UsuarioCreateRequest request = new UsuarioCreateRequest();
        request.setNombre("");
        request.setApellido("");
        request.setCorreo("no-es-email");
        request.setPassword("123");

        mockMvc.perform(post("/admin/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(authorities = {"ALUMNO_LEER"})
    void debeRetornar403SinPermisoUsuarioLeer() throws Exception {
        mockMvc.perform(get("/admin/usuarios"))
                .andExpect(status().isForbidden());
    }
}
