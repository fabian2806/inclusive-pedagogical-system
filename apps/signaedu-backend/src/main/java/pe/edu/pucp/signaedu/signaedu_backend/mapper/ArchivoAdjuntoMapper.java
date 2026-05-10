package pe.edu.pucp.signaedu.signaedu_backend.mapper;

import org.springframework.stereotype.Component;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.ArchivoAdjuntoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.model.ArchivoAdjunto;

@Component
public class ArchivoAdjuntoMapper {

    public ArchivoAdjuntoResponse toResponse(ArchivoAdjunto archivo) {
        return ArchivoAdjuntoResponse.builder()
                .id(archivo.getId())
                .nombreOriginal(archivo.getNombreOriginal())
                .mimeType(archivo.getMimeType())
                .tamano(archivo.getTamano())
                .build();
    }
}
