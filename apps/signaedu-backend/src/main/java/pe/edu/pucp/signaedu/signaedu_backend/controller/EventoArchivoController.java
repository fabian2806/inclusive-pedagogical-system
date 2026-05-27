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
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.EventoArchivoCreateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.EventoArchivoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.service.ArchivoDescargaResource;
import pe.edu.pucp.signaedu.signaedu_backend.service.EventoArchivoService;

import java.util.List;

@RestController
@RequestMapping("/eventos/{eventoId}/archivos")
@RequiredArgsConstructor
public class EventoArchivoController {

    private final EventoArchivoService eventoArchivoService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('EVENTO_ACTUALIZAR')")
    public ResponseEntity<EventoArchivoResponse> adjuntar(
            @PathVariable Long eventoId,
            @RequestPart(value = "data", required = false) @Valid EventoArchivoCreateRequest request,
            @RequestPart("archivo") MultipartFile archivo) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(eventoArchivoService.adjuntar(eventoId, request, archivo));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('EVENTO_LEER')")
    public ResponseEntity<List<EventoArchivoResponse>> listar(@PathVariable Long eventoId) {
        return ResponseEntity.ok(eventoArchivoService.listar(eventoId));
    }

    @GetMapping("/{archivoId}/descargar")
    @PreAuthorize("hasAuthority('EVENTO_LEER')")
    public ResponseEntity<InputStreamResource> descargar(
            @PathVariable Long eventoId,
            @PathVariable Long archivoId) {
        ArchivoDescargaResource recurso = eventoArchivoService.descargar(eventoId, archivoId);

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
