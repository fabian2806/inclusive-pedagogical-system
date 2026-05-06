package pe.edu.pucp.signaedu.signaedu_backend.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.IndicadorCreateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.IndicadorResponse;
import pe.edu.pucp.signaedu.signaedu_backend.model.Indicador;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;

@Component
@RequiredArgsConstructor
public class IndicadorMapper {

    private final UsuarioMapper usuarioMapper;

    public IndicadorResponse toResponse(Indicador indicador) {
        return IndicadorResponse.builder()
                .id(indicador.getId())
                .nombre(indicador.getNombre())
                .descripcion(indicador.getDescripcion())
                .categoria(indicador.getCategoria())
                .areaCurricular(indicador.getAreaCurricular())
                .usuarioCreador(usuarioMapper.toSimpleResponse(indicador.getUsuarioCreador()))
                .activo(indicador.getActivo())
                .build();
    }

    public Indicador toEntity(IndicadorCreateRequest request, Usuario creador) {
        return Indicador.builder()
                .nombre(request.getNombre())
                .descripcion(request.getDescripcion())
                .categoria(request.getCategoria())
                .areaCurricular(request.getAreaCurricular())
                .usuarioCreador(creador)
                .activo(true)
                .build();
    }
}
