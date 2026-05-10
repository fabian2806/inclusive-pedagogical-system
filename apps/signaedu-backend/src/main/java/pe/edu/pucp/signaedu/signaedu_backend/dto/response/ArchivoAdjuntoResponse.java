package pe.edu.pucp.signaedu.signaedu_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ArchivoAdjuntoResponse {
    private Long id;
    private String nombreOriginal;
    private String mimeType;
    private Long tamano;
}
