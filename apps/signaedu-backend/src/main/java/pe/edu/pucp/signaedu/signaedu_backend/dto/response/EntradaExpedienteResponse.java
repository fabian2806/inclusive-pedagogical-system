package pe.edu.pucp.signaedu.signaedu_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EntradaExpedienteResponse {
    private Long id;
    private Long expedienteId;
    private String tipo;
    private UsuarioBitacoraResponse autor;
    private LocalDateTime fecha;
    private String titulo;
    private String descripcion;
    private Long entradaRaizId;
    private String nivelImportancia;
    private UsuarioBitacoraResponse dirigidoA;
    private String severidad;
    private String resultado;
    private IndicadorBitacoraResponse indicador;
    private Boolean resultadoLogrado;
}
