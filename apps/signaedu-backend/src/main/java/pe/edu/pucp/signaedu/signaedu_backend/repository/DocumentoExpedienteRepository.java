package pe.edu.pucp.signaedu.signaedu_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.pucp.signaedu.signaedu_backend.model.DocumentoExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoDocumento;

import java.util.List;
import java.util.Optional;

public interface DocumentoExpedienteRepository extends JpaRepository<DocumentoExpediente, Long> {

    /**
     * Lista todos los documentos del expediente, ordenados por fecha de
     * subida descendente. Incluye vigentes y archivados; el filtrado por
     * estado se hace en servicio segun corresponda.
     */
    @Query("""
        SELECT d FROM DocumentoExpediente d
        WHERE d.entrada.expediente.id = :expedienteId
        ORDER BY d.fechaSubida DESC
    """)
    List<DocumentoExpediente> findByExpedienteId(@Param("expedienteId") Long expedienteId);

    /**
     * Busca el documento vigente dentro de un expediente concreto para
     * (tipo, periodo) con periodo no nulo. Si existe, el upload de una
     * nueva version lo archivara (tipo versionable) o el upload fallara
     * (no versionable).
     *
     * El scope por expediente (no por alumno) evita colisiones con
     * documentos vigentes en expedientes anteriores cerrados: un alumno
     * puede tener PEP vigente en su expediente 2024 y otro PEP vigente
     * en su expediente 2026 sin que la version se confunda. La resolucion
     * "alumno vigente -> expediente vigente" se hace en servicio, igual
     * que en Fase 2b.
     */
    @Query("""
        SELECT d FROM DocumentoExpediente d
        WHERE d.entrada.expediente.id = :expedienteId
          AND d.tipoDocumento.id = :tipoDocumentoId
          AND d.periodo = :periodo
          AND d.estado = :estado
    """)
    Optional<DocumentoExpediente> findByExpedienteTipoPeriodoYEstado(
            @Param("expedienteId") Long expedienteId,
            @Param("tipoDocumentoId") Long tipoDocumentoId,
            @Param("periodo") String periodo,
            @Param("estado") EstadoDocumento estado);

    /**
     * Variante para tipos no periodicos (periodo IS NULL). Spring Data no
     * resuelve correctamente el caso null contra Postgres con un solo
     * parametro, por eso se separa en un metodo aparte.
     */
    @Query("""
        SELECT d FROM DocumentoExpediente d
        WHERE d.entrada.expediente.id = :expedienteId
          AND d.tipoDocumento.id = :tipoDocumentoId
          AND d.periodo IS NULL
          AND d.estado = :estado
    """)
    Optional<DocumentoExpediente> findByExpedienteTipoSinPeriodoYEstado(
            @Param("expedienteId") Long expedienteId,
            @Param("tipoDocumentoId") Long tipoDocumentoId,
            @Param("estado") EstadoDocumento estado);
}
