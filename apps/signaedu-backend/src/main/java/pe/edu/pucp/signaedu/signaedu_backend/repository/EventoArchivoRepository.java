package pe.edu.pucp.signaedu.signaedu_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.pucp.signaedu.signaedu_backend.model.EventoArchivo;

import java.util.List;

public interface EventoArchivoRepository extends JpaRepository<EventoArchivo, Long> {
    List<EventoArchivo> findByEventoIdOrderByIdAsc(Long eventoId);
}
