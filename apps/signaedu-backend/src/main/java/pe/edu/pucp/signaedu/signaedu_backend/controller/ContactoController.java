package pe.edu.pucp.signaedu.signaedu_backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.ContactoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.service.ContactoService;

import java.util.List;

/**
 * Endpoints de contactos (CONTACTO_LEER): rutas absolutas porque exponen
 * vistas distintas (anidada en /alumnos y global en /usuarios). Mantener
 * ambos endpoints juntos facilita auditar todo lo que se expone bajo
 * este permiso.
 */
@RestController
@RequiredArgsConstructor
public class ContactoController {

    private final ContactoService contactoService;

    @GetMapping("/alumnos/{alumnoId}/contactos")
    @PreAuthorize("hasAuthority('CONTACTO_LEER')")
    public ResponseEntity<List<ContactoResponse>> obtenerContactosDelAlumno(
            @PathVariable Long alumnoId) {
        return ResponseEntity.ok(contactoService.obtenerContactosDelAlumno(alumnoId));
    }

    @GetMapping("/usuarios/saanee")
    @PreAuthorize("hasAuthority('CONTACTO_LEER')")
    public ResponseEntity<List<ContactoResponse>> listarSaaneeActivos() {
        return ResponseEntity.ok(contactoService.listarSaaneeActivos());
    }
}
