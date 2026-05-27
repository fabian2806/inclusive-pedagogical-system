package pe.edu.pucp.signaedu.signaedu_backend.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.pucp.signaedu.signaedu_backend.model.EntradaExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoEntrada;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EntradaExpedienteRepository
        extends JpaRepository<EntradaExpediente, Long>,
                JpaSpecificationExecutor<EntradaExpediente> {

    boolean existsByEvento_IdAndTipoEntrada(Long eventoId, TipoEntrada tipo);

    Optional<EntradaExpediente> findFirstByEvento_IdAndTipoEntrada(Long eventoId, TipoEntrada tipo);

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

    @Query("""
            SELECT e FROM EntradaExpediente e
            JOIN e.expediente exp
            JOIN exp.alumno a
            JOIN a.docentes d
            WHERE d.id = :docenteId
            ORDER BY e.fecha DESC
            """)
    List<EntradaExpediente> obtenerActividadRecienteDeDocente(@Param("docenteId") Long docenteId,
                                                              Pageable pageable);
}
