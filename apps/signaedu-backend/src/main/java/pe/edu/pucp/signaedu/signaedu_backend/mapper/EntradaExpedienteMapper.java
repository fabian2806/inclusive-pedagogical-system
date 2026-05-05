package pe.edu.pucp.signaedu.signaedu_backend.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.EntradaExpedienteResponse;
import pe.edu.pucp.signaedu.signaedu_backend.model.EntradaExpediente;

@Component
@RequiredArgsConstructor
public class EntradaExpedienteMapper {

    private final UsuarioMapper usuarioMapper;

    public EntradaExpedienteResponse toResponse(EntradaExpediente entrada) {
        return EntradaExpedienteResponse.builder()
                .id(entrada.getId())
                .expedienteId(entrada.getExpediente().getId())
                .tipo(entrada.getTipoEntrada().name())
                .autor(usuarioMapper.toSimpleResponse(entrada.getUsuario()))
                .fecha(entrada.getFecha())
                .descripcion(entrada.getDescripcion())
                .entradaRaizId(entrada.getEntradaRaiz() != null ? entrada.getEntradaRaiz().getId() : null)
                .nivelImportancia(entrada.getNivelImportancia())
                .dirigidoA(entrada.getDirigidoA() != null ? usuarioMapper.toSimpleResponse(entrada.getDirigidoA()) : null)
                .severidad(entrada.getSeveridad())
                .resultado(entrada.getResultado())
                .build();
    }
}
