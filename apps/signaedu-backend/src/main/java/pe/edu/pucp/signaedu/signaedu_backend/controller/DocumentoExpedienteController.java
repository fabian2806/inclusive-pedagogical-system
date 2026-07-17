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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.DocumentoExpedienteCreateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.DocumentoExpedienteResponse;
import pe.edu.pucp.signaedu.signaedu_backend.service.ArchivoDescargaResource;
import pe.edu.pucp.signaedu.signaedu_backend.service.DocumentoExpedienteService;

import java.util.List;

@RestController
@RequestMapping("/alumnos/{alumnoId}/documentos")
@RequiredArgsConstructor
public class DocumentoExpedienteController {

    private final DocumentoExpedienteService documentoService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('DOCUMENTO_EXPEDIENTE_ESCRIBIR')")
    public ResponseEntity<DocumentoExpedienteResponse> subir(
            @PathVariable Long alumnoId,
            @RequestPart("data") @Valid DocumentoExpedienteCreateRequest request,
            @RequestPart("archivo") MultipartFile archivo) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(documentoService.subir(alumnoId, request, archivo));
    }

    /**
     * @param periodo periodo lectivo a consultar. Omitirlo devuelve el expediente
     *                vigente; indicarlo permite consultar periodos anteriores en
     *                solo lectura.
     */
    @GetMapping
    @PreAuthorize("hasAuthority('DOCUMENTO_EXPEDIENTE_LEER')")
    public ResponseEntity<List<DocumentoExpedienteResponse>> listar(
            @PathVariable Long alumnoId,
            @RequestParam(required = false) String periodo) {
        return ResponseEntity.ok(documentoService.listar(alumnoId, periodo));
    }

    @GetMapping("/{documentoId}/descargar")
    @PreAuthorize("hasAuthority('DOCUMENTO_EXPEDIENTE_LEER')")
    public ResponseEntity<InputStreamResource> descargar(
            @PathVariable Long alumnoId,
            @PathVariable Long documentoId) {
        ArchivoDescargaResource recurso = documentoService.descargar(alumnoId, documentoId);

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
