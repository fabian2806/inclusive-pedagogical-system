package pe.edu.pucp.signaedu.signaedu_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import pe.edu.pucp.signaedu.signaedu_backend.model.Evento;

public interface EventoRepository
        extends JpaRepository<Evento, Long>,
                JpaSpecificationExecutor<Evento> {
}
