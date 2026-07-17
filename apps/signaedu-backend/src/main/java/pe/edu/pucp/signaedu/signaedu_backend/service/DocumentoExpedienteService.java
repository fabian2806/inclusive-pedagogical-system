package pe.edu.pucp.signaedu.signaedu_backend.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.DocumentoExpedienteCreateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.DocumentoExpedienteResponse;
import pe.edu.pucp.signaedu.signaedu_backend.exception.DuplicateResourceException;
import pe.edu.pucp.signaedu.signaedu_backend.exception.IllegalOperationException;
import pe.edu.pucp.signaedu.signaedu_backend.exception.ResourceNotFoundException;
import pe.edu.pucp.signaedu.signaedu_backend.mapper.DocumentoExpedienteMapper;
import pe.edu.pucp.signaedu.signaedu_backend.model.ArchivoAdjunto;
import pe.edu.pucp.signaedu.signaedu_backend.model.DocumentoExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.EntradaExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.Expediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.TipoDocumento;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoDocumento;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoEntrada;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;
import pe.edu.pucp.signaedu.signaedu_backend.repository.AlumnoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.ArchivoAdjuntoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.DocumentoExpedienteRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.EntradaExpedienteRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.ExpedienteRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.TipoDocumentoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.UsuarioRepository;
import pe.edu.pucp.signaedu.signaedu_backend.service.storage.ArchivoStorage;
import pe.edu.pucp.signaedu.signaedu_backend.service.storage.StorageException;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentoExpedienteService {

    /**
     * Tipo predefinido "documento formal sin clasificacion especifica".
     * No versiona ni colisiona consigo mismo: un alumno puede tener varias
     * constancias o actas vigentes en el mismo periodo. Decidido en Fase 2d
     * al separar adjuntos casuales (EntradaArchivo) de documentos formales.
     */
    private static final String TIPO_DOCUMENTO_OTRO = "OTRO";

    private final DocumentoExpedienteRepository documentoRepository;
    private final ArchivoAdjuntoRepository archivoRepository;
    private final EntradaExpedienteRepository entradaRepository;
    private final ExpedienteRepository expedienteRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final AlumnoRepository alumnoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ConfiguracionService configuracionService;
    private final ArchivoStorage archivoStorage;
    private final DocumentoExpedienteMapper documentoMapper;

    @Value("${storage.max-bytes:10485760}")
    private long maxBytes;

    @Value("${storage.allowed-mime-types}")
    private String allowedMimesCsv;

    private Set<String> mimesPermitidos;

    @PostConstruct
    void inicializarMimesPermitidos() {
        mimesPermitidos = Arrays.stream(allowedMimesCsv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toUnmodifiableSet());
    }

    @Transactional
    public DocumentoExpedienteResponse subir(Long alumnoId,
                                             DocumentoExpedienteCreateRequest request,
                                             MultipartFile archivo) {
        Usuario autor = validarAccesoYObtenerUsuario(alumnoId);
        Expediente expediente = obtenerExpedienteVigenteOLanzar(alumnoId);
        TipoDocumento tipo = cargarTipoDocumento(request.getTipoDocumentoId());

        // Normalizacion unica del periodo: null o trim no vacio. Reusado en
        // validacion, busqueda de vigente y persistencia para evitar
        // discrepancias por espacios.
        String periodoNormalizado = (request.getPeriodo() == null || request.getPeriodo().isBlank())
                ? null
                : request.getPeriodo().trim();

        validarPeriodicidad(tipo, periodoNormalizado);
        validarArchivo(archivo);

        Integer nuevaVersion;
        if (esTipoOtro(tipo)) {
            // OTRO admite multiples documentos vigentes en simultaneo:
            // no se busca anterior ni se archiva nada.
            nuevaVersion = null;
        } else {
            Optional<DocumentoExpediente> anteriorOpt = buscarVigente(
                    expediente.getId(), tipo.getId(), periodoNormalizado);
            nuevaVersion = computarVersion(tipo, anteriorOpt);
            anteriorOpt.ifPresent(anterior -> {
                anterior.setEstado(EstadoDocumento.ARCHIVADO);
                documentoRepository.save(anterior);
            });
        }

        LocalDateTime ahora = LocalDateTime.now();

        EntradaExpediente entrada = entradaRepository.save(EntradaExpediente.builder()
                .expediente(expediente)
                .tipoEntrada(TipoEntrada.DOCUMENTO_ADJUNTADO)
                .usuario(autor)
                .fecha(ahora)
                .titulo(request.getTitulo())
                .descripcion("Documento subido al expediente: "
                        + tipo.getNombre() + " - " + request.getTitulo())
                .build());

        ArchivoAdjunto archivoEntity = persistirArchivoConPlaceholder(archivo, ahora);
        String key = construirKey(archivoEntity.getId(), archivo.getOriginalFilename());
        archivoEntity.setRutaAlmacenamiento(key);

        DocumentoExpediente documento = documentoRepository.save(DocumentoExpediente.builder()
                .entrada(entrada)
                .tipoDocumento(tipo)
                .archivo(archivoEntity)
                .titulo(request.getTitulo())
                .periodo(periodoNormalizado)
                .version(nuevaVersion)
                .fechaEmision(request.getFechaEmision())
                .fechaSubida(ahora)
                .usuarioSubido(autor)
                .estado(EstadoDocumento.VIGENTE)
                .build());

        // Escritura al storage como ultimo paso: si falla, el rollback
        // transaccional deshace BD y no queda nada en disco.
        guardarArchivoEnStorage(archivo, key);

        return documentoMapper.toResponse(documento);
    }

    /**
     * @param periodo periodo lectivo a consultar. Si es null se usa el vigente,
     *                conservando el comportamiento historico (ver
     *                {@link #obtenerExpedienteParaLectura}).
     */
    @Transactional(readOnly = true)
    public List<DocumentoExpedienteResponse> listar(Long alumnoId, String periodo) {
        validarAccesoYObtenerUsuario(alumnoId);
        Optional<Expediente> expediente = obtenerExpedienteParaLectura(alumnoId, periodo);
        if (expediente.isEmpty()) {
            return List.of();
        }
        return documentoRepository.findByExpedienteId(expediente.get().getId()).stream()
                .map(documentoMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ArchivoDescargaResource descargar(Long alumnoId, Long documentoId) {
        validarAccesoYObtenerUsuario(alumnoId);

        DocumentoExpediente doc = documentoRepository.findById(documentoId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "DocumentoExpediente", "id", documentoId));

        // El documento debe pertenecer al expediente del alumno indicado.
        if (!doc.getEntrada().getExpediente().getAlumno().getId().equals(alumnoId)) {
            throw new ResourceNotFoundException("DocumentoExpediente", "id", documentoId);
        }

        ArchivoAdjunto archivo = doc.getArchivo();
        return new ArchivoDescargaResource(
                archivoStorage.leer(archivo.getRutaAlmacenamiento()),
                archivo.getNombreOriginal(),
                archivo.getMimeType(),
                archivo.getTamano());
    }

    // ============ helpers de dominio ============

    private TipoDocumento cargarTipoDocumento(Long tipoDocumentoId) {
        return tipoDocumentoRepository.findById(tipoDocumentoId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "TipoDocumento", "id", tipoDocumentoId));
    }

    private boolean esTipoOtro(TipoDocumento tipo) {
        return tipo.getNombre() != null
                && TIPO_DOCUMENTO_OTRO.equalsIgnoreCase(tipo.getNombre().trim());
    }

    private void validarPeriodicidad(TipoDocumento tipo, String periodoNormalizado) {
        boolean tienePeriodo = periodoNormalizado != null;
        if (Boolean.TRUE.equals(tipo.getEsPeriodico()) && !tienePeriodo) {
            throw new IllegalOperationException(
                    "El tipo de documento " + tipo.getNombre() + " requiere indicar el periodo");
        }
        if (!Boolean.TRUE.equals(tipo.getEsPeriodico()) && tienePeriodo) {
            throw new IllegalOperationException(
                    "El tipo de documento " + tipo.getNombre() + " no admite periodo");
        }
    }

    private void validarArchivo(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalOperationException("El archivo es obligatorio y no puede estar vacio");
        }
        if (archivo.getSize() > maxBytes) {
            throw new IllegalOperationException(
                    "El archivo supera el tamano maximo permitido de " + maxBytes + " bytes");
        }
        String mime = archivo.getContentType();
        if (mime == null || !mimesPermitidos.contains(mime)) {
            throw new IllegalOperationException(
                    "Tipo MIME no permitido: " + (mime == null ? "(desconocido)" : mime));
        }
    }

    private Optional<DocumentoExpediente> buscarVigente(Long expedienteId, Long tipoId,
                                                        String periodoNormalizado) {
        return periodoNormalizado == null
                ? documentoRepository.findByExpedienteTipoSinPeriodoYEstado(
                        expedienteId, tipoId, EstadoDocumento.VIGENTE)
                : documentoRepository.findByExpedienteTipoPeriodoYEstado(
                        expedienteId, tipoId, periodoNormalizado, EstadoDocumento.VIGENTE);
    }

    private Integer computarVersion(TipoDocumento tipo, Optional<DocumentoExpediente> anteriorOpt) {
        if (anteriorOpt.isPresent()) {
            DocumentoExpediente anterior = anteriorOpt.get();
            if (!Boolean.TRUE.equals(tipo.getEsVersionable())) {
                throw new DuplicateResourceException(
                        "DocumentoExpediente",
                        "tipo+periodo",
                        tipo.getNombre() + " ("
                                + (anterior.getPeriodo() == null ? "sin periodo" : anterior.getPeriodo())
                                + ")");
            }
            int actual = anterior.getVersion() == null ? 1 : anterior.getVersion();
            return actual + 1;
        }
        return Boolean.TRUE.equals(tipo.getEsVersionable()) ? 1 : null;
    }

    private ArchivoAdjunto persistirArchivoConPlaceholder(MultipartFile archivo, LocalDateTime ahora) {
        ArchivoAdjunto entity = ArchivoAdjunto.builder()
                .nombreOriginal(archivo.getOriginalFilename() != null
                        ? archivo.getOriginalFilename()
                        : "sin-nombre")
                .mimeType(archivo.getContentType() != null
                        ? archivo.getContentType()
                        : "application/octet-stream")
                .tamano(archivo.getSize())
                // Placeholder unico (UNIQUE constraint). Se sobreescribe con
                // la key real una vez que JPA asigna el id.
                .rutaAlmacenamiento("PENDIENTE-" + UUID.randomUUID())
                .fechaSubida(ahora)
                .build();
        return archivoRepository.save(entity);
    }

    private String construirKey(Long archivoId, String filenameOriginal) {
        String ext = "";
        if (filenameOriginal != null) {
            int dot = filenameOriginal.lastIndexOf('.');
            if (dot >= 0 && dot < filenameOriginal.length() - 1) {
                ext = filenameOriginal.substring(dot);
            }
        }
        return "expedientes/" + archivoId + ext;
    }

    private void guardarArchivoEnStorage(MultipartFile archivo, String key) {
        try {
            archivoStorage.guardar(key, archivo.getInputStream(), archivo.getSize());
        } catch (IOException e) {
            throw new StorageException("Error al leer archivo recibido para guardar", e);
        }
    }

    // ============ helpers de acceso (espejo de BitacoraService) ============

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
     * Resuelve el expediente a LEER (espejo de BitacoraService). Sin
     * {@code periodo}, expediente vigente + ACTIVO como siempre; con
     * {@code periodo}, ese periodo concreto ignorando el estado, para consultar
     * periodos ya cerrados en solo lectura.
     */
    private Optional<Expediente> obtenerExpedienteParaLectura(Long alumnoId, String periodo) {
        if (periodo == null || periodo.isBlank()) {
            return obtenerExpedienteVigente(alumnoId);
        }
        return expedienteRepository.findByAlumnoIdAndPeriodoLectivo(alumnoId, periodo);
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
