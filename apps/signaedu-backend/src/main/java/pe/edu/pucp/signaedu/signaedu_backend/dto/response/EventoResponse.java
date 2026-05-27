package pe.edu.pucp.signaedu.signaedu_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventoResponse {
    private Long id;
    private String titulo;
    private String descripcion;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private String tipoEvento;
    private String modalidad;
    private String ubicacion;
    private String estado;
    private String motivoCancelacion;
    private AlumnoBasicoResponse alumno;
    private UsuarioBitacoraResponse usuarioCreador;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private List<EventoUsuarioResponse> invitados;
}
