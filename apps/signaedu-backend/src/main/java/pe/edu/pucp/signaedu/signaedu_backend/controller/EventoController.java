package pe.edu.pucp.signaedu.signaedu_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.CancelarEventoRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.EventoCreateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.EventoUpdateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.InvitarUsuarioRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.ResponderAsistenciaRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.EventoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoEvento;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoEvento;
import pe.edu.pucp.signaedu.signaedu_backend.service.EventoService;
import pe.edu.pucp.signaedu.signaedu_backend.service.EventoUsuarioService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/eventos")
@RequiredArgsConstructor
public class EventoController {

    private final EventoService eventoService;
    private final EventoUsuarioService eventoUsuarioService;

    @PostMapping
    @PreAuthorize("hasAuthority('EVENTO_CREAR')")
    public ResponseEntity<EventoResponse> crear(@Valid @RequestBody EventoCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(eventoService.crear(request));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('EVENTO_LEER')")
    public ResponseEntity<List<EventoResponse>> listar(
            @RequestParam(required = false) Long alumnoId,
            @RequestParam(required = false) TipoEvento tipoEvento,
            @RequestParam(required = false) EstadoEvento estado,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {
        return ResponseEntity.ok(eventoService.listar(alumnoId, tipoEvento, estado, desde, hasta));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('EVENTO_LEER')")
    public ResponseEntity<EventoResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(eventoService.obtener(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('EVENTO_ACTUALIZAR')")
    public ResponseEntity<EventoResponse> editar(@PathVariable Long id,
                                                 @Valid @RequestBody EventoUpdateRequest request) {
        return ResponseEntity.ok(eventoService.editar(id, request));
    }

    @PatchMapping("/{id}/cancelar")
    @PreAuthorize("hasAuthority('EVENTO_CANCELAR')")
    public ResponseEntity<EventoResponse> cancelar(@PathVariable Long id,
                                                   @Valid @RequestBody(required = false) CancelarEventoRequest request) {
        return ResponseEntity.ok(eventoService.cancelar(id, request));
    }

    @PatchMapping("/{id}/respuesta")
    @PreAuthorize("hasAuthority('EVENTO_RESPONDER')")
    public ResponseEntity<EventoResponse> responder(@PathVariable Long id,
                                                    @Valid @RequestBody ResponderAsistenciaRequest request) {
        return ResponseEntity.ok(eventoUsuarioService.responder(id, request));
    }

    @PostMapping("/{id}/invitados")
    @PreAuthorize("hasAuthority('EVENTO_ACTUALIZAR')")
    public ResponseEntity<EventoResponse> agregarInvitado(@PathVariable Long id,
                                                          @Valid @RequestBody InvitarUsuarioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(eventoService.agregarInvitado(id, request));
    }

    @DeleteMapping("/{id}/invitados/{usuarioId}")
    @PreAuthorize("hasAuthority('EVENTO_ACTUALIZAR')")
    public ResponseEntity<EventoResponse> removerInvitado(@PathVariable Long id,
                                                          @PathVariable Long usuarioId) {
        return ResponseEntity.ok(eventoService.removerInvitado(id, usuarioId));
    }
}
