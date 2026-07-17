package pe.edu.pucp.signaedu.signaedu_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Un periodo lectivo en el que el alumno tiene expediente. Alimenta el
 * selector de periodos del expediente.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpedientePeriodoResponse {
    private String periodoLectivo;

    /** ACTIVO | INACTIVO */
    private String estado;

    /** El periodo coincide con el {@code periodo_lectivo_vigente} de configuracion. */
    private boolean vigente;

    /**
     * Se puede escribir en este expediente. Espeja la regla de escritura del
     * backend: vigente + ACTIVO. Los demas periodos son de solo lectura.
     */
    private boolean editable;
}
