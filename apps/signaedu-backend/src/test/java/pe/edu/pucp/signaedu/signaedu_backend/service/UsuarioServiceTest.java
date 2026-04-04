package pe.edu.pucp.signaedu.signaedu_backend.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.UsuarioCreateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.UsuarioUpdateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.UsuarioResponse;
import pe.edu.pucp.signaedu.signaedu_backend.exception.DuplicateResourceException;
import pe.edu.pucp.signaedu.signaedu_backend.exception.ResourceNotFoundException;
import pe.edu.pucp.signaedu.signaedu_backend.mapper.UsuarioMapper;
import pe.edu.pucp.signaedu.signaedu_backend.model.Rol;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoUsuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;
import pe.edu.pucp.signaedu.signaedu_backend.repository.RolRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.UsuarioRepository;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private RolRepository rolRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UsuarioMapper usuarioMapper;

    @InjectMocks
    private UsuarioService usuarioService;

    private Rol rolDocente() {
        return Rol.builder().id(2L).nombre(TipoRol.DOCENTE).build();
    }

    private Usuario usuarioDocente() {
        return Usuario.builder()
                .id(1L)
                .nombre("Ana")
                .apellido("García")
                .correo("ana@signaedu.pe")
                .passwordHash("hashed")
                .estado(EstadoUsuario.ACTIVO)
                .roles(new HashSet<>(Set.of(rolDocente())))
                .build();
    }

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
    void debeCrearUsuarioCorrectamente() {
        UsuarioCreateRequest request = new UsuarioCreateRequest();
        request.setNombre("Ana");
        request.setApellido("García");
        request.setCorreo("ana@signaedu.pe");
        request.setPassword("password123");
        request.setRol(TipoRol.DOCENTE);

        when(usuarioRepository.existsByCorreo("ana@signaedu.pe")).thenReturn(false);
        when(rolRepository.findByNombre(TipoRol.DOCENTE)).thenReturn(Optional.of(rolDocente()));
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuarioDocente());
        when(usuarioMapper.toResponse(any(Usuario.class))).thenReturn(usuarioResponse());

        UsuarioResponse response = usuarioService.crearUsuario(request);

        assertThat(response.getNombre()).isEqualTo("Ana");
        assertThat(response.getRoles()).containsExactly("DOCENTE");
        verify(passwordEncoder).encode("password123");
    }

    @Test
    void debeLanzarDuplicateResourceAlCrearConCorreoExistente() {
        UsuarioCreateRequest request = new UsuarioCreateRequest();
        request.setCorreo("ana@signaedu.pe");

        when(usuarioRepository.existsByCorreo("ana@signaedu.pe")).thenReturn(true);

        assertThatThrownBy(() -> usuarioService.crearUsuario(request))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void debeListarTodosLosUsuarios() {
        when(usuarioRepository.findAll()).thenReturn(List.of(usuarioDocente()));
        when(usuarioMapper.toResponse(any(Usuario.class))).thenReturn(usuarioResponse());

        List<UsuarioResponse> resultado = usuarioService.listarUsuarios(null);

        assertThat(resultado).hasSize(1);
    }

    @Test
    void debeListarUsuariosFiltradosPorRol() {
        when(usuarioRepository.findByRoles_Nombre(TipoRol.DOCENTE)).thenReturn(List.of(usuarioDocente()));
        when(usuarioMapper.toResponse(any(Usuario.class))).thenReturn(usuarioResponse());

        List<UsuarioResponse> resultado = usuarioService.listarUsuarios(TipoRol.DOCENTE);

        assertThat(resultado).hasSize(1);
        verify(usuarioRepository).findByRoles_Nombre(TipoRol.DOCENTE);
    }

    @Test
    void debeObtenerUsuarioPorId() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuarioDocente()));
        when(usuarioMapper.toResponse(any(Usuario.class))).thenReturn(usuarioResponse());

        UsuarioResponse response = usuarioService.obtenerUsuarioPorId(1L);

        assertThat(response.getId()).isEqualTo(1L);
    }

    @Test
    void debeLanzarResourceNotFoundAlObtenerIdInexistente() {
        when(usuarioRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> usuarioService.obtenerUsuarioPorId(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void debeActualizarUsuarioCorrectamente() {
        UsuarioUpdateRequest request = new UsuarioUpdateRequest();
        request.setNombre("Ana María");
        request.setApellido("García");
        request.setCorreo("ana@signaedu.pe");
        request.setRol(TipoRol.DOCENTE);

        Usuario usuario = usuarioDocente();

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(rolRepository.findByNombre(TipoRol.DOCENTE)).thenReturn(Optional.of(rolDocente()));
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario);
        when(usuarioMapper.toResponse(any(Usuario.class))).thenReturn(usuarioResponse());

        UsuarioResponse response = usuarioService.actualizarUsuario(1L, request);

        assertThat(response).isNotNull();
        verify(usuarioRepository).save(any(Usuario.class));
    }

    @Test
    void debeActualizarPasswordSoloSiSeProvee() {
        UsuarioUpdateRequest request = new UsuarioUpdateRequest();
        request.setNombre("Ana");
        request.setApellido("García");
        request.setCorreo("ana@signaedu.pe");
        request.setPassword("nuevoPass123");

        Usuario usuario = usuarioDocente();

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(passwordEncoder.encode("nuevoPass123")).thenReturn("newHash");
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario);
        when(usuarioMapper.toResponse(any(Usuario.class))).thenReturn(usuarioResponse());

        usuarioService.actualizarUsuario(1L, request);

        verify(passwordEncoder).encode("nuevoPass123");
    }

    @Test
    void debeLanzarDuplicateResourceAlActualizarConCorreoExistente() {
        UsuarioUpdateRequest request = new UsuarioUpdateRequest();
        request.setNombre("Ana");
        request.setApellido("García");
        request.setCorreo("otro@signaedu.pe");

        Usuario usuario = usuarioDocente();

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.existsByCorreo("otro@signaedu.pe")).thenReturn(true);

        assertThatThrownBy(() -> usuarioService.actualizarUsuario(1L, request))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void debeDesactivarUsuario() {
        Usuario usuario = usuarioDocente();

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario);

        usuarioService.desactivarUsuario(1L);

        assertThat(usuario.getEstado()).isEqualTo(EstadoUsuario.INACTIVO);
        verify(usuarioRepository).save(usuario);
    }
}
