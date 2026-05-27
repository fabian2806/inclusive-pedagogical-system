package pe.edu.pucp.signaedu.signaedu_backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.NotificacionResponse;
import pe.edu.pucp.signaedu.signaedu_backend.service.NotificacionService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionService notificacionService;

    @GetMapping("/mias")
    @PreAuthorize("hasAuthority('NOTIFICACION_LEER')")
    public ResponseEntity<List<NotificacionResponse>> listarMias() {
        return ResponseEntity.ok(notificacionService.listarMias());
    }

    @PatchMapping("/{id}/marcar-leida")
    @PreAuthorize("hasAuthority('NOTIFICACION_LEER')")
    public ResponseEntity<NotificacionResponse> marcarLeida(@PathVariable Long id) {
        return ResponseEntity.ok(notificacionService.marcarLeida(id));
    }

    @PatchMapping("/marcar-todas-leidas")
    @PreAuthorize("hasAuthority('NOTIFICACION_LEER')")
    public ResponseEntity<Map<String, Integer>> marcarTodasLeidas() {
        int cuantas = notificacionService.marcarTodasLeidas();
        return ResponseEntity.ok(Map.of("marcadas", cuantas));
    }
}
