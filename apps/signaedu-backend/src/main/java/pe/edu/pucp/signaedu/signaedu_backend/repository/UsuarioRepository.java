package pe.edu.pucp.signaedu.signaedu_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoUsuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByCorreo(String correo);

    boolean existsByCorreo(String correo);

    List<Usuario> findByRoles_Nombre(TipoRol nombre);

    List<Usuario> findByEstado(EstadoUsuario estado);

    long countByEstado(EstadoUsuario estado);

    long countByRoles_Nombre(TipoRol nombre);
}
