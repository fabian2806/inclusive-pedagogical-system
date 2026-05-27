package pe.edu.pucp.signaedu.signaedu_backend.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CancelarEventoRequest {

    @Size(max = 500, message = "El motivo de cancelacion no puede superar 500 caracteres")
    private String motivoCancelacion;
}
