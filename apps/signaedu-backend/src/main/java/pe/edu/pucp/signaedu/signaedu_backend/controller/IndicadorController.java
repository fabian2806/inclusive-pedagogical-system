package pe.edu.pucp.signaedu.signaedu_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.IndicadorCreateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.IndicadorUpdateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.IndicadorResponse;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.AreaCurricular;
import pe.edu.pucp.signaedu.signaedu_backend.service.IndicadorService;

import java.util.List;

@RestController
@RequestMapping("/indicadores")
@RequiredArgsConstructor
public class IndicadorController {

    private final IndicadorService indicadorService;

    @PostMapping
    @PreAuthorize("hasAuthority('INDICADOR_GESTIONAR')")
    public ResponseEntity<IndicadorResponse> crear(
            @Valid @RequestBody IndicadorCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(indicadorService.crear(request));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('INDICADOR_LEER')")
    public ResponseEntity<List<IndicadorResponse>> listar(
            @RequestParam(required = false) AreaCurricular areaCurricular,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Boolean activo) {
        return ResponseEntity.ok(indicadorService.listar(areaCurricular, q, activo));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('INDICADOR_LEER')")
    public ResponseEntity<IndicadorResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(indicadorService.obtenerPorId(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('INDICADOR_GESTIONAR')")
    public ResponseEntity<IndicadorResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody IndicadorUpdateRequest request) {
        return ResponseEntity.ok(indicadorService.actualizar(id, request));
    }

    @PatchMapping("/{id}/desactivar")
    @PreAuthorize("hasAuthority('INDICADOR_GESTIONAR')")
    public ResponseEntity<IndicadorResponse> desactivar(@PathVariable Long id) {
        return ResponseEntity.ok(indicadorService.desactivar(id));
    }

    @PatchMapping("/{id}/activar")
    @PreAuthorize("hasAuthority('INDICADOR_GESTIONAR')")
    public ResponseEntity<IndicadorResponse> activar(@PathVariable Long id) {
        return ResponseEntity.ok(indicadorService.activar(id));
    }
}
