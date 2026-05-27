package pe.edu.pucp.signaedu.signaedu_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Datos textuales del resultado de un evento. Se acompana de N archivos
 * opcionales en el multipart (parte "archivos").
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegistrarResultadoRequest {

    @Size(max = 150, message = "El titulo no puede superar 150 caracteres")
    private String titulo;

    @NotBlank(message = "La descripcion del resultado es obligatoria")
    private String descripcion;
}
