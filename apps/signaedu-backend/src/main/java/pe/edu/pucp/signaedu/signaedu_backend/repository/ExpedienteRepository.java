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
    long countByPeriodoLectivoAndEstado(String periodoLectivo, EstadoExpediente estado);

    /**
     * Expedientes del alumno ordenados del periodo mas reciente al mas antiguo.
     * A diferencia del resto de metodos, no filtra por estado: alimenta el
     * selector de periodos del expediente, que incluye los ya cerrados.
     */
    List<Expediente> findByAlumnoIdOrderByPeriodoLectivoDesc(Long alumnoId);

    /**
     * Resuelve el expediente de un periodo concreto sin exigir que este ACTIVO.
     * Solo para lectura: la escritura sigue resolviendo contra el periodo
     * vigente + ACTIVO via {@link #findByAlumnoIdAndPeriodoLectivoAndEstado}.
     */
    Optional<Expediente> findByAlumnoIdAndPeriodoLectivo(Long alumnoId, String periodoLectivo);
}
