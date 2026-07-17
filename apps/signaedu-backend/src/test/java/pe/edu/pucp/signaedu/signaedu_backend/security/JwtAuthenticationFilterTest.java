package pe.edu.pucp.signaedu.signaedu_backend.security;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private CustomUserDetailsService userDetailsService;

    @InjectMocks
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @AfterEach
    void limpiarContexto() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void noDebeAutenticarUsuarioInactivoAunqueElTokenSigaVigente() throws Exception {
        // given: un docente desactivado que conserva el token emitido antes de la baja
        UserDetails deshabilitado = usuario(false);
        MockHttpServletRequest request = peticionConToken();
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        when(jwtService.extraerCorreo("token-vigente")).thenReturn("maria@signaedu.pe");
        when(userDetailsService.loadUserByUsername("maria@signaedu.pe")).thenReturn(deshabilitado);
        when(jwtService.esTokenValido("token-vigente", deshabilitado)).thenReturn(true);

        // when
        jwtAuthenticationFilter.doFilter(request, response, chain);

        // then: el token es válido, pero la baja debe surtir efecto igualmente (RNF02).
        // Sin autenticación en el contexto, la cadena resuelve 401/403 aguas abajo.
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(chain).doFilter(request, response);
    }

    @Test
    void debeAutenticarUsuarioActivoConTokenVigente() throws Exception {
        // given
        UserDetails habilitado = usuario(true);
        MockHttpServletRequest request = peticionConToken();
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        when(jwtService.extraerCorreo("token-vigente")).thenReturn("maria@signaedu.pe");
        when(userDetailsService.loadUserByUsername("maria@signaedu.pe")).thenReturn(habilitado);
        when(jwtService.esTokenValido("token-vigente", habilitado)).thenReturn(true);

        // when
        jwtAuthenticationFilter.doFilter(request, response, chain);

        // then
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getName())
                .isEqualTo("maria@signaedu.pe");
    }

    private UserDetails usuario(boolean habilitado) {
        return new User(
                "maria@signaedu.pe",
                "hashed",
                habilitado,
                true,
                true,
                true,
                Set.of(new SimpleGrantedAuthority("ROLE_DOCENTE")));
    }

    private MockHttpServletRequest peticionConToken() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-vigente");
        return request;
    }
}
