package pe.edu.pucp.signaedu.signaedu_backend.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerfilDiscapacidadResponse {
    private Long id;
    private Long alumnoId;
    private String modoComunicacionPreferido;
    private String observacionesGenerales;
    private List<BarreraResponse> barreras;
    private List<FortalezaResponse> fortalezas;
    private List<ApoyoResponse> apoyos;
}
