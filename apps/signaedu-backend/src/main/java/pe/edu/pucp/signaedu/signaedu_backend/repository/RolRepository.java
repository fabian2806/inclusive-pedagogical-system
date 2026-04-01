package pe.edu.pucp.signaedu.signaedu_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.pucp.signaedu.signaedu_backend.model.Rol;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;

import java.util.Optional;

public interface RolRepository extends JpaRepository<Rol, Long> {

    Optional<Rol> findByNombre(TipoRol nombre);
}
