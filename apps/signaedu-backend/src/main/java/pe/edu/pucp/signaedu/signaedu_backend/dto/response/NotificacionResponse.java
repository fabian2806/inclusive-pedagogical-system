package pe.edu.pucp.signaedu.signaedu_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificacionResponse {
    private Long id;
    private String mensaje;
    private String referenciaTipo;
    private Long referenciaId;
    private UsuarioBitacoraResponse usuarioCreador;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaLectura;
}
