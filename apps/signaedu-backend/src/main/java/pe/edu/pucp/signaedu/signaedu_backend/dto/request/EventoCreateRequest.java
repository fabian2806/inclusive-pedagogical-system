package pe.edu.pucp.signaedu.signaedu_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.ModalidadEvento;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoEvento;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EventoCreateRequest {

    @NotBlank(message = "El titulo es obligatorio")
    @Size(max = 200, message = "El titulo no puede superar 200 caracteres")
    private String titulo;

    @Size(max = 1000, message = "La descripcion no puede superar 1000 caracteres")
    private String descripcion;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDateTime fechaInicio;

    @NotNull(message = "La fecha de fin es obligatoria")
    private LocalDateTime fechaFin;

    @NotNull(message = "El tipo de evento es obligatorio")
    private TipoEvento tipoEvento;

    @NotNull(message = "La modalidad es obligatoria")
    private ModalidadEvento modalidad;

    @Size(max = 500, message = "La ubicacion no puede superar 500 caracteres")
    private String ubicacion;

    @NotNull(message = "El alumno es obligatorio")
    private Long alumnoId;

    /**
     * Lista de usuarios a invitar. La UI auto-selecciona a todos los
     * familiares (REUNION_PADRES) o al SAANEE elegido (SOLICITUD_APOYO_SAANEE),
     * pero el backend admite cualquier subconjunto.
     */
    private List<Long> invitadosUsuarioIds;
}
