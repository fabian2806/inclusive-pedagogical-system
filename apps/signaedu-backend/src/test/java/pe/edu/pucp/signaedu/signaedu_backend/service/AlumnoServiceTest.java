package pe.edu.pucp.signaedu.signaedu_backend.service;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.AlumnoCreateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.AlumnoUpdateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.AlumnoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.exception.IllegalOperationException;
import pe.edu.pucp.signaedu.signaedu_backend.exception.ResourceNotFoundException;
import pe.edu.pucp.signaedu.signaedu_backend.mapper.AlumnoMapper;
import pe.edu.pucp.signaedu.signaedu_backend.model.Alumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.Rol;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoAlumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;
import pe.edu.pucp.signaedu.signaedu_backend.model.Expediente;
import pe.edu.pucp.signaedu.signaedu_backend.repository.AlumnoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.ExpedienteRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.UsuarioRepository;

import java.time.LocalDate;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlumnoServiceTest {

    @Mock
    private AlumnoRepository alumnoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private ExpedienteRepository expedienteRepository;

    @Mock
    private ConfiguracionService configuracionService;

    @Mock
    private AlumnoMapper alumnoMapper;

    @InjectMocks
    private AlumnoService alumnoService;

    private Alumno alumno() {
        return Alumno.builder()
                .id(1L)
                .nombre("Carlos")
                .apellido("López")
                .fechaNacimiento(LocalDate.of(2015, 3, 10))
                .grado("3ro")
                .seccion("A")
                .estado(EstadoAlumno.ACTIVO)
                .docentes(new HashSet<>())
                .padres(new HashSet<>())
                .build();
    }

    private AlumnoResponse alumnoResponse() {
        return AlumnoResponse.builder()
                .id(1L)
                .nombre("Carlos")
                .apellido("López")
                .fechaNacimiento(LocalDate.of(2015, 3, 10))
                .grado("3ro")
                .seccion("A")
                .estado("ACTIVO")
                .docentes(Collections.emptyList())
                .padres(Collections.emptyList())
                .build();
    }

    private Usuario usuarioConRol(TipoRol tipoRol) {
        Rol rol = Rol.builder().id(1L).nombre(tipoRol).build();
        return Usuario.builder()
                .id(10L)
                .nombre("María")
                .apellido("Torres")
                .correo("maria@signaedu.pe")
                .passwordHash("hashed")
                .roles(new HashSet<>(Set.of(rol)))
                .build();
    }

    private void autenticarComo(Usuario usuario) {
        Authentication auth = new UsernamePasswordAuthenticationToken(usuario.getCorreo(), null);
        SecurityContextHolder.getContext().setAuthentication(auth);
        when(usuarioRepository.findByCorreo(usuario.getCorreo())).thenReturn(Optional.of(usuario));
    }

    @AfterEach
    void limpiarSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void debeCrearAlumnoCorrectamente() {
        AlumnoCreateRequest request = new AlumnoCreateRequest();
        request.setNombre("Carlos");
        request.setApellido("López");
        request.setFechaNacimiento(LocalDate.of(2015, 3, 10));
        request.setGrado("3ro");
        request.setSeccion("A");

        Alumno alumno = alumno();

        when(alumnoMapper.toEntity(request)).thenReturn(alumno);
        when(alumnoRepository.save(any(Alumno.class))).thenReturn(alumno);
        when(alumnoMapper.toResponse(alumno)).thenReturn(alumnoResponse());
        when(configuracionService.obtenerValorPeriodo()).thenReturn("2026");
        when(expedienteRepository.save(any(Expediente.class))).thenReturn(Expediente.builder().id(1L).build());

        AlumnoResponse response = alumnoService.crearAlumno(request);

        assertThat(response.getNombre()).isEqualTo("Carlos");
        verify(alumnoRepository).save(any(Alumno.class));
    }

    @Test
    void debeCrearExpedienteAutomaticamenteAlCrearAlumno() {
        AlumnoCreateRequest request = new AlumnoCreateRequest();
        request.setNombre("Carlos");
        request.setApellido("López");
        request.setFechaNacimiento(LocalDate.of(2015, 3, 10));
        request.setGrado("3ro");
        request.setSeccion("A");

        Alumno alumno = alumno();

        when(alumnoMapper.toEntity(request)).thenReturn(alumno);
        when(alumnoRepository.save(any(Alumno.class))).thenReturn(alumno);
        when(alumnoMapper.toResponse(alumno)).thenReturn(alumnoResponse());
        when(configuracionService.obtenerValorPeriodo()).thenReturn("2026");
        when(expedienteRepository.save(any(Expediente.class))).thenReturn(Expediente.builder().id(1L).build());

        alumnoService.crearAlumno(request);

        verify(configuracionService).obtenerValorPeriodo();
        verify(expedienteRepository).save(argThat(exp ->
                exp.getAlumno().equals(alumno) &&
                exp.getPeriodoLectivo().equals("2026") &&
                exp.getFechaApertura().equals(LocalDate.now())
        ));
    }

    @Test
    void debeObtenerAlumnoPorIdComoAdmin() {
        autenticarComo(usuarioConRol(TipoRol.ADMIN));
        when(alumnoRepository.findById(1L)).thenReturn(Optional.of(alumno()));
        when(alumnoMapper.toResponse(any(Alumno.class))).thenReturn(alumnoResponse());

        AlumnoResponse response = alumnoService.obtenerAlumnoPorId(1L);

        assertThat(response.getId()).isEqualTo(1L);
    }

    @Test
    void debeLanzarResourceNotFoundAlObtenerIdInexistente() {
        when(alumnoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> alumnoService.obtenerAlumnoPorId(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void debeLanzarAccessDeniedAlObtenerAlumnoNoAccesibleParaDocente() {
        Usuario docente = usuarioConRol(TipoRol.DOCENTE);
        autenticarComo(docente);
        when(alumnoRepository.findById(1L)).thenReturn(Optional.of(alumno()));
        when(alumnoRepository.existsByIdAndDocentesId(1L, docente.getId())).thenReturn(false);

        assertThatThrownBy(() -> alumnoService.obtenerAlumnoPorId(1L))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void listarAlumnos_comoAdmin_devuelveTodos() {
        autenticarComo(usuarioConRol(TipoRol.ADMIN));
        when(alumnoRepository.findAll()).thenReturn(List.of(alumno()));
        when(alumnoMapper.toResponse(any(Alumno.class))).thenReturn(alumnoResponse());

        List<AlumnoResponse> resultado = alumnoService.listarAlumnos();

        assertThat(resultado).hasSize(1);
        verify(alumnoRepository).findAll();
        verify(alumnoRepository, never()).findByDocentes_Id(any());
        verify(alumnoRepository, never()).findByPadres_Id(any());
    }

    @Test
    void listarAlumnos_comoSaanee_devuelveTodosLosAlumnos() {
        autenticarComo(usuarioConRol(TipoRol.SAANEE));
        when(alumnoRepository.findAll()).thenReturn(List.of(alumno(), alumno()));
        when(alumnoMapper.toResponse(any(Alumno.class))).thenReturn(alumnoResponse());

        List<AlumnoResponse> resultado = alumnoService.listarAlumnos();

        assertThat(resultado).hasSize(2);
        verify(alumnoRepository).findAll();
        verify(alumnoRepository, never()).findByDocentes_Id(any());
        verify(alumnoRepository, never()).findByPadres_Id(any());
    }

    @Test
    void listarAlumnos_comoDocente_devuelveSoloAsignados() {
        Usuario docente = usuarioConRol(TipoRol.DOCENTE);
        autenticarComo(docente);
        when(alumnoRepository.findByDocentes_Id(docente.getId())).thenReturn(List.of(alumno()));
        when(alumnoMapper.toResponse(any(Alumno.class))).thenReturn(alumnoResponse());

        List<AlumnoResponse> resultado = alumnoService.listarAlumnos();

        assertThat(resultado).hasSize(1);
        verify(alumnoRepository).findByDocentes_Id(docente.getId());
        verify(alumnoRepository, never()).findAll();
        verify(alumnoRepository, never()).findByPadres_Id(any());
    }

    @Test
    void listarAlumnos_comoPadre_devuelveSoloHijos() {
        Usuario padre = usuarioConRol(TipoRol.PADRE);
        autenticarComo(padre);
        when(alumnoRepository.findByPadres_Id(padre.getId())).thenReturn(List.of(alumno()));
        when(alumnoMapper.toResponse(any(Alumno.class))).thenReturn(alumnoResponse());

        List<AlumnoResponse> resultado = alumnoService.listarAlumnos();

        assertThat(resultado).hasSize(1);
        verify(alumnoRepository).findByPadres_Id(padre.getId());
        verify(alumnoRepository, never()).findAll();
        verify(alumnoRepository, never()).findByDocentes_Id(any());
    }

    @Test
    void debeActualizarAlumnoCorrectamente() {
        AlumnoUpdateRequest request = new AlumnoUpdateRequest();
        request.setNombre("Carlos Eduardo");
        request.setApellido("López");
        request.setFechaNacimiento(LocalDate.of(2015, 3, 10));
        request.setGrado("4to");
        request.setSeccion("B");

        Alumno alumno = alumno();

        when(alumnoRepository.findById(1L)).thenReturn(Optional.of(alumno));
        when(alumnoRepository.save(any(Alumno.class))).thenReturn(alumno);
        when(alumnoMapper.toResponse(any(Alumno.class))).thenReturn(alumnoResponse());

        AlumnoResponse response = alumnoService.actualizarAlumno(1L, request);

        assertThat(response).isNotNull();
        verify(alumnoRepository).save(alumno);
    }

    @Test
    void debeDesactivarAlumno() {
        Alumno alumno = alumno();

        when(alumnoRepository.findById(1L)).thenReturn(Optional.of(alumno));
        when(alumnoRepository.save(any(Alumno.class))).thenReturn(alumno);

        alumnoService.desactivarAlumno(1L);

        assertThat(alumno.getEstado()).isEqualTo(EstadoAlumno.INACTIVO);
        verify(alumnoRepository).save(alumno);
    }

    @Test
    void debeAsignarDocenteConRolValido() {
        Alumno alumno = alumno();
        Usuario docente = usuarioConRol(TipoRol.DOCENTE);

        when(alumnoRepository.findById(1L)).thenReturn(Optional.of(alumno));
        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(docente));
        when(alumnoRepository.save(any(Alumno.class))).thenReturn(alumno);
        when(alumnoMapper.toResponse(any(Alumno.class))).thenReturn(alumnoResponse());

        alumnoService.asignarDocente(1L, 10L);

        assertThat(alumno.getDocentes()).contains(docente);
    }

    @Test
    void debeLanzarIllegalOperationAlAsignarUsuarioSinRolDocente() {
        Alumno alumno = alumno();
        Usuario padre = usuarioConRol(TipoRol.PADRE);

        when(alumnoRepository.findById(1L)).thenReturn(Optional.of(alumno));
        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(padre));

        assertThatThrownBy(() -> alumnoService.asignarDocente(1L, 10L))
                .isInstanceOf(IllegalOperationException.class);
    }

    @Test
    void debeRemoverDocente() {
        Usuario docente = usuarioConRol(TipoRol.DOCENTE);
        Alumno alumno = alumno();
        alumno.getDocentes().add(docente);

        when(alumnoRepository.findById(1L)).thenReturn(Optional.of(alumno));
        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(docente));
        when(alumnoRepository.save(any(Alumno.class))).thenReturn(alumno);
        when(alumnoMapper.toResponse(any(Alumno.class))).thenReturn(alumnoResponse());

        alumnoService.removerDocente(1L, 10L);

        assertThat(alumno.getDocentes()).doesNotContain(docente);
    }

    @Test
    void debeAsignarPadreConRolValido() {
        Alumno alumno = alumno();
        Usuario padre = usuarioConRol(TipoRol.PADRE);

        when(alumnoRepository.findById(1L)).thenReturn(Optional.of(alumno));
        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(padre));
        when(alumnoRepository.save(any(Alumno.class))).thenReturn(alumno);
        when(alumnoMapper.toResponse(any(Alumno.class))).thenReturn(alumnoResponse());

        alumnoService.asignarPadre(1L, 10L);

        assertThat(alumno.getPadres()).contains(padre);
    }

    @Test
    void debeLanzarIllegalOperationAlAsignarUsuarioSinRolPadre() {
        Alumno alumno = alumno();
        Usuario docente = usuarioConRol(TipoRol.DOCENTE);

        when(alumnoRepository.findById(1L)).thenReturn(Optional.of(alumno));
        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(docente));

        assertThatThrownBy(() -> alumnoService.asignarPadre(1L, 10L))
                .isInstanceOf(IllegalOperationException.class);
    }
}
