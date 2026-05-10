package pe.edu.pucp.signaedu.signaedu_backend.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.EntradaArchivoCreateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.EntradaArchivoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.exception.IllegalOperationException;
import pe.edu.pucp.signaedu.signaedu_backend.exception.ResourceNotFoundException;
import pe.edu.pucp.signaedu.signaedu_backend.mapper.EntradaArchivoMapper;
import pe.edu.pucp.signaedu.signaedu_backend.model.ArchivoAdjunto;
import pe.edu.pucp.signaedu.signaedu_backend.model.EntradaArchivo;
import pe.edu.pucp.signaedu.signaedu_backend.model.EntradaExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;
import pe.edu.pucp.signaedu.signaedu_backend.repository.AlumnoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.ArchivoAdjuntoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.EntradaArchivoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.EntradaExpedienteRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.UsuarioRepository;
import pe.edu.pucp.signaedu.signaedu_backend.service.storage.ArchivoStorage;
import pe.edu.pucp.signaedu.signaedu_backend.service.storage.StorageException;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EntradaArchivoService {

    private final EntradaArchivoRepository entradaArchivoRepository;
    private final EntradaExpedienteRepository entradaRepository;
    private final ArchivoAdjuntoRepository archivoRepository;
    private final AlumnoRepository alumnoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ArchivoStorage archivoStorage;
    private final EntradaArchivoMapper entradaArchivoMapper;

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
    public EntradaArchivoResponse adjuntar(Long alumnoId,
                                           Long entradaId,
                                           EntradaArchivoCreateRequest request,
                                           MultipartFile archivo) {
        Usuario autor = validarAccesoYObtenerUsuario(alumnoId);
        EntradaExpediente entrada = cargarEntradaParaAdjuntar(entradaId, alumnoId, autor);
        validarArchivo(archivo);

        String descripcionNormalizada = (request == null
                || request.getDescripcion() == null
                || request.getDescripcion().isBlank())
                ? null
                : request.getDescripcion().trim();

        LocalDateTime ahora = LocalDateTime.now();
        ArchivoAdjunto archivoEntity = persistirArchivoConPlaceholder(archivo, ahora);
        String key = construirKey(archivoEntity.getId(), archivo.getOriginalFilename());
        archivoEntity.setRutaAlmacenamiento(key);

        EntradaArchivo entradaArchivo = entradaArchivoRepository.save(EntradaArchivo.builder()
                .entrada(entrada)
                .archivo(archivoEntity)
                .descripcion(descripcionNormalizada)
                .usuarioSubido(autor)
                .fechaSubida(ahora)
                .build());

        // Storage como ultimo paso: si falla, rollback transaccional + nada en disco.
        guardarArchivoEnStorage(archivo, key);

        return entradaArchivoMapper.toResponse(entradaArchivo);
    }

    @Transactional(readOnly = true)
    public List<EntradaArchivoResponse> listar(Long alumnoId, Long entradaId) {
        validarAccesoYObtenerUsuario(alumnoId);

        EntradaExpediente entrada = entradaRepository.findById(entradaId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "EntradaExpediente", "id", entradaId));

        // La entrada debe pertenecer al expediente del alumno indicado.
        if (!entrada.getExpediente().getAlumno().getId().equals(alumnoId)) {
            throw new ResourceNotFoundException("EntradaExpediente", "id", entradaId);
        }

        return entradaArchivoRepository.findByEntrada_IdOrderByFechaSubidaAsc(entradaId).stream()
                .map(entradaArchivoMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ArchivoDescargaResource descargar(Long alumnoId, Long archivoId) {
        validarAccesoYObtenerUsuario(alumnoId);

        EntradaArchivo entradaArchivo = entradaArchivoRepository.findById(archivoId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "EntradaArchivo", "id", archivoId));

        if (!entradaArchivo.getEntrada().getExpediente().getAlumno().getId().equals(alumnoId)) {
            throw new ResourceNotFoundException("EntradaArchivo", "id", archivoId);
        }

        ArchivoAdjunto archivo = entradaArchivo.getArchivo();
        return new ArchivoDescargaResource(
                archivoStorage.leer(archivo.getRutaAlmacenamiento()),
                archivo.getNombreOriginal(),
                archivo.getMimeType(),
                archivo.getTamano());
    }

    // ============ helpers de dominio ============

    /**
     * Carga la entrada y valida que se pueda adjuntar:
     *   - existe y pertenece al expediente del alumno
     *   - el expediente esta ACTIVO (no se permite adjuntar a expedientes cerrados)
     *   - es entrada raiz (no respuesta)
     *   - el usuario autenticado es su autor original
     */
    private EntradaExpediente cargarEntradaParaAdjuntar(Long entradaId, Long alumnoId, Usuario autor) {
        EntradaExpediente entrada = entradaRepository.findById(entradaId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "EntradaExpediente", "id", entradaId));

        if (!entrada.getExpediente().getAlumno().getId().equals(alumnoId)) {
            throw new ResourceNotFoundException("EntradaExpediente", "id", entradaId);
        }

        if (entrada.getExpediente().getEstado() != EstadoExpediente.ACTIVO) {
            throw new IllegalOperationException(
                    "No se pueden adjuntar archivos a entradas de un expediente cerrado");
        }

        if (entrada.getEntradaRaiz() != null) {
            throw new IllegalOperationException(
                    "Solo se permiten adjuntos en entradas raiz, no en respuestas");
        }

        if (!entrada.getUsuario().getId().equals(autor.getId())) {
            throw new AccessDeniedException(
                    "Solo el autor de la entrada puede adjuntar archivos");
        }

        return entrada;
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

    private ArchivoAdjunto persistirArchivoConPlaceholder(MultipartFile archivo, LocalDateTime ahora) {
        ArchivoAdjunto entity = ArchivoAdjunto.builder()
                .nombreOriginal(archivo.getOriginalFilename() != null
                        ? archivo.getOriginalFilename()
                        : "sin-nombre")
                .mimeType(archivo.getContentType() != null
                        ? archivo.getContentType()
                        : "application/octet-stream")
                .tamano(archivo.getSize())
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
