package pe.edu.pucp.signaedu.signaedu_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import pe.edu.pucp.signaedu.signaedu_backend.exception.ResourceNotFoundException;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;
import pe.edu.pucp.signaedu.signaedu_backend.repository.AlumnoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.UsuarioRepository;

/**
 * Valida que el usuario autenticado tenga acceso al alumno indicado.
 *
 * <p>Esta regla vive duplicada en varios servicios ({@code BitacoraService},
 * {@code DocumentoExpedienteService}, {@code EntradaArchivoService},
 * {@code PerfilDiscapacidadService}, {@code AlumnoService}, {@code ContactoService}).
 * Este componente es la version compartida: el codigo nuevo la usa desde aca.
 * Los servicios existentes conservan su copia — migrarlos es un refactor
 * aparte, fuera del alcance de este ajuste.
 *
 * <p>El alcance por rol es el mismo de siempre: el docente accede a sus alumnos
 * asignados, el padre a sus hijos vinculados, SAANEE a cualquier alumno (rol
 * global por diseño) y el admin a ninguno (no lee contenido del expediente).
 */
@Component
@RequiredArgsConstructor
public class AccesoAlumnoValidator {

    private final AlumnoRepository alumnoRepository;
    private final UsuarioRepository usuarioRepository;

    /**
     * @throws ResourceNotFoundException si el alumno no existe
     * @throws AccessDeniedException     si el usuario autenticado no tiene acceso
     */
    public Usuario validarAccesoYObtenerUsuario(Long alumnoId) {
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

        return usuario;
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
