package pe.edu.pucp.signaedu.signaedu_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoEntrada;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EntradaExpedienteRequest {

    @NotNull(message = "El tipo de entrada es obligatorio")
    private TipoEntrada tipo;

    @Size(max = 150, message = "El título no puede superar 150 caracteres")
    private String titulo;

    @NotBlank(message = "La descripción es obligatoria")
    private String descripcion;

    private Long entradaRaizId;

    @Size(max = 20, message = "El nivel de importancia no puede superar 20 caracteres")
    private String nivelImportancia;

    private Long dirigidoAUsuarioId;

    @Size(max = 20, message = "La severidad no puede superar 20 caracteres")
    private String severidad;

    private String resultado;

    private Long indicadorId;

    private Boolean resultadoLogrado;
}
