package pe.edu.pucp.signaedu.signaedu_backend.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.AlumnoCreateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.AlumnoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.model.Alumno;

import java.util.List;

@Component
@RequiredArgsConstructor
public class AlumnoMapper {

    private final UsuarioMapper usuarioMapper;

    public AlumnoResponse toResponse(Alumno alumno) {
        List<pe.edu.pucp.signaedu.signaedu_backend.dto.response.UsuarioSimpleResponse> docentes =
                alumno.getDocentes().stream()
                        .map(usuarioMapper::toSimpleResponse)
                        .toList();

        List<pe.edu.pucp.signaedu.signaedu_backend.dto.response.UsuarioSimpleResponse> padres =
                alumno.getPadres().stream()
                        .map(usuarioMapper::toSimpleResponse)
                        .toList();

        return AlumnoResponse.builder()
                .id(alumno.getId())
                .nombre(alumno.getNombre())
                .apellido(alumno.getApellido())
                .idFotoPerfil(alumno.getIdFotoPerfil())
                .fechaNacimiento(alumno.getFechaNacimiento())
                .grado(alumno.getGrado())
                .seccion(alumno.getSeccion())
                .estado(alumno.getEstado().name())
                .docentes(docentes)
                .padres(padres)
                .build();
    }

    public Alumno toEntity(AlumnoCreateRequest request) {
        return Alumno.builder()
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .fechaNacimiento(request.getFechaNacimiento())
                .grado(request.getGrado())
                .seccion(request.getSeccion())
                .build();
    }
}
