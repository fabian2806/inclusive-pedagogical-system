package pe.edu.pucp.signaedu.signaedu_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.EntradaExpedienteRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.EntradaExpedienteResponse;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoEntrada;
import pe.edu.pucp.signaedu.signaedu_backend.service.BitacoraService;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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

    /**
     * @param periodo periodo lectivo a consultar. Omitirlo devuelve el expediente
     *                vigente; indicarlo permite consultar periodos anteriores en
     *                solo lectura.
     */
    @GetMapping
    @PreAuthorize("hasAuthority('BITACORA_LEER')")
    public ResponseEntity<List<EntradaExpedienteResponse>> listar(
            @PathVariable Long alumnoId,
            @RequestParam(required = false) TipoEntrada tipo,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta,
            @RequestParam(required = false) String periodo) {
        return ResponseEntity.ok(bitacoraService.listar(alumnoId, tipo, desde, hasta, periodo));
    }

    @GetMapping("/export")
    @PreAuthorize("hasAuthority('EXPEDIENTE_EXPORTAR')")
    public ResponseEntity<byte[]> exportar(
            @PathVariable Long alumnoId,
            @RequestParam(required = false) TipoEntrada tipo,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {
        String csv = bitacoraService.exportarCsv(alumnoId, tipo, desde, hasta);
        byte[] cuerpo = csv.getBytes(StandardCharsets.UTF_8);

        String fechaActual = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        String filename = "bitacora_alumno_" + alumnoId + "_" + fechaActual + ".csv";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename(filename, StandardCharsets.UTF_8)
                .build());
        headers.setContentLength(cuerpo.length);

        return new ResponseEntity<>(cuerpo, headers, HttpStatus.OK);
    }
}
