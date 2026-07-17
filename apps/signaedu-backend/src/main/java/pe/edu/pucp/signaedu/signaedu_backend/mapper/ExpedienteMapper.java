package pe.edu.pucp.signaedu.signaedu_backend.mapper;

import org.springframework.stereotype.Component;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.ExpedientePeriodoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.model.Expediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoExpediente;

@Component
public class ExpedienteMapper {

    /**
     * @param periodoVigente valor de {@code periodo_lectivo_vigente} en configuracion,
     *                       necesario para derivar {@code vigente} y {@code editable}
     *                       (ninguno de los dos se persiste).
     */
    public ExpedientePeriodoResponse toPeriodoResponse(Expediente expediente, String periodoVigente) {
        boolean esVigente = expediente.getPeriodoLectivo().equals(periodoVigente);

        return ExpedientePeriodoResponse.builder()
                .periodoLectivo(expediente.getPeriodoLectivo())
                .estado(expediente.getEstado().name())
                .vigente(esVigente)
                // Espeja la regla de escritura del backend: solo se escribe en el
                // expediente del periodo vigente y en estado ACTIVO.
                .editable(esVigente && expediente.getEstado() == EstadoExpediente.ACTIVO)
                .build();
    }
}
