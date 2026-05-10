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
public class EntradaArchivoCreateRequest {

    @Size(max = 500, message = "La descripcion no puede superar 500 caracteres")
    private String descripcion;
}
