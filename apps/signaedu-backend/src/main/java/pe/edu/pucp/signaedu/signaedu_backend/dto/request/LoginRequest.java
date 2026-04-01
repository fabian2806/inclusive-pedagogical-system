package pe.edu.pucp.signaedu.signaedu_backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank
    @Email
    private String correo;

    @NotBlank
    private String password;
}
