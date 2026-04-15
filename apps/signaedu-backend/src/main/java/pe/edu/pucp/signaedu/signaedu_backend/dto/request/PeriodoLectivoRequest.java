package pe.edu.pucp.signaedu.signaedu_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PeriodoLectivoRequest {

    @NotBlank(message = "El periodo lectivo es obligatorio")
    private String periodoLectivo;
}
