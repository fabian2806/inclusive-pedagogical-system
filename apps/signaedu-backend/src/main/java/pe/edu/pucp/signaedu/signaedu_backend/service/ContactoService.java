package pe.edu.pucp.signaedu.signaedu_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.ContactoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.exception.ResourceNotFoundException;
import pe.edu.pucp.signaedu.signaedu_backend.mapper.ContactoMapper;
import pe.edu.pucp.signaedu.signaedu_backend.model.Alumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoUsuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;
import pe.edu.pucp.signaedu.signaedu_backend.repository.AlumnoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.UsuarioRepository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Endpoints CONTACTO_LEER (Fase 4): permite que docentes, padres y SAANEE
 * vean info de contacto de actores sin necesitar permisos admin sobre la
 * tabla de usuarios.
 */
@Service
@RequiredArgsConstructor
public class ContactoService {

    private final AlumnoRepository alumnoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ContactoMapper contactoMapper;

    @Transactional(readOnly = true)
    public List<ContactoResponse> obtenerContactosDelAlumno(Long alumnoId) {
        Usuario solicitante = obtenerUsuarioAutenticado();
        Alumno alumno = alumnoRepository.findById(alumnoId)
                .orElseThrow(() -> new ResourceNotFoundException("Alumno", "id", alumnoId));

        if (!tieneAccesoAlumno(solicitante, alumnoId)) {
            throw new AccessDeniedException("No tiene acceso al alumno con id " + alumnoId);
        }

        List<ContactoResponse> contactos = new ArrayList<>();
        alumno.getDocentes().stream()
                .sorted(comparadorPorNombre())
                .map(d -> contactoMapper.toResponse(d, TipoRol.DOCENTE))
                .forEach(contactos::add);
        alumno.getPadres().stream()
                .sorted(comparadorPorNombre())
                .map(p -> contactoMapper.toResponse(p, TipoRol.PADRE))
                .forEach(contactos::add);
        return contactos;
    }

    @Transactional(readOnly = true)
    public List<ContactoResponse> listarSaaneeActivos() {
        return usuarioRepository
                .findByRoles_NombreAndEstado(TipoRol.SAANEE, EstadoUsuario.ACTIVO).stream()
                .sorted(comparadorPorNombre())
                .map(u -> contactoMapper.toResponse(u, TipoRol.SAANEE))
                .toList();
    }

    // ============ helpers ============

    private Comparator<Usuario> comparadorPorNombre() {
        return Comparator
                .comparing(Usuario::getApellido, String.CASE_INSENSITIVE_ORDER)
                .thenComparing(Usuario::getNombre, String.CASE_INSENSITIVE_ORDER);
    }

    /**
     * Regla de visibilidad del contacto sobre un alumno (espejo del patron
     * de BitacoraService y AlumnoService):
     *   DOCENTE -> solo alumnos asignados
     *   PADRE   -> solo hijos vinculados
     *   SAANEE  -> todos los alumnos
     *   ADMIN   -> no aplica (no tiene CONTACTO_LEER en V5)
     */
    private boolean tieneAccesoAlumno(Usuario usuario, Long alumnoId) {
        return usuario.getRoles().stream()
                .map(rol -> rol.getNombre())
                .anyMatch(rol -> switch (rol) {
                    case DOCENTE -> alumnoRepository.existsByIdAndDocentesId(alumnoId, usuario.getId());
                    case PADRE -> alumnoRepository.existsByIdAndPadresId(alumnoId, usuario.getId());
                    case SAANEE -> true;
                    case ADMIN -> false;
                });
    }

    private Usuario obtenerUsuarioAutenticado() {
        String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "correo", correo));
    }
}
