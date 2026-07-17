package pe.edu.pucp.signaedu.signaedu_backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.ExpedientePeriodoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.service.ExpedienteConsultaService;

import java.util.List;

/**
 * Consulta de expedientes del alumno. Ruta paralela a /admin/configuracion:
 * aca solo se lee, la apertura y el cierre siguen siendo exclusivos del admin.
 */
@RestController
@RequestMapping("/alumnos/{alumnoId}/expedientes")
@RequiredArgsConstructor
public class ExpedienteController {

    private final ExpedienteConsultaService expedienteConsultaService;

    @GetMapping
    @PreAuthorize("hasAuthority('EXPEDIENTE_LEER')")
    public ResponseEntity<List<ExpedientePeriodoResponse>> listarPeriodos(
            @PathVariable Long alumnoId) {
        return ResponseEntity.ok(expedienteConsultaService.listarPeriodos(alumnoId));
    }
}
