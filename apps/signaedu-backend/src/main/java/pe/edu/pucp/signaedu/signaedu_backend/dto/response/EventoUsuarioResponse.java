package pe.edu.pucp.signaedu.signaedu_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Vista de un invitado a un evento.
 * El campo motivoRechazo solo se rellena cuando el solicitante es el
 * creador del evento (regla de privacidad del modulo de coordinacion).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventoUsuarioResponse {
    private Long id;
    private UsuarioBitacoraResponse usuario;
    private String estadoAsistencia;
    private LocalDateTime fechaRespuesta;
    private String motivoRechazo;
}
