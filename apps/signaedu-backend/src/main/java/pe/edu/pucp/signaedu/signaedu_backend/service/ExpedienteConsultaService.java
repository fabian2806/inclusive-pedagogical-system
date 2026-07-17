package pe.edu.pucp.signaedu.signaedu_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.ExpedientePeriodoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.mapper.ExpedienteMapper;
import pe.edu.pucp.signaedu.signaedu_backend.repository.ExpedienteRepository;

import java.util.List;

/**
 * Consulta de expedientes del alumno. Solo lectura: la apertura y el cierre de
 * periodos viven en {@link ConfiguracionService} (modulo admin).
 */
@Service
@RequiredArgsConstructor
public class ExpedienteConsultaService {

    private final ExpedienteRepository expedienteRepository;
    private final ConfiguracionService configuracionService;
    private final ExpedienteMapper mapper;
    private final AccesoAlumnoValidator accesoAlumnoValidator;

    /**
     * Periodos en los que el alumno tiene expediente, del mas reciente al mas
     * antiguo. Incluye los cerrados: alimenta el selector de periodos, desde el
     * cual se consultan los periodos anteriores en solo lectura.
     */
    @Transactional(readOnly = true)
    public List<ExpedientePeriodoResponse> listarPeriodos(Long alumnoId) {
        accesoAlumnoValidator.validarAccesoYObtenerUsuario(alumnoId);

        String periodoVigente = configuracionService.obtenerValorPeriodo();

        return expedienteRepository.findByAlumnoIdOrderByPeriodoLectivoDesc(alumnoId).stream()
                .map(expediente -> mapper.toPeriodoResponse(expediente, periodoVigente))
                .toList();
    }
}
