package pe.edu.pucp.signaedu.signaedu_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.pucp.signaedu.signaedu_backend.model.Expediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoExpediente;

import java.util.List;
import java.util.Optional;

public interface ExpedienteRepository extends JpaRepository<Expediente, Long> {
    boolean existsByAlumnoIdAndPeriodoLectivo(Long alumnoId, String periodoLectivo);
    List<Expediente> findByPeriodoLectivoAndEstado(String periodoLectivo, EstadoExpediente estado);
    Optional<Expediente> findByAlumnoIdAndPeriodoLectivoAndEstado(
            Long alumnoId, String periodoLectivo, EstadoExpediente estado);
}
