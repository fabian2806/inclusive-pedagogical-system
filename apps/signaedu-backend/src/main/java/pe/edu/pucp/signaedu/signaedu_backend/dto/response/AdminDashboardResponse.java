package pe.edu.pucp.signaedu.signaedu_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;

import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminDashboardResponse {
    private Long totalUsuarios;
    private Long totalAlumnosActivos;
    private Long expedientesAbiertos;
    private String periodoVigente;
    private Map<TipoRol, Long> usuariosPorRol;
}
