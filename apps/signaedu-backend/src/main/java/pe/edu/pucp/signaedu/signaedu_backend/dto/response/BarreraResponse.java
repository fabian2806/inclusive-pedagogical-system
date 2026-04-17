package pe.edu.pucp.signaedu.signaedu_backend.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BarreraResponse {
    private Long id;
    private String tipo;
    private String descripcion;
}
