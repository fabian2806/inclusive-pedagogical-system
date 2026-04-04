package pe.edu.pucp.signaedu.signaedu_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.pucp.signaedu.signaedu_backend.model.TipoDocumento;

import java.util.Optional;

public interface TipoDocumentoRepository extends JpaRepository<TipoDocumento, Long> {
    boolean existsByNombre(String nombre);
    Optional<TipoDocumento> findByNombre(String nombre);
}
