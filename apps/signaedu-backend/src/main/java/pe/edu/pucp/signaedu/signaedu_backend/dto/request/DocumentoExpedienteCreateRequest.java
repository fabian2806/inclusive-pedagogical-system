package pe.edu.pucp.signaedu.signaedu_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DocumentoExpedienteCreateRequest {

    @NotNull(message = "El tipo de documento es obligatorio")
    private Long tipoDocumentoId;

    @NotBlank(message = "El titulo es obligatorio")
    @Size(max = 255, message = "El titulo no puede superar 255 caracteres")
    private String titulo;

    @Size(max = 50, message = "El periodo no puede superar 50 caracteres")
    private String periodo;

    @NotNull(message = "La fecha de emision es obligatoria")
    private LocalDate fechaEmision;
}
