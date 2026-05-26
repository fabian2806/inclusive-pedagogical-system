package pe.edu.pucp.signaedu.signaedu_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.AlumnoCreateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.AlumnoUpdateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.AlumnoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.exception.IllegalOperationException;
import pe.edu.pucp.signaedu.signaedu_backend.exception.ResourceNotFoundException;
import pe.edu.pucp.signaedu.signaedu_backend.mapper.AlumnoMapper;
import pe.edu.pucp.signaedu.signaedu_backend.model.Alumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.Expediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoAlumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;
import pe.edu.pucp.signaedu.signaedu_backend.repository.AlumnoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.ExpedienteRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.UsuarioRepository;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AlumnoService {

    private final AlumnoRepository alumnoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ExpedienteRepository expedienteRepository;
    private final ConfiguracionService configuracionService;
    private final AlumnoMapper alumnoMapper;

    @Transactional
    public AlumnoResponse crearAlumno(AlumnoCreateRequest request) {
        Alumno alumno = alumnoMapper.toEntity(request);
        alumno = alumnoRepository.save(alumno);

        // Crear expediente vacío para el periodo lectivo vigente
        String periodo = configuracionService.obtenerValorPeriodo();
        Expediente expediente = Expediente.builder()
                .alumno(alumno)
                .fechaApertura(LocalDate.now())
                .periodoLectivo(periodo)
                .build();
        expedienteRepository.save(expediente);

        return alumnoMapper.toResponse(alumno);
    }

    @Transactional(readOnly = true)
    public List<AlumnoResponse> listarAlumnos() {
        Usuario usuario = obtenerUsuarioAutenticado();
        List<Alumno> alumnos = listarSegunRol(usuario);
        return alumnos.stream()
                .map(alumnoMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AlumnoResponse obtenerAlumnoPorId(Long id) {
        Alumno alumno = alumnoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alumno", "id", id));

        Usuario usuario = obtenerUsuarioAutenticado();
        if (!tieneAccesoAlumno(usuario, id)) {
            throw new AccessDeniedException("No tiene acceso al alumno con id " + id);
        }

        return alumnoMapper.toResponse(alumno);
    }

    @Transactional
    public AlumnoResponse actualizarAlumno(Long id, AlumnoUpdateRequest request) {
        Alumno alumno = alumnoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alumno", "id", id));

        alumno.setNombre(request.getNombre());
        alumno.setApellido(request.getApellido());
        alumno.setFechaNacimiento(request.getFechaNacimiento());
        alumno.setGrado(request.getGrado());
        alumno.setSeccion(request.getSeccion());

        return alumnoMapper.toResponse(alumnoRepository.save(alumno));
    }

    @Transactional
    public void desactivarAlumno(Long id) {
        Alumno alumno = alumnoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alumno", "id", id));
        alumno.setEstado(EstadoAlumno.INACTIVO);
        alumnoRepository.save(alumno);
    }

    @Transactional
    public AlumnoResponse asignarDocente(Long alumnoId, Long docenteId) {
        Alumno alumno = alumnoRepository.findById(alumnoId)
                .orElseThrow(() -> new ResourceNotFoundException("Alumno", "id", alumnoId));

        Usuario docente = usuarioRepository.findById(docenteId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", docenteId));

        validarRol(docente, TipoRol.DOCENTE);

        alumno.getDocentes().add(docente);
        return alumnoMapper.toResponse(alumnoRepository.save(alumno));
    }

    @Transactional
    public AlumnoResponse removerDocente(Long alumnoId, Long docenteId) {
        Alumno alumno = alumnoRepository.findById(alumnoId)
                .orElseThrow(() -> new ResourceNotFoundException("Alumno", "id", alumnoId));

        Usuario docente = usuarioRepository.findById(docenteId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", docenteId));

        alumno.getDocentes().remove(docente);
        return alumnoMapper.toResponse(alumnoRepository.save(alumno));
    }

    @Transactional
    public AlumnoResponse asignarPadre(Long alumnoId, Long padreId) {
        Alumno alumno = alumnoRepository.findById(alumnoId)
                .orElseThrow(() -> new ResourceNotFoundException("Alumno", "id", alumnoId));

        Usuario padre = usuarioRepository.findById(padreId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", padreId));

        validarRol(padre, TipoRol.PADRE);

        alumno.getPadres().add(padre);
        return alumnoMapper.toResponse(alumnoRepository.save(alumno));
    }

    @Transactional
    public AlumnoResponse removerPadre(Long alumnoId, Long padreId) {
        Alumno alumno = alumnoRepository.findById(alumnoId)
                .orElseThrow(() -> new ResourceNotFoundException("Alumno", "id", alumnoId));

        Usuario padre = usuarioRepository.findById(padreId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", padreId));

        alumno.getPadres().remove(padre);
        return alumnoMapper.toResponse(alumnoRepository.save(alumno));
    }

    private void validarRol(Usuario usuario, TipoRol rolEsperado) {
        boolean tieneRol = usuario.getRoles().stream()
                .anyMatch(rol -> rol.getNombre() == rolEsperado);
        if (!tieneRol) {
            throw new IllegalOperationException(
                    String.format("El usuario con id %d no tiene rol %s", usuario.getId(), rolEsperado));
        }
    }

    private Usuario obtenerUsuarioAutenticado() {
        String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "correo", correo));
    }

    private List<Alumno> listarSegunRol(Usuario usuario) {
        // Visibilidad de alumnos por rol (decisión de sistema):
        //   ADMIN, SAANEE → todos los alumnos
        //   DOCENTE → solo los alumnos asignados (docente_alumno)
        //   PADRE → solo los hijos vinculados (padre_alumno)
        for (TipoRol rol : usuario.getRoles().stream().map(r -> r.getNombre()).toList()) {
            switch (rol) {
                case ADMIN, SAANEE -> {
                    return alumnoRepository.findAll();
                }
                case DOCENTE -> {
                    return alumnoRepository.findByDocentes_Id(usuario.getId());
                }
                case PADRE -> {
                    return alumnoRepository.findByPadres_Id(usuario.getId());
                }
            }
        }
        return List.of();
    }

    private boolean tieneAccesoAlumno(Usuario usuario, Long alumnoId) {
        return usuario.getRoles().stream()
                .map(r -> r.getNombre())
                .anyMatch(rol -> switch (rol) {
                    case ADMIN, SAANEE -> true;
                    case DOCENTE -> alumnoRepository.existsByIdAndDocentesId(alumnoId, usuario.getId());
                    case PADRE -> alumnoRepository.existsByIdAndPadresId(alumnoId, usuario.getId());
                });
    }
}
