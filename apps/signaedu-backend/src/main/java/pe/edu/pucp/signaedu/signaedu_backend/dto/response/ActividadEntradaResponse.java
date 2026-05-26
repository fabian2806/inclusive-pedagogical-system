package pe.edu.pucp.signaedu.signaedu_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoEntrada;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ActividadEntradaResponse {
    private Long id;
    private TipoEntrada tipo;
    private LocalDateTime fecha;
    private UsuarioBitacoraResponse autor;
    private Long alumnoId;
    private String alumnoNombre;
    private String alumnoApellido;
    private String titulo;
    private String descripcion;
}
