package pe.edu.pucp.signaedu.signaedu_backend.mapper;

import org.springframework.stereotype.Component;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.ContactoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.model.Rol;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;

@Component
public class ContactoMapper {

    /**
     * Mapea un usuario a su shape publico de contacto, etiquetandolo con
     * el rol indicado. Util cuando el contexto sabe que un usuario es,
     * por ejemplo, docente del alumno consultado.
     */
    public ContactoResponse toResponse(Usuario usuario, TipoRol rol) {
        return ContactoResponse.builder()
                .usuarioId(usuario.getId())
                .rol(rol.name())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .correo(usuario.getCorreo())
                .telefono(usuario.getTelefono())
                .build();
    }

    /**
     * Variante que infiere el rol primario del usuario (primer rol asignado).
     * Util para listados donde todos los usuarios comparten el mismo rol
     * implicito, como el listado de SAANEE.
     */
    public ContactoResponse toResponse(Usuario usuario) {
        TipoRol rol = usuario.getRoles().stream()
                .map(Rol::getNombre)
                .findFirst()
                .orElse(null);
        return toResponse(usuario, rol);
    }
}
