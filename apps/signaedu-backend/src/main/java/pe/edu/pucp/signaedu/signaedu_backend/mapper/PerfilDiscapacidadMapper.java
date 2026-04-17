package pe.edu.pucp.signaedu.signaedu_backend.mapper;

import org.springframework.stereotype.Component;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.ApoyoRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.BarreraRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.FortalezaRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.ApoyoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.BarreraResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.FortalezaResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.PerfilDiscapacidadResponse;
import pe.edu.pucp.signaedu.signaedu_backend.model.PerfilApoyo;
import pe.edu.pucp.signaedu.signaedu_backend.model.PerfilBarrera;
import pe.edu.pucp.signaedu.signaedu_backend.model.PerfilDiscapacidadAuditiva;
import pe.edu.pucp.signaedu.signaedu_backend.model.PerfilFortaleza;

@Component
public class PerfilDiscapacidadMapper {

    public PerfilDiscapacidadResponse toResponse(PerfilDiscapacidadAuditiva perfil) {
        return PerfilDiscapacidadResponse.builder()
                .id(perfil.getId())
                .alumnoId(perfil.getAlumno().getId())
                .modoComunicacionPreferido(perfil.getModoComunicacionPreferido())
                .observacionesGenerales(perfil.getObservacionesGenerales())
                .barreras(perfil.getBarreras().stream().map(this::toBarreraResponse).toList())
                .fortalezas(perfil.getFortalezas().stream().map(this::toFortalezaResponse).toList())
                .apoyos(perfil.getApoyos().stream().map(this::toApoyoResponse).toList())
                .build();
    }

    public PerfilBarrera toBarreraEntity(BarreraRequest request, PerfilDiscapacidadAuditiva perfil) {
        return PerfilBarrera.builder()
                .perfilDiscapacidadAuditiva(perfil)
                .tipo(request.getTipo())
                .descripcion(request.getDescripcion())
                .build();
    }

    public PerfilFortaleza toFortalezaEntity(FortalezaRequest request, PerfilDiscapacidadAuditiva perfil) {
        return PerfilFortaleza.builder()
                .perfilDiscapacidadAuditiva(perfil)
                .dimension(request.getDimension())
                .descripcion(request.getDescripcion())
                .build();
    }

    public PerfilApoyo toApoyoEntity(ApoyoRequest request, PerfilDiscapacidadAuditiva perfil) {
        return PerfilApoyo.builder()
                .perfilDiscapacidadAuditiva(perfil)
                .intensidad(request.getIntensidad())
                .funcion(request.getFuncion())
                .descripcion(request.getDescripcion())
                .fuente(request.getFuente())
                .build();
    }

    private BarreraResponse toBarreraResponse(PerfilBarrera barrera) {
        return BarreraResponse.builder()
                .id(barrera.getId())
                .tipo(barrera.getTipo().name())
                .descripcion(barrera.getDescripcion())
                .build();
    }

    private FortalezaResponse toFortalezaResponse(PerfilFortaleza fortaleza) {
        return FortalezaResponse.builder()
                .id(fortaleza.getId())
                .dimension(fortaleza.getDimension().name())
                .descripcion(fortaleza.getDescripcion())
                .build();
    }

    private ApoyoResponse toApoyoResponse(PerfilApoyo apoyo) {
        return ApoyoResponse.builder()
                .id(apoyo.getId())
                .intensidad(apoyo.getIntensidad().name())
                .funcion(apoyo.getFuncion().name())
                .descripcion(apoyo.getDescripcion())
                .fuente(apoyo.getFuente().name())
                .build();
    }
}
