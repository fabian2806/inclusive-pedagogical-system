package pe.edu.pucp.signaedu.signaedu_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.AlumnoCreateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.AlumnoUpdateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.AlumnoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.service.AlumnoService;

@RestController
@RequestMapping("/admin/alumnos")
@RequiredArgsConstructor
public class AlumnoController {

    private final AlumnoService alumnoService;

    @PostMapping
    @PreAuthorize("hasAuthority('ALUMNO_CREAR')")
    public ResponseEntity<AlumnoResponse> crearAlumno(@Valid @RequestBody AlumnoCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(alumnoService.crearAlumno(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ALUMNO_ACTUALIZAR')")
    public ResponseEntity<AlumnoResponse> actualizarAlumno(
            @PathVariable Long id,
            @Valid @RequestBody AlumnoUpdateRequest request) {
        return ResponseEntity.ok(alumnoService.actualizarAlumno(id, request));
    }

    @PatchMapping("/{id}/desactivar")
    @PreAuthorize("hasAuthority('ALUMNO_DESACTIVAR')")
    public ResponseEntity<Void> desactivarAlumno(@PathVariable Long id) {
        alumnoService.desactivarAlumno(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/docentes/{docenteId}")
    @PreAuthorize("hasAuthority('ALUMNO_ACTUALIZAR')")
    public ResponseEntity<AlumnoResponse> asignarDocente(
            @PathVariable Long id,
            @PathVariable Long docenteId) {
        return ResponseEntity.ok(alumnoService.asignarDocente(id, docenteId));
    }

    @DeleteMapping("/{id}/docentes/{docenteId}")
    @PreAuthorize("hasAuthority('ALUMNO_ACTUALIZAR')")
    public ResponseEntity<AlumnoResponse> removerDocente(
            @PathVariable Long id,
            @PathVariable Long docenteId) {
        return ResponseEntity.ok(alumnoService.removerDocente(id, docenteId));
    }

    @PostMapping("/{id}/padres/{padreId}")
    @PreAuthorize("hasAuthority('ALUMNO_ACTUALIZAR')")
    public ResponseEntity<AlumnoResponse> asignarPadre(
            @PathVariable Long id,
            @PathVariable Long padreId) {
        return ResponseEntity.ok(alumnoService.asignarPadre(id, padreId));
    }

    @DeleteMapping("/{id}/padres/{padreId}")
    @PreAuthorize("hasAuthority('ALUMNO_ACTUALIZAR')")
    public ResponseEntity<AlumnoResponse> removerPadre(
            @PathVariable Long id,
            @PathVariable Long padreId) {
        return ResponseEntity.ok(alumnoService.removerPadre(id, padreId));
    }
}
