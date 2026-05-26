package pe.edu.pucp.signaedu.signaedu_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.pucp.signaedu.signaedu_backend.model.EntradaExpediente;

import java.time.LocalDateTime;

public interface EntradaExpedienteRepository
        extends JpaRepository<EntradaExpediente, Long>,
                JpaSpecificationExecutor<EntradaExpediente> {

    @Query("""
            SELECT COUNT(e) FROM EntradaExpediente e
            JOIN e.expediente exp
            JOIN exp.alumno a
            JOIN a.docentes d
            WHERE d.id = :docenteId
              AND e.fecha >= :desde
            """)
    long contarEntradasDesdeFechaParaDocente(@Param("docenteId") Long docenteId,
                                             @Param("desde") LocalDateTime desde);

    @Query("""
            SELECT COUNT(e) FROM EntradaExpediente e
            JOIN e.expediente exp
            JOIN exp.alumno a
            JOIN a.padres p
            WHERE p.id = :padreId
              AND e.fecha >= :desde
            """)
    long contarEntradasDesdeFechaParaPadre(@Param("padreId") Long padreId,
                                           @Param("desde") LocalDateTime desde);
}
