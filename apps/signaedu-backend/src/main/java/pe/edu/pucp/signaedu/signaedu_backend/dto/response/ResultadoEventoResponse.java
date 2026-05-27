package pe.edu.pucp.signaedu.signaedu_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Resultado registrado de un evento finalizado. Representa la
 * EntradaExpediente de tipo EVENTO_AGENDA vinculada al evento + sus
 * archivos adjuntos.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResultadoEventoResponse {
    private Long eventoId;
    private Long entradaId;
    private String titulo;
    private String descripcion;
    private LocalDateTime fecha;
    private UsuarioBitacoraResponse autor;
    private List<EntradaArchivoResponse> archivos;
}
