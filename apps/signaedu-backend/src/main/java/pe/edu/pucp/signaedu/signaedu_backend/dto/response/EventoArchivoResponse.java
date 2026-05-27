package pe.edu.pucp.signaedu.signaedu_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EventoArchivoResponse {
    private Long id;
    private Long eventoId;
    private ArchivoAdjuntoResponse archivo;
    private String tipo;
    private String descripcion;
    private UsuarioSimpleResponse usuarioSubido;
}
