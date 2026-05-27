package pe.edu.pucp.signaedu.signaedu_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Informacion de contacto de un actor del sistema. Usada por el modulo
 * de coordinacion para que docentes/padres/SAANEE puedan ver con quien
 * comunicarse sin exponer la API admin de usuarios.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ContactoResponse {
    private Long usuarioId;
    private String rol;
    private String nombre;
    private String apellido;
    private String correo;
    private String telefono;
}