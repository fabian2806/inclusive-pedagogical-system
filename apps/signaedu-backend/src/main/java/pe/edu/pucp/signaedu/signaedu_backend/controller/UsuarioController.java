package pe.edu.pucp.signaedu.signaedu_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.UsuarioCreateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.UsuarioUpdateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.UsuarioResponse;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;
import pe.edu.pucp.signaedu.signaedu_backend.service.UsuarioService;

import java.util.List;

@RestController
@RequestMapping("/admin/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @PostMapping
    @PreAuthorize("hasAuthority('USUARIO_CREAR')")
    public ResponseEntity<UsuarioResponse> crearUsuario(@Valid @RequestBody UsuarioCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.crearUsuario(request));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('USUARIO_LEER')")
    public ResponseEntity<List<UsuarioResponse>> listarUsuarios(
            @RequestParam(required = false) TipoRol rol) {
        return ResponseEntity.ok(usuarioService.listarUsuarios(rol));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('USUARIO_LEER')")
    public ResponseEntity<UsuarioResponse> obtenerUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.obtenerUsuarioPorId(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('USUARIO_ACTUALIZAR')")
    public ResponseEntity<UsuarioResponse> actualizarUsuario(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioUpdateRequest request) {
        return ResponseEntity.ok(usuarioService.actualizarUsuario(id, request));
    }

    @PatchMapping("/{id}/desactivar")
    @PreAuthorize("hasAuthority('USUARIO_DESACTIVAR')")
    public ResponseEntity<Void> desactivarUsuario(@PathVariable Long id) {
        usuarioService.desactivarUsuario(id);
        return ResponseEntity.noContent().build();
    }
}
