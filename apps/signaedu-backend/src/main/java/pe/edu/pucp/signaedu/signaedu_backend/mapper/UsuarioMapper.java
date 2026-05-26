package pe.edu.pucp.signaedu.signaedu_backend.mapper;

import org.springframework.stereotype.Component;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.UsuarioBitacoraResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.UsuarioResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.UsuarioSimpleResponse;
import pe.edu.pucp.signaedu.signaedu_backend.model.Permiso;
import pe.edu.pucp.signaedu.signaedu_backend.model.Rol;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;

import java.util.List;

@Component
public class UsuarioMapper {

    public UsuarioResponse toResponse(Usuario usuario) {
        List<String> roles = usuario.getRoles().stream()
                .map(Rol::getNombre)
                .map(Enum::name)
                .toList();

        return UsuarioResponse.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .correo(usuario.getCorreo())
                .telefono(usuario.getTelefono())
                .estado(usuario.getEstado().name())
                .roles(roles)
                .authorities(extraerAuthorities(usuario))
                .build();
    }

    public List<String> extraerAuthorities(Usuario usuario) {
        return usuario.getRoles().stream()
                .flatMap(rol -> rol.getPermisos().stream())
                .map(Permiso::getNombre)
                .distinct()
                .sorted()
                .toList();
    }

    public UsuarioSimpleResponse toSimpleResponse(Usuario usuario) {
        return UsuarioSimpleResponse.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .correo(usuario.getCorreo())
                .telefono(usuario.getTelefono())
                .build();
    }

    public UsuarioBitacoraResponse toBitacoraResponse(Usuario usuario) {
        String rol = usuario.getRoles().stream()
                .map(Rol::getNombre)
                .map(Enum::name)
                .findFirst()
                .orElse(null);

        return UsuarioBitacoraResponse.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .rol(rol)
                .build();
    }
}
