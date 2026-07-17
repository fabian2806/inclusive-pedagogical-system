package pe.edu.pucp.signaedu.signaedu_backend.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.ExpedientePeriodoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.mapper.ExpedienteMapper;
import pe.edu.pucp.signaedu.signaedu_backend.model.Alumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.Expediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.repository.ExpedienteRepository;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExpedienteConsultaServiceTest {

    private static final Long ALUMNO_ID = 7L;

    @Mock
    private ExpedienteRepository expedienteRepository;

    @Mock
    private ConfiguracionService configuracionService;

    @Mock
    private AccesoAlumnoValidator accesoAlumnoValidator;

    // Mapper real: la derivacion de vigente/editable es justo lo que queremos probar.
    @Spy
    private ExpedienteMapper mapper = new ExpedienteMapper();

    @InjectMocks
    private ExpedienteConsultaService service;

    private Expediente expediente(String periodo, EstadoExpediente estado) {
        return Expediente.builder()
                .id(1L)
                .alumno(Alumno.builder().id(ALUMNO_ID).build())
                .periodoLectivo(periodo)
                .estado(estado)
                .build();
    }

    @Test
    void listarPeriodosMarcaElVigenteActivoComoEditable() {
        when(configuracionService.obtenerValorPeriodo()).thenReturn("2026");
        when(expedienteRepository.findByAlumnoIdOrderByPeriodoLectivoDesc(ALUMNO_ID))
                .thenReturn(List.of(
                        expediente("2026", EstadoExpediente.ACTIVO),
                        expediente("2024", EstadoExpediente.INACTIVO)));

        List<ExpedientePeriodoResponse> resultado = service.listarPeriodos(ALUMNO_ID);

        assertThat(resultado).hasSize(2);

        assertThat(resultado.get(0).getPeriodoLectivo()).isEqualTo("2026");
        assertThat(resultado.get(0).getEstado()).isEqualTo("ACTIVO");
        assertThat(resultado.get(0).isVigente()).isTrue();
        assertThat(resultado.get(0).isEditable()).isTrue();

        assertThat(resultado.get(1).getPeriodoLectivo()).isEqualTo("2024");
        assertThat(resultado.get(1).isVigente()).isFalse();
        assertThat(resultado.get(1).isEditable()).isFalse();
    }

    /**
     * El caso de la ventana entre "cerrar periodo" y "aperturar el siguiente":
     * el periodo sigue siendo el vigente pero ya esta cerrado. Se consulta,
     * no se edita.
     */
    @Test
    void periodoVigentePeroCerradoNoEsEditable() {
        when(configuracionService.obtenerValorPeriodo()).thenReturn("2026");
        when(expedienteRepository.findByAlumnoIdOrderByPeriodoLectivoDesc(ALUMNO_ID))
                .thenReturn(List.of(expediente("2026", EstadoExpediente.INACTIVO)));

        List<ExpedientePeriodoResponse> resultado = service.listarPeriodos(ALUMNO_ID);

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).isVigente()).isTrue();
        assertThat(resultado.get(0).isEditable()).isFalse();
    }

    @Test
    void listarPeriodosSinExpedientesDevuelveListaVacia() {
        when(configuracionService.obtenerValorPeriodo()).thenReturn("2026");
        when(expedienteRepository.findByAlumnoIdOrderByPeriodoLectivoDesc(ALUMNO_ID))
                .thenReturn(List.of());

        assertThat(service.listarPeriodos(ALUMNO_ID)).isEmpty();
    }

    @Test
    void listarPeriodosValidaAccesoAntesDeConsultar() {
        doThrowAccesoDenegado();

        assertThatThrownBy(() -> service.listarPeriodos(ALUMNO_ID))
                .isInstanceOf(AccessDeniedException.class);

        verify(expedienteRepository, never()).findByAlumnoIdOrderByPeriodoLectivoDesc(anyLong());
    }

    private void doThrowAccesoDenegado() {
        when(accesoAlumnoValidator.validarAccesoYObtenerUsuario(ALUMNO_ID))
                .thenThrow(new AccessDeniedException("No tiene acceso al alumno con id " + ALUMNO_ID));
    }
}
