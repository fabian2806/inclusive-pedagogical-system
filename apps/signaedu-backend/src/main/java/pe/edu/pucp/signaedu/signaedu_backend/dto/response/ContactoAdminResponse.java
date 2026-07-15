package pe.edu.pucp.signaedu.signaedu_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Datos de contacto del administrador, mostrados en la pantalla de login.
 * El telefono puede venir vacio si no se ha configurado.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactoAdminResponse {
    private String correo;
    private String telefono;
}
