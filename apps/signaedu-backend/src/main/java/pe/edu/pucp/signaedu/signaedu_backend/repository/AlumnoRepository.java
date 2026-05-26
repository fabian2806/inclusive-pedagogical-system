package pe.edu.pucp.signaedu.signaedu_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.pucp.signaedu.signaedu_backend.model.Alumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoAlumno;

import java.util.List;

public interface AlumnoRepository extends JpaRepository<Alumno, Long> {
    List<Alumno> findByEstado(EstadoAlumno estado);
    List<Alumno> findByDocentes_Id(Long docenteId);
    List<Alumno> findByPadres_Id(Long padreId);
    boolean existsByIdAndDocentesId(Long id, Long docenteId);
    boolean existsByIdAndPadresId(Long id, Long padreId);

    long countByEstado(EstadoAlumno estado);
    long countByDocentes_Id(Long docenteId);

    @Query("""
            SELECT COUNT(a) FROM Alumno a
            JOIN a.docentes d
            WHERE d.id = :docenteId
              AND NOT EXISTS (
                SELECT 1 FROM PerfilDiscapacidadAuditiva p WHERE p.alumno = a
              )
            """)
    long contarAsignadosSinPerfilDiscapacidad(@Param("docenteId") Long docenteId);
}
