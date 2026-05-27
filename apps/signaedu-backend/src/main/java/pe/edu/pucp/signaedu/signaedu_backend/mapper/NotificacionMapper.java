package pe.edu.pucp.signaedu.signaedu_backend.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.NotificacionResponse;
import pe.edu.pucp.signaedu.signaedu_backend.model.Notificacion;

@Component
@RequiredArgsConstructor
public class NotificacionMapper {

    private final UsuarioMapper usuarioMapper;

    public NotificacionResponse toResponse(Notificacion notificacion) {
        return NotificacionResponse.builder()
                .id(notificacion.getId())
                .mensaje(notificacion.getMensaje())
                .referenciaTipo(notificacion.getReferenciaTipo().name())
                .referenciaId(notificacion.getReferenciaId())
                .usuarioCreador(notificacion.getUsuarioCreador() != null
                        ? usuarioMapper.toBitacoraResponse(notificacion.getUsuarioCreador())
                        : null)
                .fechaCreacion(notificacion.getFechaCreacion())
                .fechaLectura(notificacion.getFechaLectura())
                .build();
    }
}
