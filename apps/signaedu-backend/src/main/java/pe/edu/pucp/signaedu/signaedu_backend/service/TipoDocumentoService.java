package pe.edu.pucp.signaedu.signaedu_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

@Service
@RequiredArgsConstructor
public class TipoDocumentoService {

    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final TipoDocumentoMapper tipoDocumentoMapper;

    @Transactional
    public TipoDocumentoResponse crearTipoDocumento(TipoDocumentoCreateRequest request) {
        if (tipoDocumentoRepository.existsByNombre(request.getNombre())) {
            throw new DuplicateResourceException("TipoDocumento", "nombre", request.getNombre());
        }

        TipoDocumento tipoDocumento = tipoDocumentoMapper.toEntity(request);
        return tipoDocumentoMapper.toResponse(tipoDocumentoRepository.save(tipoDocumento));
    }

    @Transactional(readOnly = true)
    public List<TipoDocumentoResponse> listarTiposDocumento() {
        return tipoDocumentoRepository.findAll().stream()
                .map(tipoDocumentoMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TipoDocumentoResponse obtenerTipoDocumentoPorId(Long id) {
        TipoDocumento tipoDocumento = tipoDocumentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TipoDocumento", "id", id));
        return tipoDocumentoMapper.toResponse(tipoDocumento);
    }

    @Transactional
    public TipoDocumentoResponse actualizarTipoDocumento(Long id, TipoDocumentoUpdateRequest request) {
        TipoDocumento tipoDocumento = tipoDocumentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TipoDocumento", "id", id));

        if (tipoDocumento.getEsPredefinido()) {
            throw new IllegalOperationException("No se puede modificar un tipo de documento predefinido");
        }

        if (!tipoDocumento.getNombre().equals(request.getNombre())
                && tipoDocumentoRepository.existsByNombre(request.getNombre())) {
            throw new DuplicateResourceException("TipoDocumento", "nombre", request.getNombre());
        }

        tipoDocumento.setNombre(request.getNombre());
        tipoDocumento.setEsObligatorio(request.getEsObligatorio());
        tipoDocumento.setEsVersionable(request.getEsVersionable());
        tipoDocumento.setEsPeriodico(request.getEsPeriodico());
        tipoDocumento.setPeriodicidad(request.getPeriodicidad());

        return tipoDocumentoMapper.toResponse(tipoDocumentoRepository.save(tipoDocumento));
    }

    @Transactional
    public void eliminarTipoDocumento(Long id) {
        TipoDocumento tipoDocumento = tipoDocumentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TipoDocumento", "id", id));

        if (tipoDocumento.getEsPredefinido()) {
            throw new IllegalOperationException("No se puede eliminar un tipo de documento predefinido");
        }

        tipoDocumentoRepository.delete(tipoDocumento);
    }
}
