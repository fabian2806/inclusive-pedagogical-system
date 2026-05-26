package pe.edu.pucp.signaedu.signaedu_backend.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.LoginRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.LoginResponse;
import pe.edu.pucp.signaedu.signaedu_backend.mapper.UsuarioMapper;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.repository.UsuarioRepository;
import pe.edu.pucp.signaedu.signaedu_backend.security.JwtService;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private UsuarioMapper usuarioMapper;

    @InjectMocks
    private AuthService authService;

    @Test
    void debeRetornarTokenCuandoCredencialesSonValidas() {
        LoginRequest request = new LoginRequest();
        request.setCorreo("admin@signaedu.pe");
        request.setPassword("admin123");

        Usuario usuario = Usuario.builder().id(1L).correo("admin@signaedu.pe").build();
        when(jwtService.generarToken("admin@signaedu.pe")).thenReturn("token-jwt");
        when(usuarioRepository.findByCorreo("admin@signaedu.pe")).thenReturn(Optional.of(usuario));
        when(usuarioMapper.extraerAuthorities(usuario)).thenReturn(List.of());

        LoginResponse response = authService.login(request);

        assertThat(response.getAccessToken()).isEqualTo("token-jwt");
    }

    @Test
    void debeIncluirAuthoritiesEnLoginResponse() {
        LoginRequest request = new LoginRequest();
        request.setCorreo("docente@signaedu.pe");
        request.setPassword("docente123");

        Usuario usuario = Usuario.builder().id(2L).correo("docente@signaedu.pe").build();
        List<String> authorities = List.of("ALUMNO_LEER", "BITACORA_ESCRIBIR", "INDICADOR_GESTIONAR");

        when(jwtService.generarToken("docente@signaedu.pe")).thenReturn("token-docente");
        when(usuarioRepository.findByCorreo("docente@signaedu.pe")).thenReturn(Optional.of(usuario));
        when(usuarioMapper.extraerAuthorities(usuario)).thenReturn(authorities);

        LoginResponse response = authService.login(request);

        assertThat(response.getAuthorities())
                .containsExactly("ALUMNO_LEER", "BITACORA_ESCRIBIR", "INDICADOR_GESTIONAR");
    }

    @Test
    void debeLanzarExcepcionCuandoCredencialesSonInvalidas() {
        LoginRequest request = new LoginRequest();
        request.setCorreo("admin@signaedu.pe");
        request.setPassword("wrongpass");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Credenciales inválidas"));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class);
    }
}
