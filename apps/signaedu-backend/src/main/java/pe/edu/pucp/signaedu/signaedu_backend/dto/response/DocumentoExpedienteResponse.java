package pe.edu.pucp.signaedu.signaedu_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoDocumento;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DocumentoExpedienteResponse {
    private Long id;
    private TipoDocumentoResponse tipoDocumento;
    private String titulo;
    private String periodo;
    private Integer version;
    private EstadoDocumento estado;
    private LocalDate fechaEmision;
    private LocalDateTime fechaSubida;
    private UsuarioSimpleResponse usuarioSubido;
    private ArchivoAdjuntoResponse archivo;
    private Long entradaExpedienteId;
}
