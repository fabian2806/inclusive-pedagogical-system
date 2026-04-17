package pe.edu.pucp.signaedu.signaedu_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoDimension;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FortalezaRequest {

    @NotNull(message = "La dimensión es obligatoria")
    private TipoDimension dimension;

    @NotBlank(message = "La descripción es obligatoria")
    private String descripcion;
}
