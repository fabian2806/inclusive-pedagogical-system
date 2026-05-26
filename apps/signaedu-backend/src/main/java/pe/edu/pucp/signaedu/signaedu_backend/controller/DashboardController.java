package pe.edu.pucp.signaedu.signaedu_backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.AdminDashboardResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.DocenteDashboardResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.PadreDashboardResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.SaaneeDashboardResponse;
import pe.edu.pucp.signaedu.signaedu_backend.service.DashboardService;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/admin/resumen")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminDashboardResponse> resumenAdmin() {
        return ResponseEntity.ok(dashboardService.obtenerResumenAdmin());
    }

    @GetMapping("/docente/resumen")
    @PreAuthorize("hasRole('DOCENTE')")
    public ResponseEntity<DocenteDashboardResponse> resumenDocente() {
        return ResponseEntity.ok(dashboardService.obtenerResumenDocente());
    }

    @GetMapping("/padre/resumen")
    @PreAuthorize("hasRole('PADRE')")
    public ResponseEntity<PadreDashboardResponse> resumenPadre() {
        return ResponseEntity.ok(dashboardService.obtenerResumenPadre());
    }

    @GetMapping("/saanee/resumen")
    @PreAuthorize("hasRole('SAANEE')")
    public ResponseEntity<SaaneeDashboardResponse> resumenSaanee() {
        return ResponseEntity.ok(dashboardService.obtenerResumenSaanee());
    }
}
