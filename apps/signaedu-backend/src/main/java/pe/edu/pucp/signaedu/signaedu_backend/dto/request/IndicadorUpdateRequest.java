package pe.edu.pucp.signaedu.signaedu_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.AreaCurricular;

@Data
public class IndicadorUpdateRequest {

    @NotBlank
    @Size(max = 150)
    private String nombre;

    private String descripcion;

    @Size(max = 50)
    private String categoria;

    @NotNull
    private AreaCurricular areaCurricular;
}
