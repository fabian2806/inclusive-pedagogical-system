package pe.edu.pucp.signaedu.signaedu_backend.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.TipoDocumentoCreateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.TipoDocumentoUpdateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.TipoDocumentoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.exception.DuplicateResourceException;
import pe.edu.pucp.signaedu.signaedu_backend.exception.IllegalOperationException;
import pe.edu.pucp.signaedu.signaedu_backend.exception.ResourceNotFoundException;
import pe.edu.pucp.signaedu.signaedu_backend.mapper.TipoDocumentoMapper;
import pe.edu.pucp.signaedu.signaedu_backend.model.TipoDocumento;
import pe.edu.pucp.signaedu.signaedu_backend.repository.TipoDocumentoRepository;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TipoDocumentoServiceTest {

    @Mock
    private TipoDocumentoRepository tipoDocumentoRepository;

    @Mock
    private TipoDocumentoMapper tipoDocumentoMapper;

    @InjectMocks
    private TipoDocumentoService tipoDocumentoService;

    private TipoDocumento tipoPredefinido() {
        return TipoDocumento.builder()
                .id(1L)
                .nombre("PEP")
                .esObligatorio(true)
                .esVersionable(true)
                .esPeriodico(true)
                .periodicidad("ANUAL")
                .esPredefinido(true)
                .build();
    }

    private TipoDocumento tipoCustom() {
        return TipoDocumento.builder()
                .id(10L)
                .nombre("Informe Especial")
                .esObligatorio(false)
                .esVersionable(false)
                .esPeriodico(false)
                .esPredefinido(false)
                .build();
    }

    private TipoDocumentoResponse tipoCustomResponse() {
        return TipoDocumentoResponse.builder()
                .id(10L)
                .nombre("Informe Especial")
                .esObligatorio(false)
                .esVersionable(false)
                .esPeriodico(false)
                .esPredefinido(false)
                .build();
    }

    @Test
    void debeCrearTipoDocumentoCorrectamente() {
        TipoDocumentoCreateRequest request = new TipoDocumentoCreateRequest();
        request.setNombre("Informe Especial");
        request.setEsObligatorio(false);
        request.setEsVersionable(false);
        request.setEsPeriodico(false);

        when(tipoDocumentoRepository.existsByNombre("Informe Especial")).thenReturn(false);
        when(tipoDocumentoMapper.toEntity(request)).thenReturn(tipoCustom());
        when(tipoDocumentoRepository.save(any(TipoDocumento.class))).thenReturn(tipoCustom());
        when(tipoDocumentoMapper.toResponse(any(TipoDocumento.class))).thenReturn(tipoCustomResponse());

        TipoDocumentoResponse response = tipoDocumentoService.crearTipoDocumento(request);

        assertThat(response.getNombre()).isEqualTo("Informe Especial");
        assertThat(response.getEsPredefinido()).isFalse();
    }

    @Test
    void debeLanzarDuplicateResourceAlCrearConNombreExistente() {
        TipoDocumentoCreateRequest request = new TipoDocumentoCreateRequest();
        request.setNombre("PEP");

        when(tipoDocumentoRepository.existsByNombre("PEP")).thenReturn(true);

        assertThatThrownBy(() -> tipoDocumentoService.crearTipoDocumento(request))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void debeListarTodosLosTiposDocumento() {
        when(tipoDocumentoRepository.findAll()).thenReturn(List.of(tipoPredefinido(), tipoCustom()));
        when(tipoDocumentoMapper.toResponse(any(TipoDocumento.class))).thenReturn(tipoCustomResponse());

        List<TipoDocumentoResponse> resultado = tipoDocumentoService.listarTiposDocumento();

        assertThat(resultado).hasSize(2);
    }

    @Test
    void debeObtenerTipoDocumentoPorId() {
        when(tipoDocumentoRepository.findById(1L)).thenReturn(Optional.of(tipoPredefinido()));
        when(tipoDocumentoMapper.toResponse(any(TipoDocumento.class))).thenReturn(tipoCustomResponse());

        TipoDocumentoResponse response = tipoDocumentoService.obtenerTipoDocumentoPorId(1L);

        assertThat(response).isNotNull();
    }

    @Test
    void debeActualizarTipoDocumentoNoPredefinido() {
        TipoDocumentoUpdateRequest request = new TipoDocumentoUpdateRequest();
        request.setNombre("Informe Modificado");
        request.setEsObligatorio(true);
        request.setEsVersionable(false);
        request.setEsPeriodico(false);

        TipoDocumento tipo = tipoCustom();

        when(tipoDocumentoRepository.findById(10L)).thenReturn(Optional.of(tipo));
        when(tipoDocumentoRepository.save(any(TipoDocumento.class))).thenReturn(tipo);
        when(tipoDocumentoMapper.toResponse(any(TipoDocumento.class))).thenReturn(tipoCustomResponse());

        TipoDocumentoResponse response = tipoDocumentoService.actualizarTipoDocumento(10L, request);

        assertThat(response).isNotNull();
        verify(tipoDocumentoRepository).save(tipo);
    }

    @Test
    void debeLanzarIllegalOperationAlActualizarPredefinido() {
        TipoDocumentoUpdateRequest request = new TipoDocumentoUpdateRequest();
        request.setNombre("PEP Modificado");

        when(tipoDocumentoRepository.findById(1L)).thenReturn(Optional.of(tipoPredefinido()));

        assertThatThrownBy(() -> tipoDocumentoService.actualizarTipoDocumento(1L, request))
                .isInstanceOf(IllegalOperationException.class);
    }

    @Test
    void debeEliminarTipoDocumentoNoPredefinido() {
        TipoDocumento tipo = tipoCustom();

        when(tipoDocumentoRepository.findById(10L)).thenReturn(Optional.of(tipo));

        tipoDocumentoService.eliminarTipoDocumento(10L);

        verify(tipoDocumentoRepository).delete(tipo);
    }

    @Test
    void debeLanzarIllegalOperationAlEliminarPredefinido() {
        when(tipoDocumentoRepository.findById(1L)).thenReturn(Optional.of(tipoPredefinido()));

        assertThatThrownBy(() -> tipoDocumentoService.eliminarTipoDocumento(1L))
                .isInstanceOf(IllegalOperationException.class);
        verify(tipoDocumentoRepository, never()).delete(any());
    }
}
