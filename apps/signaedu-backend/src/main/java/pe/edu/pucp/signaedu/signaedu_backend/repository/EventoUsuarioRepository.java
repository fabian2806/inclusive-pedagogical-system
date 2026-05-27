package pe.edu.pucp.signaedu.signaedu_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.pucp.signaedu.signaedu_backend.model.EventoUsuario;

import java.util.Optional;

public interface EventoUsuarioRepository extends JpaRepository<EventoUsuario, Long> {
    Optional<EventoUsuario> findByEventoIdAndUsuarioId(Long eventoId, Long usuarioId);
    boolean existsByEventoIdAndUsuarioId(Long eventoId, Long usuarioId);
}
