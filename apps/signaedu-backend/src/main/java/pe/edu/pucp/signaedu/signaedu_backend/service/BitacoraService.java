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
import pe.edu.pucp.signaedu.signaedu_backend.model.Indicador;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoEntrada;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoNotificacion;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;
import pe.edu.pucp.signaedu.signaedu_backend.repository.AlumnoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.EntradaArchivoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.EntradaExpedienteRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.ExpedienteRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.IndicadorRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.UsuarioRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.specs.EntradaExpedienteSpecs;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.EnumSet;
import java.util.HashMap;
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
                    TipoEntrada.APOYO_O_AJUSTE,
                    TipoEntrada.EVALUACION_INDICADOR),
            TipoRol.PADRE, EnumSet.of(TipoEntrada.COMUNICACION_FAMILIAR),
            TipoRol.SAANEE, EnumSet.of(TipoEntrada.FEEDBACK_SAANEE)
    );

    private static final Set<TipoEntrada> TIPOS_DIFERIDOS = EnumSet.of(
            TipoEntrada.EVENTO_AGENDA,
            TipoEntrada.DOCUMENTO_ADJUNTADO
    );

    private final EntradaExpedienteRepository entradaRepository;
    private final EntradaArchivoRepository entradaArchivoRepository;
    private final ExpedienteRepository expedienteRepository;
    private final AlumnoRepository alumnoRepository;
    private final UsuarioRepository usuarioRepository;
    private final IndicadorRepository indicadorRepository;
    private final ConfiguracionService configuracionService;
    private final EntradaExpedienteMapper mapper;
    private final NotificacionService notificacionService;

    private static final DateTimeFormatter CSV_FECHA_FORMATO =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private static final String[] CSV_CABECERAS = {
            "id", "fecha", "tipo", "autor", "rol_autor",
            "titulo", "contenido", "entrada_raiz_id", "evento_id",
            "archivos_adjuntos_count"
    };

    @Transactional
    public EntradaExpedienteResponse crear(Long alumnoId, EntradaExpedienteRequest request) {
        Usuario autor = validarAccesoYObtenerUsuario(alumnoId);
        Expediente expediente = obtenerExpedienteVigenteOLanzar(alumnoId);

        EntradaExpediente raiz = cargarYValidarRaiz(request.getEntradaRaizId(), expediente);
        validarTipoPermitido(request.getTipo(), autor, raiz);
        Indicador indicador = validarYCargarIndicador(request, raiz);

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
                .indicador(indicador)
                .resultadoLogrado(request.getResultadoLogrado())
                .build();

        EntradaExpediente guardada = entradaRepository.save(entrada);

        // Notificacion automatica: si la entrada esta dirigida a un usuario
        // distinto del autor, se le avisa con referencia a la entrada.
        if (dirigidoA != null && !dirigidoA.getId().equals(autor.getId())) {
            notificacionService.crear(
                    dirigidoA,
                    construirMensajeEntradaDirigida(autor, guardada),
                    TipoNotificacion.ENTRADA_EXPD,
                    guardada.getId(),
                    autor);
        }

        return mapper.toResponse(guardada);
    }

    private String construirMensajeEntradaDirigida(Usuario autor, EntradaExpediente entrada) {
        String nombreAutor = autor.getNombre() + " " + autor.getApellido();
        var alumno = entrada.getExpediente().getAlumno();
        String nombreAlumno = alumno.getNombre() + " " + alumno.getApellido();
        String base = nombreAutor + " te escribio en el expediente de " + nombreAlumno;
        String titulo = entrada.getTitulo();
        return (titulo != null && !titulo.isBlank())
                ? base + ": " + titulo
                : base;
    }

    /**
     * @param periodo periodo lectivo a consultar. Si es null se usa el vigente,
     *                conservando el comportamiento historico (ver
     *                {@link #obtenerExpedienteParaLectura}).
     */
    @Transactional(readOnly = true)
    public List<EntradaExpedienteResponse> listar(
            Long alumnoId, TipoEntrada tipo, LocalDateTime desde, LocalDateTime hasta,
            String periodo) {
        validarAccesoYObtenerUsuario(alumnoId);

        Optional<Expediente> expediente = obtenerExpedienteParaLectura(alumnoId, periodo);
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

    /**
     * Exporta la bitacora del alumno a CSV (RFC 4180) reutilizando los mismos
     * filtros y reglas de visibilidad de {@link #listar}. Las filas se ordenan
     * por fecha ascendente (cronologico) para facilitar lectura del archivo.
     * Columnas: id, fecha, tipo, autor, rol_autor, titulo, contenido,
     * entrada_raiz_id, evento_id, archivos_adjuntos_count.
     */
    @Transactional(readOnly = true)
    public String exportarCsv(
            Long alumnoId, TipoEntrada tipo, LocalDateTime desde, LocalDateTime hasta) {
        validarAccesoYObtenerUsuario(alumnoId);

        StringBuilder csv = new StringBuilder();
        escribirCabecera(csv);

        Optional<Expediente> expediente = obtenerExpedienteVigente(alumnoId);
        if (expediente.isEmpty()) {
            return csv.toString();
        }

        Specification<EntradaExpediente> spec = Specification.allOf(
                EntradaExpedienteSpecs.delExpediente(expediente.get().getId()),
                EntradaExpedienteSpecs.conTipo(tipo),
                EntradaExpedienteSpecs.desde(desde),
                EntradaExpedienteSpecs.hasta(hasta)
        );

        List<EntradaExpediente> entradas = entradaRepository.findAll(
                spec, Sort.by(Sort.Direction.ASC, "fecha"));

        Map<Long, Long> conteoAdjuntos = obtenerConteoAdjuntos(entradas);

        for (EntradaExpediente entrada : entradas) {
            escribirFila(csv, entrada, conteoAdjuntos.getOrDefault(entrada.getId(), 0L));
        }

        return csv.toString();
    }

    private Map<Long, Long> obtenerConteoAdjuntos(List<EntradaExpediente> entradas) {
        if (entradas.isEmpty()) {
            return Map.of();
        }
        List<Long> ids = entradas.stream().map(EntradaExpediente::getId).toList();
        Map<Long, Long> resultado = new HashMap<>();
        for (Object[] fila : entradaArchivoRepository.contarPorEntradaIds(ids)) {
            resultado.put((Long) fila[0], (Long) fila[1]);
        }
        return resultado;
    }

    private void escribirCabecera(StringBuilder csv) {
        for (int i = 0; i < CSV_CABECERAS.length; i++) {
            if (i > 0) csv.append(',');
            csv.append(CSV_CABECERAS[i]);
        }
        csv.append("\r\n");
    }

    private void escribirFila(StringBuilder csv, EntradaExpediente entrada, long countAdjuntos) {
        Usuario autor = entrada.getUsuario();
        String nombreAutor = autor != null
                ? (autor.getNombre() + " " + autor.getApellido()).trim()
                : "";
        String rolAutor = autor != null && !autor.getRoles().isEmpty()
                ? autor.getRoles().iterator().next().getNombre().name()
                : "";
        Long entradaRaizId = entrada.getEntradaRaiz() != null
                ? entrada.getEntradaRaiz().getId() : null;
        Long eventoId = entrada.getEvento() != null
                ? entrada.getEvento().getId() : null;

        appendCampo(csv, String.valueOf(entrada.getId()));
        csv.append(',');
        appendCampo(csv, entrada.getFecha().format(CSV_FECHA_FORMATO));
        csv.append(',');
        appendCampo(csv, entrada.getTipoEntrada().name());
        csv.append(',');
        appendCampo(csv, nombreAutor);
        csv.append(',');
        appendCampo(csv, rolAutor);
        csv.append(',');
        appendCampo(csv, entrada.getTitulo());
        csv.append(',');
        appendCampo(csv, entrada.getDescripcion());
        csv.append(',');
        appendCampo(csv, entradaRaizId != null ? entradaRaizId.toString() : "");
        csv.append(',');
        appendCampo(csv, eventoId != null ? eventoId.toString() : "");
        csv.append(',');
        appendCampo(csv, String.valueOf(countAdjuntos));
        csv.append("\r\n");
    }

    /**
     * Escapa un campo CSV segun RFC 4180: si contiene coma, comilla doble
     * o salto de linea, lo envuelve en comillas y dobla las internas.
     */
    private void appendCampo(StringBuilder csv, String valor) {
        if (valor == null || valor.isEmpty()) {
            return;
        }
        boolean requiereEscape = valor.indexOf(',') >= 0
                || valor.indexOf('"') >= 0
                || valor.indexOf('\n') >= 0
                || valor.indexOf('\r') >= 0;
        if (!requiereEscape) {
            csv.append(valor);
            return;
        }
        csv.append('"');
        for (int i = 0; i < valor.length(); i++) {
            char c = valor.charAt(i);
            if (c == '"') csv.append('"');
            csv.append(c);
        }
        csv.append('"');
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

    /**
     * Resuelve el expediente a LEER. Escribir y ver no son la misma pregunta:
     * la escritura siempre va al unico expediente activo del periodo vigente
     * ({@link #obtenerExpedienteVigenteOLanzar}), mientras que la lectura puede
     * apuntar a un periodo anterior ya cerrado.
     *
     * <p>Sin {@code periodo} el comportamiento es el de siempre: expediente
     * vigente + ACTIVO, y lista vacia si no hay (decision de Fase 2b). Con
     * {@code periodo} se resuelve ese periodo concreto ignorando el estado,
     * porque un expediente cerrado se consulta pero no se edita.
     */
    private Optional<Expediente> obtenerExpedienteParaLectura(Long alumnoId, String periodo) {
        if (periodo == null || periodo.isBlank()) {
            return obtenerExpedienteVigente(alumnoId);
        }
        return expedienteRepository.findByAlumnoIdAndPeriodoLectivo(alumnoId, periodo);
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

    private Indicador validarYCargarIndicador(EntradaExpedienteRequest request, EntradaExpediente raiz) {
        boolean esEvaluacionRaiz = raiz == null && request.getTipo() == TipoEntrada.EVALUACION_INDICADOR;

        if (esEvaluacionRaiz) {
            if (request.getIndicadorId() == null) {
                throw new IllegalOperationException(
                        "El indicadorId es obligatorio para entradas de tipo EVALUACION_INDICADOR");
            }
            Indicador indicador = indicadorRepository.findById(request.getIndicadorId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Indicador", "id", request.getIndicadorId()));
            if (!Boolean.TRUE.equals(indicador.getActivo())) {
                throw new IllegalOperationException(
                        "No se puede evaluar un indicador inactivo");
            }
            return indicador;
        }

        if (request.getIndicadorId() != null) {
            throw new IllegalOperationException(
                    "indicadorId solo se permite en entradas raíz de tipo EVALUACION_INDICADOR");
        }
        if (request.getResultadoLogrado() != null) {
            throw new IllegalOperationException(
                    "resultadoLogrado solo se permite en entradas raíz de tipo EVALUACION_INDICADOR");
        }
        return null;
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
