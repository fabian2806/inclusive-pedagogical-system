package pe.edu.pucp.signaedu.signaedu_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TipoDocumentoCreateRequest {

    @NotBlank
    private String nombre;

    @NotNull
    private Boolean esObligatorio;

    @NotNull
    private Boolean esVersionable;

    @NotNull
    private Boolean esPeriodico;

    private String periodicidad;
}
