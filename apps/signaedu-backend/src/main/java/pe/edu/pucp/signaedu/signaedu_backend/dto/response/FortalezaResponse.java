package pe.edu.pucp.signaedu.signaedu_backend.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FortalezaResponse {
    private Long id;
    private String dimension;
    private String descripcion;
}
