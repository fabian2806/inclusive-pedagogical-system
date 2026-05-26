package pe.edu.pucp.signaedu.signaedu_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HijoResumen {
    private Long id;
    private String nombre;
    private String apellido;
    private String grado;
    private String seccion;
    private Long expedienteId;
}
