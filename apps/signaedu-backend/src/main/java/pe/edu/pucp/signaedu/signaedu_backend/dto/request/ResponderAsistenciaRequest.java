package pe.edu.pucp.signaedu.signaedu_backend.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoAsistencia;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResponderAsistenciaRequest {

    @NotNull(message = "La respuesta de asistencia es obligatoria")
    private EstadoAsistencia estadoAsistencia;

    @Size(max = 500, message = "El motivo de rechazo no puede superar 500 caracteres")
    private String motivoRechazo;
}
