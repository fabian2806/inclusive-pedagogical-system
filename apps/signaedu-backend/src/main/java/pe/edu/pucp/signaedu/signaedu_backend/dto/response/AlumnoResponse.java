package pe.edu.pucp.signaedu.signaedu_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AlumnoResponse {
    private Long id;
    private String nombre;
    private String apellido;
    private Long idFotoPerfil;
    private LocalDate fechaNacimiento;
    private String grado;
    private String seccion;
    private String estado;
    private List<UsuarioSimpleResponse> docentes;
    private List<UsuarioSimpleResponse> padres;
}
