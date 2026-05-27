package pe.edu.pucp.signaedu.signaedu_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Vista minima del alumno para contextos donde no se requiere la carga
 * completa (docentes/padres). Reutilizable por modulos como eventos.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AlumnoBasicoResponse {
    private Long id;
    private String nombre;
    private String apellido;
    private String grado;
    private String seccion;
}
