package pe.edu.pucp.signaedu.signaedu_backend.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.EntradaExpedienteResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.IndicadorBitacoraResponse;
import pe.edu.pucp.signaedu.signaedu_backend.model.EntradaExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.Indicador;

@Component
@RequiredArgsConstructor
public class EntradaExpedienteMapper {

    private final UsuarioMapper usuarioMapper;

    public EntradaExpedienteResponse toResponse(EntradaExpediente entrada) {
        return EntradaExpedienteResponse.builder()
                .id(entrada.getId())
                .expedienteId(entrada.getExpediente().getId())
                .tipo(entrada.getTipoEntrada().name())
                .autor(usuarioMapper.toBitacoraResponse(entrada.getUsuario()))
                .fecha(entrada.getFecha())
                .titulo(entrada.getTitulo())
                .descripcion(entrada.getDescripcion())
                .entradaRaizId(entrada.getEntradaRaiz() != null ? entrada.getEntradaRaiz().getId() : null)
                .nivelImportancia(entrada.getNivelImportancia())
                .dirigidoA(entrada.getDirigidoA() != null ? usuarioMapper.toBitacoraResponse(entrada.getDirigidoA()) : null)
                .severidad(entrada.getSeveridad())
                .resultado(entrada.getResultado())
                .indicador(toIndicadorBitacora(entrada.getIndicador()))
                .resultadoLogrado(entrada.getResultadoLogrado())
                .build();
    }

    private IndicadorBitacoraResponse toIndicadorBitacora(Indicador indicador) {
        if (indicador == null) {
            return null;
        }
        return IndicadorBitacoraResponse.builder()
                .id(indicador.getId())
                .nombre(indicador.getNombre())
                .descripcion(indicador.getDescripcion())
                .areaCurricular(indicador.getAreaCurricular())
                .categoria(indicador.getCategoria())
                .build();
    }
}
