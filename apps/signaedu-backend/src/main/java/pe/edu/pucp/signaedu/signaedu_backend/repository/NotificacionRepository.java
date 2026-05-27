package pe.edu.pucp.signaedu.signaedu_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.pucp.signaedu.signaedu_backend.model.Notificacion;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    List<Notificacion> findByUsuarioIdOrderByFechaCreacionDesc(Long usuarioId);

    /**
     * Marca como leidas todas las notificaciones no leidas del usuario.
     * Update masivo en una sola sentencia para evitar cargar entidades.
     */
    @Modifying
    @Query("""
            UPDATE Notificacion n
               SET n.fechaLectura = :ahora
             WHERE n.usuario.id = :usuarioId
               AND n.fechaLectura IS NULL
            """)
    int marcarTodasLeidasParaUsuario(@Param("usuarioId") Long usuarioId,
                                     @Param("ahora") LocalDateTime ahora);
}
