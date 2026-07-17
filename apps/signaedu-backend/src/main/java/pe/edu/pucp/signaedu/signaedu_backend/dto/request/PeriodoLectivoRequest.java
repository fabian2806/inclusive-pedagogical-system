package pe.edu.pucp.signaedu.signaedu_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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
    @Pattern(regexp = "\\d{4}", message = "El periodo lectivo debe ser un año de 4 dígitos")
    private String periodoLectivo;
}
