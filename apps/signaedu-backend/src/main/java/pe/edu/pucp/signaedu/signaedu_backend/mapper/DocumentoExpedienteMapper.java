package pe.edu.pucp.signaedu.signaedu_backend.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.DocumentoExpedienteResponse;
import pe.edu.pucp.signaedu.signaedu_backend.model.DocumentoExpediente;

@Component
@RequiredArgsConstructor
public class DocumentoExpedienteMapper {

    private final TipoDocumentoMapper tipoDocumentoMapper;
    private final UsuarioMapper usuarioMapper;
    private final ArchivoAdjuntoMapper archivoAdjuntoMapper;

    public DocumentoExpedienteResponse toResponse(DocumentoExpediente documento) {
        return DocumentoExpedienteResponse.builder()
                .id(documento.getId())
                .tipoDocumento(tipoDocumentoMapper.toResponse(documento.getTipoDocumento()))
                .titulo(documento.getTitulo())
                .periodo(documento.getPeriodo())
                .version(documento.getVersion())
                .estado(documento.getEstado())
                .fechaEmision(documento.getFechaEmision())
                .fechaSubida(documento.getFechaSubida())
                .usuarioSubido(usuarioMapper.toSimpleResponse(documento.getUsuarioSubido()))
                .archivo(archivoAdjuntoMapper.toResponse(documento.getArchivo()))
                .entradaExpedienteId(documento.getEntrada().getId())
                .build();
    }
}
