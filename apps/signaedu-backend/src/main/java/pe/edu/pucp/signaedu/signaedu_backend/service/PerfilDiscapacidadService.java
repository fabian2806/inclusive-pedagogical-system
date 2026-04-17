package pe.edu.pucp.signaedu.signaedu_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.PerfilDiscapacidadRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.PerfilDiscapacidadResponse;
import pe.edu.pucp.signaedu.signaedu_backend.exception.ResourceNotFoundException;
import pe.edu.pucp.signaedu.signaedu_backend.mapper.PerfilDiscapacidadMapper;
import pe.edu.pucp.signaedu.signaedu_backend.model.Alumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.PerfilDiscapacidadAuditiva;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;
import pe.edu.pucp.signaedu.signaedu_backend.repository.AlumnoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.PerfilDiscapacidadAuditivaRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.UsuarioRepository;

@Service
@RequiredArgsConstructor
public class PerfilDiscapacidadService {

    private final PerfilDiscapacidadAuditivaRepository perfilRepository;
    private final AlumnoRepository alumnoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PerfilDiscapacidadMapper perfilMapper;

    @Transactional(readOnly = true)
    public PerfilDiscapacidadResponse obtenerPorAlumnoId(Long alumnoId) {
        validarAccesoAlumno(alumnoId);

        PerfilDiscapacidadAuditiva perfil = perfilRepository.findByAlumnoId(alumnoId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "PerfilDiscapacidadAuditiva", "alumnoId", alumnoId));

        return perfilMapper.toResponse(perfil);
    }

    @Transactional
    public PerfilDiscapacidadResponse guardar(Long alumnoId, PerfilDiscapacidadRequest request) {
        validarAccesoAlumno(alumnoId);

        Alumno alumno = alumnoRepository.findById(alumnoId)
                .orElseThrow(() -> new ResourceNotFoundException("Alumno", "id", alumnoId));

        PerfilDiscapacidadAuditiva perfil = perfilRepository.findByAlumnoId(alumnoId)
                .orElseGet(() -> PerfilDiscapacidadAuditiva.builder()
                        .alumno(alumno)
                        .build());

        perfil.setModoComunicacionPreferido(request.getModoComunicacionPreferido());
        perfil.setObservacionesGenerales(request.getObservacionesGenerales());

        // Reemplazar colecciones hijas (orphanRemoval se encarga de eliminar las anteriores)
        perfil.getBarreras().clear();
        if (request.getBarreras() != null) {
            request.getBarreras().forEach(b ->
                    perfil.getBarreras().add(perfilMapper.toBarreraEntity(b, perfil)));
        }

        perfil.getFortalezas().clear();
        if (request.getFortalezas() != null) {
            request.getFortalezas().forEach(f ->
                    perfil.getFortalezas().add(perfilMapper.toFortalezaEntity(f, perfil)));
        }

        perfil.getApoyos().clear();
        if (request.getApoyos() != null) {
            request.getApoyos().forEach(a ->
                    perfil.getApoyos().add(perfilMapper.toApoyoEntity(a, perfil)));
        }

        return perfilMapper.toResponse(perfilRepository.save(perfil));
    }

    private void validarAccesoAlumno(Long alumnoId) {
        if (!alumnoRepository.existsById(alumnoId)) {
            throw new ResourceNotFoundException("Alumno", "id", alumnoId);
        }

        String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "correo", correo));

        boolean tieneAcceso = usuario.getRoles().stream()
                .anyMatch(rol -> verificarAccesoPorRol(rol.getNombre(), alumnoId, usuario.getId()));

        if (!tieneAcceso) {
            throw new AccessDeniedException("No tiene acceso al alumno con id " + alumnoId);
        }
    }

    private boolean verificarAccesoPorRol(TipoRol rol, Long alumnoId, Long usuarioId) {
        return switch (rol) {
            case DOCENTE -> alumnoRepository.existsByIdAndDocentesId(alumnoId, usuarioId);
            case PADRE -> alumnoRepository.existsByIdAndPadresId(alumnoId, usuarioId);
            case SAANEE -> true;
            case ADMIN -> false;
        };
    }
}
