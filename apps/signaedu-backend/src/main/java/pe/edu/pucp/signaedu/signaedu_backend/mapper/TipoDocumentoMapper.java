package pe.edu.pucp.signaedu.signaedu_backend.mapper;

import org.springframework.stereotype.Component;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.TipoDocumentoCreateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.TipoDocumentoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.model.TipoDocumento;

@Component
public class TipoDocumentoMapper {

    public TipoDocumentoResponse toResponse(TipoDocumento tipoDocumento) {
        return TipoDocumentoResponse.builder()
                .id(tipoDocumento.getId())
                .nombre(tipoDocumento.getNombre())
                .esObligatorio(tipoDocumento.getEsObligatorio())
                .esVersionable(tipoDocumento.getEsVersionable())
                .esPeriodico(tipoDocumento.getEsPeriodico())
                .periodicidad(tipoDocumento.getPeriodicidad())
                .esPredefinido(tipoDocumento.getEsPredefinido())
                .build();
    }

    public TipoDocumento toEntity(TipoDocumentoCreateRequest request) {
        return TipoDocumento.builder()
                .nombre(request.getNombre())
                .esObligatorio(request.getEsObligatorio())
                .esVersionable(request.getEsVersionable())
                .esPeriodico(request.getEsPeriodico())
                .periodicidad(request.getPeriodicidad())
                .esPredefinido(false)
                .build();
    }
}
