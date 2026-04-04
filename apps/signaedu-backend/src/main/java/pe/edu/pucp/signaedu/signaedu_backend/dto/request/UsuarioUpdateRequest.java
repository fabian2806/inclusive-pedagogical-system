package pe.edu.pucp.signaedu.signaedu_backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;

@Data
public class UsuarioUpdateRequest {

    @NotBlank
    private String nombre;

    @NotBlank
    private String apellido;

    @NotBlank
    @Email
    private String correo;

    private String telefono;

    @Size(min = 6)
    private String password;

    private TipoRol rol;
}
