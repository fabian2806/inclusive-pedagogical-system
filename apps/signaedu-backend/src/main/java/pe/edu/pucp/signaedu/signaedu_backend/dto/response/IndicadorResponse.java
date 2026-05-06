package pe.edu.pucp.signaedu.signaedu_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.AreaCurricular;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class IndicadorResponse {
    private Long id;
    private String nombre;
    private String descripcion;
    private String categoria;
    private AreaCurricular areaCurricular;
    private UsuarioSimpleResponse usuarioCreador;
    private Boolean activo;
}
