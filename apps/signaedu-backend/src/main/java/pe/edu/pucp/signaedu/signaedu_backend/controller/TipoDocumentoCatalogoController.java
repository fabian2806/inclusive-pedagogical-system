package pe.edu.pucp.signaedu.signaedu_backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.TipoDocumentoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.service.TipoDocumentoService;

import java.util.List;

/**
 * Catalogo de solo lectura de tipos de documento, accesible a roles del
 * expediente (DOCENTE, PADRE, SAANEE) sin requerir permisos de admin.
 *
 * El CRUD administrativo sigue viviendo en {@link TipoDocumentoController}
 * bajo /admin/tipos-documento con permiso TIPO_DOCUMENTO_GESTIONAR.
 */
@RestController
@RequestMapping("/tipos-documento")
@RequiredArgsConstructor
public class TipoDocumentoCatalogoController {

    private final TipoDocumentoService tipoDocumentoService;

    @GetMapping
    @PreAuthorize("hasAuthority('DOCUMENTO_EXPEDIENTE_LEER')")
    public ResponseEntity<List<TipoDocumentoResponse>> listar() {
        return ResponseEntity.ok(tipoDocumentoService.listarTiposDocumento());
    }
}
