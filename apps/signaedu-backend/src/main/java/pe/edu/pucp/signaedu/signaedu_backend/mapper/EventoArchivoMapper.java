package pe.edu.pucp.signaedu.signaedu_backend.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.EventoArchivoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.model.EventoArchivo;

@Component
@RequiredArgsConstructor
public class EventoArchivoMapper {

    private final UsuarioMapper usuarioMapper;
    private final ArchivoAdjuntoMapper archivoAdjuntoMapper;

    public EventoArchivoResponse toResponse(EventoArchivo eventoArchivo) {
        return EventoArchivoResponse.builder()
                .id(eventoArchivo.getId())
                .eventoId(eventoArchivo.getEvento().getId())
                .archivo(archivoAdjuntoMapper.toResponse(eventoArchivo.getArchivo()))
                .tipo(eventoArchivo.getTipo())
                .descripcion(eventoArchivo.getDescripcion())
                .usuarioSubido(usuarioMapper.toSimpleResponse(eventoArchivo.getUsuarioSubido()))
                .build();
    }
}
