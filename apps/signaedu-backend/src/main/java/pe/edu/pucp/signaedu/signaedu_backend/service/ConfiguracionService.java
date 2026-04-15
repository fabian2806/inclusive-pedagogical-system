package pe.edu.pucp.signaedu.signaedu_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.AperturaPeriodoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.CierrePeriodoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.ConfiguracionPeriodoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.exception.IllegalOperationException;
import pe.edu.pucp.signaedu.signaedu_backend.exception.ResourceNotFoundException;
import pe.edu.pucp.signaedu.signaedu_backend.model.Alumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.Configuracion;
import pe.edu.pucp.signaedu.signaedu_backend.model.Expediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoAlumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.repository.AlumnoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.ConfiguracionRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.ExpedienteRepository;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConfiguracionService {

    private static final String CLAVE_PERIODO = "periodo_lectivo_vigente";

    private final ConfiguracionRepository configuracionRepository;
    private final ExpedienteRepository expedienteRepository;
    private final AlumnoRepository alumnoRepository;

    @Transactional(readOnly = true)
    public ConfiguracionPeriodoResponse obtenerPeriodoVigente() {
        Configuracion config = configuracionRepository.findByClave(CLAVE_PERIODO)
                .orElseThrow(() -> new ResourceNotFoundException("Configuracion", "clave", CLAVE_PERIODO));

        return construirPeriodoResponse(config.getValor());
    }

    @Transactional
    public ConfiguracionPeriodoResponse actualizarPeriodoVigente(String nuevoPeriodo) {
        Configuracion config = configuracionRepository.findByClave(CLAVE_PERIODO)
                .orElseThrow(() -> new ResourceNotFoundException("Configuracion", "clave", CLAVE_PERIODO));

        config.setValor(nuevoPeriodo);
        configuracionRepository.save(config);

        return construirPeriodoResponse(nuevoPeriodo);
    }

    private ConfiguracionPeriodoResponse construirPeriodoResponse(String periodo) {
        List<Expediente> activos = expedienteRepository
                .findByPeriodoLectivoAndEstado(periodo, EstadoExpediente.ACTIVO);

        return ConfiguracionPeriodoResponse.builder()
                .periodoLectivoVigente(periodo)
                .periodoAbierto(!activos.isEmpty())
                .expedientesActivos(activos.size())
                .build();
    }

    @Transactional
    public AperturaPeriodoResponse aperturarPeriodo() {
        String periodo = obtenerValorPeriodo();
        List<Alumno> alumnosActivos = alumnoRepository.findByEstado(EstadoAlumno.ACTIVO);

        int creados = 0;
        for (Alumno alumno : alumnosActivos) {
            if (!expedienteRepository.existsByAlumnoIdAndPeriodoLectivo(alumno.getId(), periodo)) {
                Expediente expediente = Expediente.builder()
                        .alumno(alumno)
                        .fechaApertura(LocalDate.now())
                        .periodoLectivo(periodo)
                        .build();
                expedienteRepository.save(expediente);
                creados++;
            }
        }

        return AperturaPeriodoResponse.builder()
                .periodoLectivo(periodo)
                .expedientesCreados(creados)
                .build();
    }

    @Transactional
    public CierrePeriodoResponse cerrarPeriodo() {
        String periodo = obtenerValorPeriodo();
        List<Expediente> expedientesActivos = expedienteRepository
                .findByPeriodoLectivoAndEstado(periodo, EstadoExpediente.ACTIVO);

        if (expedientesActivos.isEmpty()) {
            throw new IllegalOperationException(
                    "No hay expedientes activos para el periodo " + periodo);
        }

        for (Expediente expediente : expedientesActivos) {
            expediente.setEstado(EstadoExpediente.INACTIVO);
        }
        expedienteRepository.saveAll(expedientesActivos);

        return CierrePeriodoResponse.builder()
                .periodoLectivo(periodo)
                .expedientesCerrados(expedientesActivos.size())
                .build();
    }

    /**
     * Obtiene el valor del periodo lectivo vigente desde la tabla configuracion.
     * Usado también por otros servicios (ej. AlumnoService al crear alumno).
     */
    @Transactional(readOnly = true)
    public String obtenerValorPeriodo() {
        return configuracionRepository.findByClave(CLAVE_PERIODO)
                .orElseThrow(() -> new ResourceNotFoundException("Configuracion", "clave", CLAVE_PERIODO))
                .getValor();
    }
}
