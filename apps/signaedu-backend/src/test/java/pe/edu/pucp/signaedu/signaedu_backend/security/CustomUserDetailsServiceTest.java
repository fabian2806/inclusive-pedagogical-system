package pe.edu.pucp.signaedu.signaedu_backend.security;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import pe.edu.pucp.signaedu.signaedu_backend.model.Permiso;
import pe.edu.pucp.signaedu.signaedu_backend.model.Rol;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoUsuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;
import pe.edu.pucp.signaedu.signaedu_backend.repository.UsuarioRepository;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void debeCargarPermisosComoAuthorities() {
        // given: un docente con 2 permisos
        Permiso alumnoLeer = new Permiso();
        alumnoLeer.setId(1L);
        alumnoLeer.setNombre("ALUMNO_LEER");

        Permiso perfilEscribir = new Permiso();
        perfilEscribir.setId(2L);
        perfilEscribir.setNombre("PERFIL_DISCAPACIDAD_ESCRIBIR");

        Rol rolDocente = Rol.builder()
                .id(2L)
                .nombre(TipoRol.DOCENTE)
                .permisos(new HashSet<>(Set.of(alumnoLeer, perfilEscribir)))
                .build();

        Usuario usuario = Usuario.builder()
                .id(1L)
                .nombre("María")
                .apellido("Torres")
                .correo("maria@signaedu.pe")
                .passwordHash("hashed")
                .estado(EstadoUsuario.ACTIVO)
                .roles(new HashSet<>(Set.of(rolDocente)))
                .build();

        when(usuarioRepository.findByCorreo("maria@signaedu.pe"))
                .thenReturn(Optional.of(usuario));

        // when
        UserDetails userDetails = customUserDetailsService.loadUserByUsername("maria@signaedu.pe");

        // then: debe tener ROLE_DOCENTE + los 2 permisos = 3 authorities
        var authorityNames = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        assertThat(authorityNames).hasSize(3);
        assertThat(authorityNames).contains("ROLE_DOCENTE", "ALUMNO_LEER", "PERFIL_DISCAPACIDAD_ESCRIBIR");
    }
}
