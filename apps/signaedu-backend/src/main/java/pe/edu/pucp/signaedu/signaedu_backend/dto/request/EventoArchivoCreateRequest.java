package pe.edu.pucp.signaedu.signaedu_backend.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Metadatos opcionales del adjunto pre-evento (agenda, material, etc.).
 * Sin UI en Fase 4; consumido directo por API.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EventoArchivoCreateRequest {

    @Size(max = 50, message = "El tipo no puede superar 50 caracteres")
    private String tipo;

    @Size(max = 500, message = "La descripcion no puede superar 500 caracteres")
    private String descripcion;
}
