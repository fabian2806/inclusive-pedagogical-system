package pe.edu.pucp.signaedu.signaedu_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.pucp.signaedu.signaedu_backend.model.Alumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoAlumno;

import java.util.List;

public interface AlumnoRepository extends JpaRepository<Alumno, Long> {
    List<Alumno> findByEstado(EstadoAlumno estado);
    List<Alumno> findByDocentes_Id(Long docenteId);
    List<Alumno> findByPadres_Id(Long padreId);
    boolean existsByIdAndDocentesId(Long id, Long docenteId);
    boolean existsByIdAndPadresId(Long id, Long padreId);
}
