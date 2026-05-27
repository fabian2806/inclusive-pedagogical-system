package pe.edu.pucp.signaedu.signaedu_backend.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.EventoArchivoCreateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.EventoArchivoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.exception.IllegalOperationException;
import pe.edu.pucp.signaedu.signaedu_backend.exception.ResourceNotFoundException;
import pe.edu.pucp.signaedu.signaedu_backend.mapper.EventoArchivoMapper;
import pe.edu.pucp.signaedu.signaedu_backend.model.ArchivoAdjunto;
import pe.edu.pucp.signaedu.signaedu_backend.model.Evento;
import pe.edu.pucp.signaedu.signaedu_backend.model.EventoArchivo;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoEvento;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;
import pe.edu.pucp.signaedu.signaedu_backend.repository.ArchivoAdjuntoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.EventoArchivoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.EventoRepository;
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

/**
 * Gestion de archivos adjuntos pre-evento (agenda, materiales).
 * Sin UI en Fase 4 segun plan, pero la API queda operativa para que
 * pueda enchufarse mas adelante sin retocar backend.
 *
 * Patron espejo de {@link EntradaArchivoService}: mismas validaciones de
 * MIME/tamano, mismo flujo "placeholder -> key -> guardar al final".
 */
@Service
@RequiredArgsConstructor
public class EventoArchivoService {

    private final EventoArchivoRepository eventoArchivoRepository;
    private final EventoRepository eventoRepository;
    private final ArchivoAdjuntoRepository archivoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ArchivoStorage archivoStorage;
    private final EventoArchivoMapper eventoArchivoMapper;

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
    public EventoArchivoResponse adjuntar(Long eventoId,
                                          EventoArchivoCreateRequest request,
                                          MultipartFile archivo) {
        Usuario autor = obtenerUsuarioAutenticado();
        Evento evento = cargarEvento(eventoId);

        if (!evento.getUsuarioCreador().getId().equals(autor.getId())) {
            throw new AccessDeniedException("Solo el creador del evento puede adjuntar archivos");
        }
        if (evento.getEstado() != EstadoEvento.ACTIVO) {
            throw new IllegalOperationException(
                    "Solo se pueden adjuntar archivos a eventos en estado ACTIVO");
        }
        validarArchivo(archivo);

        String tipoNormalizado = normalizar(request != null ? request.getTipo() : null);
        String descripcionNormalizada = normalizar(request != null ? request.getDescripcion() : null);

        LocalDateTime ahora = LocalDateTime.now();
        ArchivoAdjunto archivoEntity = persistirArchivoConPlaceholder(archivo, ahora);
        String key = construirKey(archivoEntity.getId(), archivo.getOriginalFilename());
        archivoEntity.setRutaAlmacenamiento(key);

        EventoArchivo eventoArchivo = eventoArchivoRepository.save(EventoArchivo.builder()
                .evento(evento)
                .archivo(archivoEntity)
                .tipo(tipoNormalizado)
                .descripcion(descripcionNormalizada)
                .usuarioSubido(autor)
                .build());

        // Storage como ultimo paso: si falla, rollback transaccional + nada en disco.
        guardarArchivoEnStorage(archivo, key);

        return eventoArchivoMapper.toResponse(eventoArchivo);
    }

    @Transactional(readOnly = true)
    public List<EventoArchivoResponse> listar(Long eventoId) {
        Usuario usuario = obtenerUsuarioAutenticado();
        Evento evento = cargarEvento(eventoId);
        validarVisibilidad(evento, usuario);

        return eventoArchivoRepository.findByEventoIdOrderByIdAsc(eventoId).stream()
                .map(eventoArchivoMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ArchivoDescargaResource descargar(Long eventoId, Long archivoId) {
        Usuario usuario = obtenerUsuarioAutenticado();
        Evento evento = cargarEvento(eventoId);
        validarVisibilidad(evento, usuario);

        EventoArchivo eventoArchivo = eventoArchivoRepository.findById(archivoId)
                .orElseThrow(() -> new ResourceNotFoundException("EventoArchivo", "id", archivoId));

        if (!eventoArchivo.getEvento().getId().equals(eventoId)) {
            throw new ResourceNotFoundException("EventoArchivo", "id", archivoId);
        }

        ArchivoAdjunto archivo = eventoArchivo.getArchivo();
        return new ArchivoDescargaResource(
                archivoStorage.leer(archivo.getRutaAlmacenamiento()),
                archivo.getNombreOriginal(),
                archivo.getMimeType(),
                archivo.getTamano());
    }

    // ============ helpers de archivo ============

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
        return "eventos/" + archivoId + ext;
    }

    private void guardarArchivoEnStorage(MultipartFile archivo, String key) {
        try {
            archivoStorage.guardar(key, archivo.getInputStream(), archivo.getSize());
        } catch (IOException e) {
            throw new StorageException("Error al leer archivo recibido para guardar", e);
        }
    }

    private String normalizar(String valor) {
        if (valor == null) {
            return null;
        }
        String trimmed = valor.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    // ============ helpers de acceso (espejo de EventoService) ============

    private Evento cargarEvento(Long eventoId) {
        return eventoRepository.findById(eventoId)
                .orElseThrow(() -> new ResourceNotFoundException("Evento", "id", eventoId));
    }

    private void validarVisibilidad(Evento evento, Usuario usuario) {
        if (esAdmin(usuario) || evento.getUsuarioCreador().getId().equals(usuario.getId())) {
            return;
        }
        boolean invitado = evento.getInvitados().stream()
                .anyMatch(inv -> inv.getUsuario().getId().equals(usuario.getId()));
        if (!invitado) {
            throw new AccessDeniedException("No tiene acceso al evento con id " + evento.getId());
        }
    }

    private boolean esAdmin(Usuario usuario) {
        return usuario.getRoles().stream().anyMatch(r -> r.getNombre() == TipoRol.ADMIN);
    }

    private Usuario obtenerUsuarioAutenticado() {
        String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "correo", correo));
    }
}
