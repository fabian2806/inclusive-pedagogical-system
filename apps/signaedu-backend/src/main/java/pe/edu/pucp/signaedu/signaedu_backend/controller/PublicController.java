package pe.edu.pucp.signaedu.signaedu_backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.ContactoAdminResponse;
import pe.edu.pucp.signaedu.signaedu_backend.service.ConfiguracionService;

/**
 * Endpoints accesibles sin autenticacion (ver SecurityConfig: /public/**).
 * Pensado para datos que la pantalla de login necesita mostrar.
 */
@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
public class PublicController {

    private final ConfiguracionService configuracionService;

    @GetMapping("/contacto-admin")
    public ResponseEntity<ContactoAdminResponse> obtenerContactoAdmin() {
        return ResponseEntity.ok(configuracionService.obtenerContactoAdmin());
    }
}
