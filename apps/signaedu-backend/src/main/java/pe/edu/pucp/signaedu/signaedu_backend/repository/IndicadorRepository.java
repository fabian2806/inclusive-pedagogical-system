package pe.edu.pucp.signaedu.signaedu_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import pe.edu.pucp.signaedu.signaedu_backend.model.Indicador;

public interface IndicadorRepository
        extends JpaRepository<Indicador, Long>,
                JpaSpecificationExecutor<Indicador> {
}
