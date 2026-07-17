package pe.edu.pucp.signaedu.signaedu_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AperturaPeriodoResponse {
    private String periodoLectivo;
    private int expedientesCreados;

    /**
     * Alumnos activos que ya tenian expediente en el periodo y por lo tanto se
     * saltearon. Se reporta para que la apertura no prometa N y entregue M sin
     * explicar la diferencia.
     */
    private int expedientesOmitidos;
}
