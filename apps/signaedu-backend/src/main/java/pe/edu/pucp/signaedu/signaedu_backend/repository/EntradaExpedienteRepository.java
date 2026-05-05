package pe.edu.pucp.signaedu.signaedu_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import pe.edu.pucp.signaedu.signaedu_backend.model.EntradaExpediente;

public interface EntradaExpedienteRepository
        extends JpaRepository<EntradaExpediente, Long>,
                JpaSpecificationExecutor<EntradaExpediente> {
}
