package pe.edu.pucp.signaedu.signaedu_backend.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.EntradaArchivoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.model.EntradaArchivo;

@Component
@RequiredArgsConstructor
public class EntradaArchivoMapper {

    private final UsuarioMapper usuarioMapper;
    private final ArchivoAdjuntoMapper archivoAdjuntoMapper;

    public EntradaArchivoResponse toResponse(EntradaArchivo entradaArchivo) {
        return EntradaArchivoResponse.builder()
                .id(entradaArchivo.getId())
                .entradaId(entradaArchivo.getEntrada().getId())
                .archivo(archivoAdjuntoMapper.toResponse(entradaArchivo.getArchivo()))
                .descripcion(entradaArchivo.getDescripcion())
                .usuarioSubido(usuarioMapper.toSimpleResponse(entradaArchivo.getUsuarioSubido()))
                .fechaSubida(entradaArchivo.getFechaSubida())
                .build();
    }
}
