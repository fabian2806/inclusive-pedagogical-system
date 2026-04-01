package pe.edu.pucp.signaedu.signaedu_backend.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret",
                "clave-secreta-signaedu-test-que-tiene-al-menos-32-bytes!");
        ReflectionTestUtils.setField(jwtService, "expirationMs", 86400000L);
    }

    @Test
    void debeGenerarTokenConCorreo() {
        String token = jwtService.generarToken("admin@signaedu.pe");

        assertThat(token).isNotBlank();
        assertThat(jwtService.extraerCorreo(token)).isEqualTo("admin@signaedu.pe");
    }

    @Test
    void debeValidarTokenCorrecto() {
        String token = jwtService.generarToken("admin@signaedu.pe");
        UserDetails userDetails = new User("admin@signaedu.pe", "pass", List.of());

        assertThat(jwtService.esTokenValido(token, userDetails)).isTrue();
    }

    @Test
    void debeRechazarTokenConCorreoDistinto() {
        String token = jwtService.generarToken("admin@signaedu.pe");
        UserDetails otroUsuario = new User("otro@signaedu.pe", "pass", List.of());

        assertThat(jwtService.esTokenValido(token, otroUsuario)).isFalse();
    }
}
