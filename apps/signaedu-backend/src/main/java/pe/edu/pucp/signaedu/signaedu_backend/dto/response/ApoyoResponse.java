package pe.edu.pucp.signaedu.signaedu_backend.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApoyoResponse {
    private Long id;
    private String intensidad;
    private String funcion;
    private String descripcion;
    private String fuente;
}
