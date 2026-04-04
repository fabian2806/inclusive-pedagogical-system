package pe.edu.pucp.signaedu.signaedu_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.TipoDocumentoCreateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.TipoDocumentoUpdateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.TipoDocumentoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.service.TipoDocumentoService;

import java.util.List;

@RestController
@RequestMapping("/admin/tipos-documento")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class TipoDocumentoController {

    private final TipoDocumentoService tipoDocumentoService;

    @PostMapping
    public ResponseEntity<TipoDocumentoResponse> crearTipoDocumento(
            @Valid @RequestBody TipoDocumentoCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tipoDocumentoService.crearTipoDocumento(request));
    }

    @GetMapping
    public ResponseEntity<List<TipoDocumentoResponse>> listarTiposDocumento() {
        return ResponseEntity.ok(tipoDocumentoService.listarTiposDocumento());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TipoDocumentoResponse> obtenerTipoDocumento(@PathVariable Long id) {
        return ResponseEntity.ok(tipoDocumentoService.obtenerTipoDocumentoPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TipoDocumentoResponse> actualizarTipoDocumento(
            @PathVariable Long id,
            @Valid @RequestBody TipoDocumentoUpdateRequest request) {
        return ResponseEntity.ok(tipoDocumentoService.actualizarTipoDocumento(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarTipoDocumento(@PathVariable Long id) {
        tipoDocumentoService.eliminarTipoDocumento(id);
        return ResponseEntity.noContent().build();
    }
}
