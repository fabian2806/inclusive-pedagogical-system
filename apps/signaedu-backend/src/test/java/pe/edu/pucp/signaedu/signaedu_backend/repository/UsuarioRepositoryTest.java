package pe.edu.pucp.signaedu.signaedu_backend.repository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoUsuario;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class UsuarioRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private Usuario crearUsuario(String correo) {
        Usuario usuario = Usuario.builder()
                .nombre("Test")
                .apellido("Usuario")
                .correo(correo)
                .passwordHash("$2a$10$hashdeprueba")
                .estado(EstadoUsuario.ACTIVO)
                .build();
        return entityManager.persistAndFlush(usuario);
    }

    @Test
    void debeEncontrarUsuarioPorCorreo() {
        crearUsuario("test@signaedu.pe");

        Optional<Usuario> resultado = usuarioRepository.findByCorreo("test@signaedu.pe");

        assertThat(resultado).isPresent();
        assertThat(resultado.get().getCorreo()).isEqualTo("test@signaedu.pe");
    }

    @Test
    void debeRetornarVacioCuandoCorreoNoExiste() {
        Optional<Usuario> resultado = usuarioRepository.findByCorreo("noexiste@signaedu.pe");

        assertThat(resultado).isEmpty();
    }

    @Test
    void existsByCorreoDebeRetornarTrue() {
        crearUsuario("existe@signaedu.pe");

        assertThat(usuarioRepository.existsByCorreo("existe@signaedu.pe")).isTrue();
    }

    @Test
    void existsByCorreoDebeRetornarFalse() {
        assertThat(usuarioRepository.existsByCorreo("noexiste@signaedu.pe")).isFalse();
    }
}
