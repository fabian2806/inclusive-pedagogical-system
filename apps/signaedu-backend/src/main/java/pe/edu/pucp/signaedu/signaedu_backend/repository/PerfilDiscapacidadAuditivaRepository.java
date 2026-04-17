package pe.edu.pucp.signaedu.signaedu_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.pucp.signaedu.signaedu_backend.model.PerfilDiscapacidadAuditiva;

import java.util.Optional;

public interface PerfilDiscapacidadAuditivaRepository extends JpaRepository<PerfilDiscapacidadAuditiva, Long> {
    Optional<PerfilDiscapacidadAuditiva> findByAlumnoId(Long alumnoId);
    boolean existsByAlumnoId(Long alumnoId);
}
