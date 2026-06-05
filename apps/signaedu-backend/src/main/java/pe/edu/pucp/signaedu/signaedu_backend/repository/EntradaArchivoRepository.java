package pe.edu.pucp.signaedu.signaedu_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.pucp.signaedu.signaedu_backend.model.EntradaArchivo;

import java.util.Collection;
import java.util.List;

public interface EntradaArchivoRepository extends JpaRepository<EntradaArchivo, Long> {

    /**
     * Lista los adjuntos casuales asociados a una entrada raiz, ordenados
     * por fecha de subida ascendente (orden cronologico de aparicion).
     */
    List<EntradaArchivo> findByEntrada_IdOrderByFechaSubidaAsc(Long entradaId);

    /**
     * Devuelve el conteo de adjuntos por id de entrada, agrupado.
     * Cada fila es {entradaId, count}. Pensado para evitar N+1
     * cuando se necesita el numero de adjuntos de muchas entradas
     * (p.ej. exportacion de bitacora).
     */
    @Query("SELECT ea.entrada.id, COUNT(ea) FROM EntradaArchivo ea " +
            "WHERE ea.entrada.id IN :entradaIds GROUP BY ea.entrada.id")
    List<Object[]> contarPorEntradaIds(@Param("entradaIds") Collection<Long> entradaIds);
}
