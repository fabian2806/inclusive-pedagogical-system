package pe.edu.pucp.signaedu.signaedu_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AlumnoCreateRequest {

    @NotBlank
    private String nombre;

    @NotBlank
    private String apellido;

    @NotNull
    private LocalDate fechaNacimiento;

    @NotBlank
    private String grado;

    @NotBlank
    private String seccion;
}
