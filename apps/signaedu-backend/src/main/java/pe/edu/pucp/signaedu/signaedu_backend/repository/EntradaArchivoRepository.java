package pe.edu.pucp.signaedu.signaedu_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.pucp.signaedu.signaedu_backend.model.EntradaArchivo;

import java.util.List;

public interface EntradaArchivoRepository extends JpaRepository<EntradaArchivo, Long> {

    /**
     * Lista los adjuntos casuales asociados a una entrada raiz, ordenados
     * por fecha de subida ascendente (orden cronologico de aparicion).
     */
    List<EntradaArchivo> findByEntrada_IdOrderByFechaSubidaAsc(Long entradaId);
}
