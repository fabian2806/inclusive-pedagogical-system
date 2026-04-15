package pe.edu.pucp.signaedu.signaedu_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.PeriodoLectivoRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.AperturaPeriodoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.CierrePeriodoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.ConfiguracionPeriodoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.service.ConfiguracionService;

@RestController
@RequestMapping("/admin/configuracion")
@RequiredArgsConstructor
public class ConfiguracionController {

    private final ConfiguracionService configuracionService;

    @GetMapping("/periodo-vigente")
    @PreAuthorize("hasAuthority('EXPEDIENTE_CREAR')")
    public ResponseEntity<ConfiguracionPeriodoResponse> obtenerPeriodoVigente() {
        return ResponseEntity.ok(configuracionService.obtenerPeriodoVigente());
    }

    @PutMapping("/periodo-vigente")
    @PreAuthorize("hasAuthority('EXPEDIENTE_CREAR')")
    public ResponseEntity<ConfiguracionPeriodoResponse> actualizarPeriodoVigente(
            @Valid @RequestBody PeriodoLectivoRequest request) {
        return ResponseEntity.ok(configuracionService.actualizarPeriodoVigente(request.getPeriodoLectivo()));
    }

    @PostMapping("/aperturar-periodo")
    @PreAuthorize("hasAuthority('EXPEDIENTE_CREAR')")
    public ResponseEntity<AperturaPeriodoResponse> aperturarPeriodo() {
        return ResponseEntity.ok(configuracionService.aperturarPeriodo());
    }

    @PostMapping("/cerrar-periodo")
    @PreAuthorize("hasAuthority('EXPEDIENTE_ACTUALIZAR')")
    public ResponseEntity<CierrePeriodoResponse> cerrarPeriodo() {
        return ResponseEntity.ok(configuracionService.cerrarPeriodo());
    }
}
