package pe.edu.pucp.signaedu.signaedu_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DocenteDashboardResponse {
    private Long alumnosAsignados;
    private Long entradasBitacoraHoy;
    private Long alumnosSinPerfilDiscapacidad;
}
