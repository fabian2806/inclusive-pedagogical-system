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
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.ContactoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;
import pe.edu.pucp.signaedu.signaedu_backend.security.CustomUserDetailsService;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtAuthenticationFilter;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtService;
import pe.edu.pucp.signaedu.signaedu_backend.service.ContactoService;

import java.util.List;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ContactoController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@ActiveProfiles("test")
class ContactoControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private ContactoService contactoService;
    @MockitoBean private JwtService jwtService;
    @MockitoBean private CustomUserDetailsService customUserDetailsService;

    @Test
    @WithMockUser(authorities = {"CONTACTO_LEER"})
    void obtenerContactosDelAlumno_conAuthority_devuelve200ConLista() throws Exception {
        when(contactoService.obtenerContactosDelAlumno(anyLong())).thenReturn(List.of(
                ContactoResponse.builder()
                        .usuarioId(1L).rol(TipoRol.DOCENTE.name())
                        .nombre("Maria").apellido("Castro")
                        .correo("maria@signaedu.pe").telefono("999")
                        .build()
        ));

        mockMvc.perform(get("/alumnos/7/contactos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].rol").value("DOCENTE"));
    }

    @Test
    @WithMockUser(authorities = {"EVENTO_LEER"})
    void obtenerContactosDelAlumno_sinAuthority_devuelve403() throws Exception {
        mockMvc.perform(get("/alumnos/7/contactos"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = {"CONTACTO_LEER"})
    void listarSaaneeActivos_conAuthority_devuelve200() throws Exception {
        when(contactoService.listarSaaneeActivos()).thenReturn(List.of(
                ContactoResponse.builder()
                        .usuarioId(30L).rol(TipoRol.SAANEE.name())
                        .nombre("Roberto").apellido("Quispe")
                        .correo("roberto@signaedu.pe").build()
        ));

        mockMvc.perform(get("/usuarios/saanee"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].rol").value("SAANEE"));
    }

    /**
     * Admin no recibio CONTACTO_LEER en V5; debe responder 403 igual que
     * cualquier otro rol sin la authority.
     */
    @Test
    @WithMockUser(roles = "ADMIN")
    void listarSaaneeActivos_comoAdminSinAuthority_devuelve403() throws Exception {
        mockMvc.perform(get("/usuarios/saanee"))
                .andExpect(status().isForbidden());
    }
}
