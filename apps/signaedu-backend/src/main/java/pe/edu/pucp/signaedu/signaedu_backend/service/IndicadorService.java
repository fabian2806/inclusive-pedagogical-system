package pe.edu.pucp.signaedu.signaedu_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.IndicadorCreateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.IndicadorUpdateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.IndicadorResponse;
import pe.edu.pucp.signaedu.signaedu_backend.exception.ResourceNotFoundException;
import pe.edu.pucp.signaedu.signaedu_backend.mapper.IndicadorMapper;
import pe.edu.pucp.signaedu.signaedu_backend.model.Indicador;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.AreaCurricular;
import pe.edu.pucp.signaedu.signaedu_backend.repository.IndicadorRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.UsuarioRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.specs.IndicadorSpecs;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IndicadorService {

    private final IndicadorRepository indicadorRepository;
    private final UsuarioRepository usuarioRepository;
    private final IndicadorMapper mapper;

    @Transactional
    public IndicadorResponse crear(IndicadorCreateRequest request) {
        Usuario creador = obtenerUsuarioAutenticado();
        Indicador indicador = mapper.toEntity(request, creador);
        return mapper.toResponse(indicadorRepository.save(indicador));
    }

    @Transactional(readOnly = true)
    public List<IndicadorResponse> listar(AreaCurricular areaCurricular, String q, Boolean activo) {
        Specification<Indicador> spec = Specification.allOf(
                IndicadorSpecs.conAreaCurricular(areaCurricular),
                IndicadorSpecs.conQuery(q),
                IndicadorSpecs.conActivo(activo)
        );

        return indicadorRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "nombre")).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public IndicadorResponse obtenerPorId(Long id) {
        return mapper.toResponse(cargarIndicador(id));
    }

    @Transactional
    public IndicadorResponse actualizar(Long id, IndicadorUpdateRequest request) {
        Indicador indicador = cargarIndicador(id);
        validarOwnership(indicador);

        indicador.setNombre(request.getNombre());
        indicador.setDescripcion(request.getDescripcion());
        indicador.setCategoria(request.getCategoria());
        indicador.setAreaCurricular(request.getAreaCurricular());

        return mapper.toResponse(indicadorRepository.save(indicador));
    }

    @Transactional
    public IndicadorResponse desactivar(Long id) {
        return cambiarEstado(id, false);
    }

    @Transactional
    public IndicadorResponse activar(Long id) {
        return cambiarEstado(id, true);
    }

    private IndicadorResponse cambiarEstado(Long id, boolean nuevoEstado) {
        Indicador indicador = cargarIndicador(id);
        validarOwnership(indicador);
        indicador.setActivo(nuevoEstado);
        return mapper.toResponse(indicadorRepository.save(indicador));
    }

    private Indicador cargarIndicador(Long id) {
        return indicadorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Indicador", "id", id));
    }

    private void validarOwnership(Indicador indicador) {
        Usuario actual = obtenerUsuarioAutenticado();
        if (!indicador.getUsuarioCreador().getId().equals(actual.getId())) {
            throw new AccessDeniedException(
                    "Solo el docente que creó el indicador puede modificarlo o cambiar su estado");
        }
    }

    private Usuario obtenerUsuarioAutenticado() {
        String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "correo", correo));
    }
}
