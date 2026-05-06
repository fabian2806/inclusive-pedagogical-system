package pe.edu.pucp.signaedu.signaedu_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.AreaCurricular;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IndicadorBitacoraResponse {
    private Long id;
    private String nombre;
    private String descripcion;
    private AreaCurricular areaCurricular;
    private String categoria;
}
