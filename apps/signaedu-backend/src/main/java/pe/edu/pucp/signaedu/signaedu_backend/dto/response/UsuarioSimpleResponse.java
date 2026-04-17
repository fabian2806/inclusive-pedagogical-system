package pe.edu.pucp.signaedu.signaedu_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UsuarioSimpleResponse {
    private Long id;
    private String nombre;
    private String apellido;
    private String correo;
    private String telefono;
}
