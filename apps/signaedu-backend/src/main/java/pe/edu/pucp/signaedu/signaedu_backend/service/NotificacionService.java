package pe.edu.pucp.signaedu.signaedu_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.NotificacionResponse;
import pe.edu.pucp.signaedu.signaedu_backend.exception.ResourceNotFoundException;
import pe.edu.pucp.signaedu.signaedu_backend.mapper.NotificacionMapper;
import pe.edu.pucp.signaedu.signaedu_backend.model.Notificacion;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoNotificacion;
import pe.edu.pucp.signaedu.signaedu_backend.repository.NotificacionRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.UsuarioRepository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Notificaciones del sistema. El metodo {@link #crear} es invocado por
 * otros services como side-effect de acciones notificables (crear evento,
 * cancelar, responder asistencia, registrar resultado, entrada dirigida).
 * NO se expone como endpoint publico.
 *
 * Los endpoints publicos exponen solo lectura y marcado como leida.
 */
@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacionMapper notificacionMapper;

    // ============ API interna (sin endpoint) ============

    /**
     * Crea una notificacion para el destinatario indicado.
     * Side-effect; los services que la disparan no esperan respuesta util.
     */
    @Transactional
    public void crear(Usuario destinatario,
                      String mensaje,
                      TipoNotificacion referenciaTipo,
                      Long referenciaId,
                      Usuario usuarioCreador) {
        Notificacion notificacion = Notificacion.builder()
                .usuario(destinatario)
                .mensaje(mensaje)
                .referenciaTipo(referenciaTipo)
                .referenciaId(referenciaId)
                .usuarioCreador(usuarioCreador)
                .fechaCreacion(LocalDateTime.now())
                .build();
        notificacionRepository.save(notificacion);
    }

    // ============ API publica ============

    @Transactional(readOnly = true)
    public List<NotificacionResponse> listarMias() {
        Usuario usuario = obtenerUsuarioAutenticado();
        return notificacionRepository.findByUsuarioIdOrderByFechaCreacionDesc(usuario.getId()).stream()
                .map(notificacionMapper::toResponse)
                .toList();
    }

    @Transactional
    public NotificacionResponse marcarLeida(Long notificacionId) {
        Usuario usuario = obtenerUsuarioAutenticado();
        Notificacion notificacion = notificacionRepository.findById(notificacionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Notificacion", "id", notificacionId));

        if (!notificacion.getUsuario().getId().equals(usuario.getId())) {
            // Privacidad: no se filtra que la notificacion existe pero es de otro;
            // se devuelve 403 igual que el resto del modulo.
            throw new AccessDeniedException("No puede modificar notificaciones de otro usuario");
        }

        if (notificacion.getFechaLectura() == null) {
            notificacion.setFechaLectura(LocalDateTime.now());
        }
        return notificacionMapper.toResponse(notificacion);
    }

    @Transactional
    public int marcarTodasLeidas() {
        Usuario usuario = obtenerUsuarioAutenticado();
        return notificacionRepository.marcarTodasLeidasParaUsuario(usuario.getId(), LocalDateTime.now());
    }

    // ============ helpers ============

    private Usuario obtenerUsuarioAutenticado() {
        String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "correo", correo));
    }
}
