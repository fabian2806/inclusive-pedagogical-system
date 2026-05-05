package pe.edu.pucp.signaedu.signaedu_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.EntradaExpedienteRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.EntradaExpedienteResponse;
import pe.edu.pucp.signaedu.signaedu_backend.exception.IllegalOperationException;
import pe.edu.pucp.signaedu.signaedu_backend.exception.ResourceNotFoundException;
import pe.edu.pucp.signaedu.signaedu_backend.mapper.EntradaExpedienteMapper;
import pe.edu.pucp.signaedu.signaedu_backend.model.EntradaExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.Expediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoEntrada;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;
import pe.edu.pucp.signaedu.signaedu_backend.repository.AlumnoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.EntradaExpedienteRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.ExpedienteRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.UsuarioRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.specs.EntradaExpedienteSpecs;

import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class BitacoraService {

    private static final Map<TipoRol, Set<TipoEntrada>> TIPOS_POR_ROL = Map.of(
            TipoRol.DOCENTE, EnumSet.of(
                    TipoEntrada.OBSERVACION_PEDAGOGICA,
                    TipoEntrada.INCIDENCIA_COMUNICACION,
                    TipoEntrada.APOYO_O_AJUSTE),
            TipoRol.PADRE, EnumSet.of(TipoEntrada.COMUNICACION_FAMILIAR),
            TipoRol.SAANEE, EnumSet.of(TipoEntrada.FEEDBACK_SAANEE)
    );

    private static final Set<TipoEntrada> TIPOS_DIFERIDOS = EnumSet.of(
            TipoEntrada.EVALUACION_INDICADOR,
            TipoEntrada.EVENTO_AGENDA,
            TipoEntrada.DOCUMENTO_ADJUNTADO
    );

    private final EntradaExpedienteRepository entradaRepository;
    private final ExpedienteRepository expedienteRepository;
    private final AlumnoRepository alumnoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ConfiguracionService configuracionService;
    private final EntradaExpedienteMapper mapper;

    @Transactional
    public EntradaExpedienteResponse crear(Long alumnoId, EntradaExpedienteRequest request) {
        Usuario autor = validarAccesoYObtenerUsuario(alumnoId);
        Expediente expediente = obtenerExpedienteVigenteOLanzar(alumnoId);

        EntradaExpediente raiz = cargarYValidarRaiz(request.getEntradaRaizId(), expediente);
        validarTipoPermitido(request.getTipo(), autor, raiz);

        // dirigidoAUsuarioId se persiste tal cual; no se valida (campo informativo, sin lógica activa).
        // Si el id no existe, la FK de Postgres rechazará el INSERT.
        Usuario dirigidoA = request.getDirigidoAUsuarioId() != null
                ? usuarioRepository.getReferenceById(request.getDirigidoAUsuarioId())
                : null;

        EntradaExpediente entrada = EntradaExpediente.builder()
                .expediente(expediente)
                .tipoEntrada(request.getTipo())
                .usuario(autor)
                .fecha(LocalDateTime.now())
                .titulo(request.getTitulo())
                .descripcion(request.getDescripcion())
                .entradaRaiz(raiz)
                .nivelImportancia(request.getNivelImportancia())
                .dirigidoA(dirigidoA)
                .severidad(request.getSeveridad())
                .resultado(request.getResultado())
                .build();

        return mapper.toResponse(entradaRepository.save(entrada));
    }

    @Transactional(readOnly = true)
    public List<EntradaExpedienteResponse> listar(
            Long alumnoId, TipoEntrada tipo, LocalDateTime desde, LocalDateTime hasta) {
        validarAccesoYObtenerUsuario(alumnoId);

        Optional<Expediente> expediente = obtenerExpedienteVigente(alumnoId);
        if (expediente.isEmpty()) {
            return List.of();
        }

        Specification<EntradaExpediente> spec = Specification.allOf(
                EntradaExpedienteSpecs.delExpediente(expediente.get().getId()),
                EntradaExpedienteSpecs.conTipo(tipo),
                EntradaExpedienteSpecs.desde(desde),
                EntradaExpedienteSpecs.hasta(hasta)
        );

        return entradaRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "fecha")).stream()
                .map(mapper::toResponse)
                .toList();
    }

    private Expediente obtenerExpedienteVigenteOLanzar(Long alumnoId) {
        return obtenerExpedienteVigente(alumnoId)
                .orElseThrow(() -> new IllegalOperationException(
                        "El alumno no tiene un expediente activo en el periodo vigente"));
    }

    private Optional<Expediente> obtenerExpedienteVigente(Long alumnoId) {
        String periodo = configuracionService.obtenerValorPeriodo();
        return expedienteRepository.findByAlumnoIdAndPeriodoLectivoAndEstado(
                alumnoId, periodo, EstadoExpediente.ACTIVO);
    }

    private EntradaExpediente cargarYValidarRaiz(Long raizId, Expediente expediente) {
        if (raizId == null) {
            return null;
        }

        EntradaExpediente raiz = entradaRepository.findById(raizId)
                .orElseThrow(() -> new ResourceNotFoundException("EntradaExpediente", "id", raizId));

        if (!raiz.getExpediente().getId().equals(expediente.getId())) {
            throw new IllegalOperationException(
                    "La entrada raíz pertenece a otro expediente");
        }

        if (raiz.getEntradaRaiz() != null) {
            throw new IllegalOperationException(
                    "No se permite responder a una respuesta (solo entradas raíz)");
        }

        return raiz;
    }

    private void validarTipoPermitido(TipoEntrada tipo, Usuario autor, EntradaExpediente raiz) {
        if (TIPOS_DIFERIDOS.contains(tipo)) {
            throw new IllegalOperationException(
                    "El tipo de entrada " + tipo + " no está disponible en esta fase");
        }

        if (raiz != null) {
            if (tipo != raiz.getTipoEntrada()) {
                throw new IllegalOperationException(
                        "El tipo de la respuesta debe coincidir con el tipo de la entrada raíz: "
                                + raiz.getTipoEntrada());
            }
            return;
        }

        boolean permitido = autor.getRoles().stream()
                .anyMatch(rol -> TIPOS_POR_ROL.getOrDefault(rol.getNombre(), Set.of()).contains(tipo));

        if (!permitido) {
            throw new IllegalOperationException(
                    "El rol del usuario no permite crear entradas de tipo " + tipo);
        }
    }

    private Usuario validarAccesoYObtenerUsuario(Long alumnoId) {
        if (!alumnoRepository.existsById(alumnoId)) {
            throw new ResourceNotFoundException("Alumno", "id", alumnoId);
        }

        String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "correo", correo));

        boolean tieneAcceso = usuario.getRoles().stream()
                .anyMatch(rol -> verificarAccesoPorRol(rol.getNombre(), alumnoId, usuario.getId()));

        if (!tieneAcceso) {
            throw new AccessDeniedException("No tiene acceso al alumno con id " + alumnoId);
        }

        return usuario;
    }

    private boolean verificarAccesoPorRol(TipoRol rol, Long alumnoId, Long usuarioId) {
        return switch (rol) {
            case DOCENTE -> alumnoRepository.existsByIdAndDocentesId(alumnoId, usuarioId);
            case PADRE -> alumnoRepository.existsByIdAndPadresId(alumnoId, usuarioId);
            case SAANEE -> true;
            case ADMIN -> false;
        };
    }
}
