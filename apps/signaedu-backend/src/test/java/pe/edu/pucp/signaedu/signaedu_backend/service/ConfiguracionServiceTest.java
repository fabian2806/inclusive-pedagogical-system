package pe.edu.pucp.signaedu.signaedu_backend.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.AperturaPeriodoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.CierrePeriodoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.ConfiguracionPeriodoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.exception.IllegalOperationException;
import pe.edu.pucp.signaedu.signaedu_backend.model.Alumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.Configuracion;
import pe.edu.pucp.signaedu.signaedu_backend.model.Expediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoAlumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.repository.AlumnoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.ConfiguracionRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.ExpedienteRepository;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConfiguracionServiceTest {

    @Mock
    private ConfiguracionRepository configuracionRepository;

    @Mock
    private ExpedienteRepository expedienteRepository;

    @Mock
    private AlumnoRepository alumnoRepository;

    @InjectMocks
    private ConfiguracionService configuracionService;

    private Configuracion configPeriodo(String valor) {
        return Configuracion.builder()
                .id(1L)
                .clave("periodo_lectivo_vigente")
                .valor(valor)
                .build();
    }

    private Alumno alumnoActivo(Long id, String nombre) {
        return Alumno.builder()
                .id(id)
                .nombre(nombre)
                .apellido("Test")
                .fechaNacimiento(LocalDate.of(2015, 1, 1))
                .grado("3ro")
                .seccion("A")
                .estado(EstadoAlumno.ACTIVO)
                .build();
    }

    private Expediente expedienteActivo(Long id, Alumno alumno, String periodo) {
        return Expediente.builder()
                .id(id)
                .alumno(alumno)
                .fechaApertura(LocalDate.now())
                .periodoLectivo(periodo)
                .estado(EstadoExpediente.ACTIVO)
                .build();
    }

    // --- obtenerPeriodoVigente ---

    @Test
    void debeRetornarPeriodoVigenteConEstado() {
        Configuracion config = configPeriodo("2026");
        Alumno alumno = alumnoActivo(1L, "Carlos");
        List<Expediente> activos = List.of(expedienteActivo(1L, alumno, "2026"));

        when(configuracionRepository.findByClave("periodo_lectivo_vigente"))
                .thenReturn(Optional.of(config));
        when(expedienteRepository.findByPeriodoLectivoAndEstado("2026", EstadoExpediente.ACTIVO))
                .thenReturn(activos);

        ConfiguracionPeriodoResponse response = configuracionService.obtenerPeriodoVigente();

        assertThat(response.getPeriodoLectivoVigente()).isEqualTo("2026");
        assertThat(response.isPeriodoAbierto()).isTrue();
        assertThat(response.getExpedientesActivos()).isEqualTo(1);
    }

    @Test
    void debeRetornarPeriodoAbiertoFalseCuandoNoHayExpedientes() {
        when(configuracionRepository.findByClave("periodo_lectivo_vigente"))
                .thenReturn(Optional.of(configPeriodo("2027")));
        when(expedienteRepository.findByPeriodoLectivoAndEstado("2027", EstadoExpediente.ACTIVO))
                .thenReturn(Collections.emptyList());

        ConfiguracionPeriodoResponse response = configuracionService.obtenerPeriodoVigente();

        assertThat(response.isPeriodoAbierto()).isFalse();
        assertThat(response.getExpedientesActivos()).isZero();
    }

    // --- actualizarPeriodoVigente ---

    @Test
    void debeActualizarPeriodoVigente() {
        Configuracion config = configPeriodo("2026");

        when(configuracionRepository.findByClave("periodo_lectivo_vigente"))
                .thenReturn(Optional.of(config));
        when(configuracionRepository.save(any(Configuracion.class))).thenReturn(config);
        when(expedienteRepository.findByPeriodoLectivoAndEstado("2027", EstadoExpediente.ACTIVO))
                .thenReturn(Collections.emptyList());

        ConfiguracionPeriodoResponse response = configuracionService.actualizarPeriodoVigente("2027");

        assertThat(response.getPeriodoLectivoVigente()).isEqualTo("2027");
        assertThat(response.isPeriodoAbierto()).isFalse();
        verify(configuracionRepository).save(config);
    }

    /**
     * Guarda del orden cerrar → cambiar → aperturar. Sin esto, los expedientes
     * del periodo viejo quedan ACTIVO fuera del alcance de cerrarPeriodo (que
     * siempre opera sobre el vigente) y ya no hay forma de cerrarlos por la API.
     */
    @Test
    void noDebeCambiarPeriodoVigenteSiElActualTieneExpedientesActivos() {
        when(configuracionRepository.findByClave("periodo_lectivo_vigente"))
                .thenReturn(Optional.of(configPeriodo("2026")));
        when(expedienteRepository.countByPeriodoLectivoAndEstado("2026", EstadoExpediente.ACTIVO))
                .thenReturn(6L);

        assertThatThrownBy(() -> configuracionService.actualizarPeriodoVigente("2027"))
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("2026")
                .hasMessageContaining("6")
                .hasMessageContaining("Cierralo primero");

        verify(configuracionRepository, never()).save(any(Configuracion.class));
    }

    @Test
    void debeCambiarPeriodoVigenteCuandoElActualEstaCerrado() {
        Configuracion config = configPeriodo("2026");

        when(configuracionRepository.findByClave("periodo_lectivo_vigente"))
                .thenReturn(Optional.of(config));
        when(expedienteRepository.countByPeriodoLectivoAndEstado("2026", EstadoExpediente.ACTIVO))
                .thenReturn(0L);
        when(configuracionRepository.save(any(Configuracion.class))).thenReturn(config);
        when(expedienteRepository.findByPeriodoLectivoAndEstado("2027", EstadoExpediente.ACTIVO))
                .thenReturn(Collections.emptyList());

        assertThat(configuracionService.actualizarPeriodoVigente("2027").getPeriodoLectivoVigente())
                .isEqualTo("2027");
    }

    /** Reguardar el mismo valor no mueve el puntero: no hay nada que proteger. */
    @Test
    void debePermitirReguardarElMismoPeriodoAunqueEsteAbierto() {
        Configuracion config = configPeriodo("2026");

        when(configuracionRepository.findByClave("periodo_lectivo_vigente"))
                .thenReturn(Optional.of(config));
        when(expedienteRepository.findByPeriodoLectivoAndEstado("2026", EstadoExpediente.ACTIVO))
                .thenReturn(List.of(expedienteActivo(1L, alumnoActivo(1L, "Carlos"), "2026")));

        assertThat(configuracionService.actualizarPeriodoVigente("2026").getPeriodoLectivoVigente())
                .isEqualTo("2026");

        verify(expedienteRepository, never())
                .countByPeriodoLectivoAndEstado(anyString(), any());
    }

    // --- aperturarPeriodo ---

    @Test
    void debeCrearExpedientesParaAlumnosActivosSinExpediente() {
        Alumno alumno1 = alumnoActivo(1L, "Carlos");
        Alumno alumno2 = alumnoActivo(2L, "Ana");

        when(configuracionRepository.findByClave("periodo_lectivo_vigente"))
                .thenReturn(Optional.of(configPeriodo("2026")));
        when(alumnoRepository.findByEstado(EstadoAlumno.ACTIVO))
                .thenReturn(List.of(alumno1, alumno2));
        when(expedienteRepository.existsByAlumnoIdAndPeriodoLectivo(1L, "2026"))
                .thenReturn(false);
        when(expedienteRepository.existsByAlumnoIdAndPeriodoLectivo(2L, "2026"))
                .thenReturn(false);
        when(expedienteRepository.save(any(Expediente.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        AperturaPeriodoResponse response = configuracionService.aperturarPeriodo();

        assertThat(response.getPeriodoLectivo()).isEqualTo("2026");
        assertThat(response.getExpedientesCreados()).isEqualTo(2);
        verify(expedienteRepository, times(2)).save(any(Expediente.class));
    }

    @Test
    void noDebeCrearExpedientesDuplicadosAlAperturar() {
        Alumno alumno1 = alumnoActivo(1L, "Carlos");
        Alumno alumno2 = alumnoActivo(2L, "Ana");

        when(configuracionRepository.findByClave("periodo_lectivo_vigente"))
                .thenReturn(Optional.of(configPeriodo("2026")));
        when(alumnoRepository.findByEstado(EstadoAlumno.ACTIVO))
                .thenReturn(List.of(alumno1, alumno2));
        // alumno1 ya tiene expediente (activo o inactivo), alumno2 no
        when(expedienteRepository.existsByAlumnoIdAndPeriodoLectivo(1L, "2026"))
                .thenReturn(true);
        when(expedienteRepository.existsByAlumnoIdAndPeriodoLectivo(2L, "2026"))
                .thenReturn(false);
        when(expedienteRepository.save(any(Expediente.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        AperturaPeriodoResponse response = configuracionService.aperturarPeriodo();

        assertThat(response.getExpedientesCreados()).isEqualTo(1);
        verify(expedienteRepository, times(1)).save(any(Expediente.class));
    }

    /**
     * El salteo por idempotencia deja de ser silencioso: la apertura reporta
     * cuantos alumnos quedaron afuera, en vez de prometer N y entregar M sin
     * explicar la diferencia.
     */
    @Test
    void debeReportarLosAlumnosOmitidosAlAperturar() {
        Alumno alumno1 = alumnoActivo(1L, "Carlos");
        Alumno alumno2 = alumnoActivo(2L, "Ana");
        Alumno alumno3 = alumnoActivo(3L, "Luis");

        when(configuracionRepository.findByClave("periodo_lectivo_vigente"))
                .thenReturn(Optional.of(configPeriodo("2027")));
        when(alumnoRepository.findByEstado(EstadoAlumno.ACTIVO))
                .thenReturn(List.of(alumno1, alumno2, alumno3));
        when(expedienteRepository.existsByAlumnoIdAndPeriodoLectivo(1L, "2027")).thenReturn(true);
        when(expedienteRepository.existsByAlumnoIdAndPeriodoLectivo(2L, "2027")).thenReturn(true);
        when(expedienteRepository.existsByAlumnoIdAndPeriodoLectivo(3L, "2027")).thenReturn(false);
        when(expedienteRepository.save(any(Expediente.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        AperturaPeriodoResponse response = configuracionService.aperturarPeriodo();

        assertThat(response.getExpedientesCreados()).isEqualTo(1);
        assertThat(response.getExpedientesOmitidos()).isEqualTo(2);
    }

    @Test
    void noDebeReportarOmitidosCuandoSeCreanTodos() {
        Alumno alumno1 = alumnoActivo(1L, "Carlos");

        when(configuracionRepository.findByClave("periodo_lectivo_vigente"))
                .thenReturn(Optional.of(configPeriodo("2027")));
        when(alumnoRepository.findByEstado(EstadoAlumno.ACTIVO)).thenReturn(List.of(alumno1));
        when(expedienteRepository.existsByAlumnoIdAndPeriodoLectivo(1L, "2027")).thenReturn(false);
        when(expedienteRepository.save(any(Expediente.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        AperturaPeriodoResponse response = configuracionService.aperturarPeriodo();

        assertThat(response.getExpedientesCreados()).isEqualTo(1);
        assertThat(response.getExpedientesOmitidos()).isZero();
    }

    // --- cerrarPeriodo ---

    @Test
    void debeCerrarTodosLosExpedientesActivosDelPeriodo() {
        Alumno alumno1 = alumnoActivo(1L, "Carlos");
        Alumno alumno2 = alumnoActivo(2L, "Ana");
        Expediente exp1 = expedienteActivo(1L, alumno1, "2026");
        Expediente exp2 = expedienteActivo(2L, alumno2, "2026");

        when(configuracionRepository.findByClave("periodo_lectivo_vigente"))
                .thenReturn(Optional.of(configPeriodo("2026")));
        when(expedienteRepository.findByPeriodoLectivoAndEstado("2026", EstadoExpediente.ACTIVO))
                .thenReturn(List.of(exp1, exp2));
        when(expedienteRepository.saveAll(any())).thenReturn(List.of(exp1, exp2));

        CierrePeriodoResponse response = configuracionService.cerrarPeriodo();

        assertThat(response.getExpedientesCerrados()).isEqualTo(2);
        assertThat(exp1.getEstado()).isEqualTo(EstadoExpediente.INACTIVO);
        assertThat(exp2.getEstado()).isEqualTo(EstadoExpediente.INACTIVO);
        verify(expedienteRepository).saveAll(any());
    }

    @Test
    void debeLanzarExcepcionAlCerrarSinExpedientesActivos() {
        when(configuracionRepository.findByClave("periodo_lectivo_vigente"))
                .thenReturn(Optional.of(configPeriodo("2026")));
        when(expedienteRepository.findByPeriodoLectivoAndEstado("2026", EstadoExpediente.ACTIVO))
                .thenReturn(Collections.emptyList());

        assertThatThrownBy(() -> configuracionService.cerrarPeriodo())
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("No hay expedientes activos");
    }
}
