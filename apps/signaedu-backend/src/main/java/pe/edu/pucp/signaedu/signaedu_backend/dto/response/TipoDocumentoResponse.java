package pe.edu.pucp.signaedu.signaedu_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TipoDocumentoResponse {
    private Long id;
    private String nombre;
    private Boolean esObligatorio;
    private Boolean esVersionable;
    private Boolean esPeriodico;
    private String periodicidad;
    private Boolean esPredefinido;
}
