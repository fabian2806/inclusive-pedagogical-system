package pe.edu.pucp.signaedu.signaedu_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.EntradaExpedienteRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.EntradaExpedienteResponse;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoEntrada;
import pe.edu.pucp.signaedu.signaedu_backend.service.BitacoraService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/alumnos/{alumnoId}/bitacora")
@RequiredArgsConstructor
public class BitacoraController {

    private final BitacoraService bitacoraService;

    @PostMapping
    @PreAuthorize("hasAuthority('BITACORA_ESCRIBIR')")
    public ResponseEntity<EntradaExpedienteResponse> crear(
            @PathVariable Long alumnoId,
            @Valid @RequestBody EntradaExpedienteRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(bitacoraService.crear(alumnoId, request));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('BITACORA_LEER')")
    public ResponseEntity<List<EntradaExpedienteResponse>> listar(
            @PathVariable Long alumnoId,
            @RequestParam(required = false) TipoEntrada tipo,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {
        return ResponseEntity.ok(bitacoraService.listar(alumnoId, tipo, desde, hasta));
    }
}
