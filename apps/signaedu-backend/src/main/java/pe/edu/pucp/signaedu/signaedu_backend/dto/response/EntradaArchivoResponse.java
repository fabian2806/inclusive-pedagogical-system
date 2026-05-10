package pe.edu.pucp.signaedu.signaedu_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EntradaArchivoResponse {
    private Long id;
    private Long entradaId;
    private ArchivoAdjuntoResponse archivo;
    private String descripcion;
    private UsuarioSimpleResponse usuarioSubido;
    private LocalDateTime fechaSubida;
}
