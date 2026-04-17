package pe.edu.pucp.signaedu.signaedu_backend.dto.request;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PerfilDiscapacidadRequest {

    private String modoComunicacionPreferido;

    private String observacionesGenerales;

    @Valid
    private List<BarreraRequest> barreras;

    @Valid
    private List<FortalezaRequest> fortalezas;

    @Valid
    private List<ApoyoRequest> apoyos;
}
