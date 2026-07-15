package pe.edu.pucp.signaedu.signaedu_backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContactoAdminRequest {

    @NotBlank(message = "El correo de contacto es obligatorio")
    @Email(message = "El correo no tiene un formato valido")
    private String correo;

    // Opcional. Si no se envia, se guarda como cadena vacia.
    @Size(max = 30, message = "El telefono no puede superar los 30 caracteres")
    private String telefono;
}
