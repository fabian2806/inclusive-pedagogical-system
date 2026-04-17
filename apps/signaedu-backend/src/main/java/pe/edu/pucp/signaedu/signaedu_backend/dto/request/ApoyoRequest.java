package pe.edu.pucp.signaedu.signaedu_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoFuente;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoFuncion;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoIntensidad;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApoyoRequest {

    @NotNull(message = "La intensidad es obligatoria")
    private TipoIntensidad intensidad;

    @NotNull(message = "La función es obligatoria")
    private TipoFuncion funcion;

    @NotBlank(message = "La descripción es obligatoria")
    private String descripcion;

    @NotNull(message = "La fuente es obligatoria")
    private TipoFuente fuente;
}
