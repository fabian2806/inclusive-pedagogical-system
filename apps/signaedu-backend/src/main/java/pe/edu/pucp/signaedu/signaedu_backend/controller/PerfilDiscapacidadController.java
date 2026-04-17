package pe.edu.pucp.signaedu.signaedu_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.PerfilDiscapacidadRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.PerfilDiscapacidadResponse;
import pe.edu.pucp.signaedu.signaedu_backend.service.PerfilDiscapacidadService;

@RestController
@RequestMapping("/alumnos/{alumnoId}/perfil-discapacidad")
@RequiredArgsConstructor
public class PerfilDiscapacidadController {

    private final PerfilDiscapacidadService perfilDiscapacidadService;

    @GetMapping
    @PreAuthorize("hasAuthority('PERFIL_DISCAPACIDAD_LEER')")
    public ResponseEntity<PerfilDiscapacidadResponse> obtener(@PathVariable Long alumnoId) {
        return ResponseEntity.ok(perfilDiscapacidadService.obtenerPorAlumnoId(alumnoId));
    }

    @PutMapping
    @PreAuthorize("hasAuthority('PERFIL_DISCAPACIDAD_ESCRIBIR')")
    public ResponseEntity<PerfilDiscapacidadResponse> guardar(
            @PathVariable Long alumnoId,
            @Valid @RequestBody PerfilDiscapacidadRequest request) {
        return ResponseEntity.ok(perfilDiscapacidadService.guardar(alumnoId, request));
    }
}
