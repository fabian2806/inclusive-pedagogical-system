package pe.edu.pucp.signaedu.signaedu_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.ContactoAdminRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.AperturaPeriodoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.CierrePeriodoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.ConfiguracionPeriodoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.ContactoAdminResponse;
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
    private static final String CLAVE_CONTACTO_CORREO = "contacto_admin_correo";
    private static final String CLAVE_CONTACTO_TELEFONO = "contacto_admin_telefono";

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

    /**
     * Datos de contacto del administrador mostrados en el login.
     * No lanza error si las claves no existen: devuelve cadena vacia.
     */
    @Transactional(readOnly = true)
    public ContactoAdminResponse obtenerContactoAdmin() {
        String correo = obtenerValor(CLAVE_CONTACTO_CORREO);
        String telefono = obtenerValor(CLAVE_CONTACTO_TELEFONO);

        return ContactoAdminResponse.builder()
                .correo(correo)
                .telefono(telefono)
                .build();
    }

    @Transactional
    public ContactoAdminResponse actualizarContactoAdmin(ContactoAdminRequest request) {
        guardarValor(CLAVE_CONTACTO_CORREO, request.getCorreo());
        guardarValor(CLAVE_CONTACTO_TELEFONO,
                request.getTelefono() != null ? request.getTelefono() : "");

        return obtenerContactoAdmin();
    }

    private String obtenerValor(String clave) {
        return configuracionRepository.findByClave(clave)
                .map(Configuracion::getValor)
                .orElse("");
    }

    /** Upsert: actualiza el valor si la clave existe, o la crea si no. */
    private void guardarValor(String clave, String valor) {
        Configuracion config = configuracionRepository.findByClave(clave)
                .orElseGet(() -> Configuracion.builder().clave(clave).build());
        config.setValor(valor);
        configuracionRepository.save(config);
    }
}
