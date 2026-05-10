package pe.edu.pucp.signaedu.signaedu_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.EntradaArchivoCreateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.EntradaArchivoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.service.ArchivoDescargaResource;
import pe.edu.pucp.signaedu.signaedu_backend.service.EntradaArchivoService;

import java.util.List;

@RestController
@RequestMapping("/alumnos/{alumnoId}/bitacora")
@RequiredArgsConstructor
public class EntradaArchivoController {

    private final EntradaArchivoService entradaArchivoService;

    @PostMapping(value = "/{entradaId}/archivos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('BITACORA_ESCRIBIR')")
    public ResponseEntity<EntradaArchivoResponse> adjuntar(
            @PathVariable Long alumnoId,
            @PathVariable Long entradaId,
            @RequestPart(value = "data", required = false) @Valid EntradaArchivoCreateRequest request,
            @RequestPart("archivo") MultipartFile archivo) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(entradaArchivoService.adjuntar(alumnoId, entradaId, request, archivo));
    }

    @GetMapping("/{entradaId}/archivos")
    @PreAuthorize("hasAuthority('BITACORA_LEER')")
    public ResponseEntity<List<EntradaArchivoResponse>> listar(
            @PathVariable Long alumnoId,
            @PathVariable Long entradaId) {
        return ResponseEntity.ok(entradaArchivoService.listar(alumnoId, entradaId));
    }

    @GetMapping("/archivos/{archivoId}/descargar")
    @PreAuthorize("hasAuthority('BITACORA_LEER')")
    public ResponseEntity<InputStreamResource> descargar(
            @PathVariable Long alumnoId,
            @PathVariable Long archivoId) {
        ArchivoDescargaResource recurso = entradaArchivoService.descargar(alumnoId, archivoId);

        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(recurso.nombreOriginal())
                .build();

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(recurso.mimeType()))
                .contentLength(recurso.tamano())
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(new InputStreamResource(recurso.contenido()));
    }
}
