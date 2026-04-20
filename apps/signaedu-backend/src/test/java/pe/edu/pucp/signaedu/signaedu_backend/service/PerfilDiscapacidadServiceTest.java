package pe.edu.pucp.signaedu.signaedu_backend.service;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.ApoyoRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.BarreraRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.FortalezaRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.PerfilDiscapacidadRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.PerfilDiscapacidadResponse;
import pe.edu.pucp.signaedu.signaedu_backend.exception.ResourceNotFoundException;
import pe.edu.pucp.signaedu.signaedu_backend.mapper.PerfilDiscapacidadMapper;
import pe.edu.pucp.signaedu.signaedu_backend.model.Alumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.PerfilApoyo;
import pe.edu.pucp.signaedu.signaedu_backend.model.PerfilBarrera;
import pe.edu.pucp.signaedu.signaedu_backend.model.PerfilDiscapacidadAuditiva;
import pe.edu.pucp.signaedu.signaedu_backend.model.PerfilFortaleza;
import pe.edu.pucp.signaedu.signaedu_backend.model.Rol;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoAlumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoBarrera;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoDimension;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoFuente;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoFuncion;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoIntensidad;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;
import pe.edu.pucp.signaedu.signaedu_backend.repository.AlumnoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.PerfilDiscapacidadAuditivaRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.UsuarioRepository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PerfilDiscapacidadServiceTest {

    private static final Long ALUMNO_ID = 1L;
    private static final Long USUARIO_ID = 10L;
    private static final String CORREO = "docente@signaedu.pe";

    @Mock
    private PerfilDiscapacidadAuditivaRepository perfilRepository;

    @Mock
    private AlumnoRepository alumnoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PerfilDiscapacidadMapper perfilMapper;

    @InjectMocks
    private PerfilDiscapacidadService perfilDiscapacidadService;

    @BeforeEach
    void setUpSecurityContext() {
        SecurityContextHolder.getContext().setAuthentication(
                new TestingAuthenticationToken(CORREO, "n/a"));
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    private Alumno alumno() {
        return Alumno.builder()
                .id(ALUMNO_ID)
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

    private Usuario usuarioConRol(TipoRol tipoRol) {
        Rol rol = Rol.builder().id(1L).nombre(tipoRol).build();
        return Usuario.builder()
                .id(USUARIO_ID)
                .nombre("María")
                .apellido("Torres")
                .correo(CORREO)
                .passwordHash("hashed")
                .roles(new HashSet<>(Set.of(rol)))
                .build();
    }

    private PerfilDiscapacidadRequest requestConColecciones() {
        PerfilDiscapacidadRequest req = new PerfilDiscapacidadRequest();
        req.setModoComunicacionPreferido("LSP");
        req.setObservacionesGenerales("Observaciones iniciales");
        req.setBarreras(new ArrayList<>(List.of(
                new BarreraRequest(TipoBarrera.PEDAGOGICA, "Falta de material adaptado"))));
        req.setFortalezas(new ArrayList<>(List.of(
                new FortalezaRequest(TipoDimension.MOTIVACIONES, "Alta motivación"))));
        req.setApoyos(new ArrayList<>(List.of(
                new ApoyoRequest(TipoIntensidad.LIMITADO, TipoFuncion.ACCESO_INFORMACION,
                        "Intérprete LSP", TipoFuente.PERSONAS))));
        return req;
    }

    /** Permite a los tests de acceso usar los mocks de SecurityContext sin exigir stubbing estricto. */
    private void stubUsuarioActualConRol(TipoRol rol) {
        lenient().when(usuarioRepository.findByCorreo(CORREO))
                .thenReturn(Optional.of(usuarioConRol(rol)));
    }

    // ---------- Upsert y reemplazo de colecciones (reglas de negocio críticas) ----------

    @Test
    void debeCrearPerfilCuandoNoExiste() {
        Alumno alumno = alumno();

        when(alumnoRepository.existsById(ALUMNO_ID)).thenReturn(true);
        stubUsuarioActualConRol(TipoRol.SAANEE);
        when(perfilRepository.findByAlumnoId(ALUMNO_ID)).thenReturn(Optional.empty());
        when(alumnoRepository.findById(ALUMNO_ID)).thenReturn(Optional.of(alumno));
        when(perfilRepository.save(any(PerfilDiscapacidadAuditiva.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(perfilMapper.toBarreraEntity(any(), any()))
                .thenReturn(PerfilBarrera.builder().tipo(TipoBarrera.PEDAGOGICA).descripcion("x").build());
        when(perfilMapper.toFortalezaEntity(any(), any()))
                .thenReturn(PerfilFortaleza.builder().dimension(TipoDimension.MOTIVACIONES).descripcion("x").build());
        when(perfilMapper.toApoyoEntity(any(), any()))
                .thenReturn(PerfilApoyo.builder().intensidad(TipoIntensidad.LIMITADO)
                        .funcion(TipoFuncion.ACCESO_INFORMACION).descripcion("x").fuente(TipoFuente.PERSONAS).build());
        when(perfilMapper.toResponse(any())).thenReturn(PerfilDiscapacidadResponse.builder().id(99L).alumnoId(ALUMNO_ID).build());

        PerfilDiscapacidadResponse response =
                perfilDiscapacidadService.guardar(ALUMNO_ID, requestConColecciones());

        assertThat(response.getAlumnoId()).isEqualTo(ALUMNO_ID);
        verify(perfilRepository).save(any(PerfilDiscapacidadAuditiva.class));
    }

    @Test
    void debeActualizarPerfilCuandoYaExiste() {
        PerfilDiscapacidadAuditiva perfilExistente = PerfilDiscapacidadAuditiva.builder()
                .id(50L)
                .alumno(alumno())
                .modoComunicacionPreferido("ORAL")
                .observacionesGenerales("viejo")
                .barreras(new ArrayList<>())
                .fortalezas(new ArrayList<>())
                .apoyos(new ArrayList<>())
                .build();

        when(alumnoRepository.existsById(ALUMNO_ID)).thenReturn(true);
        stubUsuarioActualConRol(TipoRol.SAANEE);
        when(alumnoRepository.findById(ALUMNO_ID)).thenReturn(Optional.of(alumno()));
        when(perfilRepository.findByAlumnoId(ALUMNO_ID)).thenReturn(Optional.of(perfilExistente));
        when(perfilRepository.save(any(PerfilDiscapacidadAuditiva.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(perfilMapper.toResponse(any())).thenReturn(
                PerfilDiscapacidadResponse.builder().id(50L).alumnoId(ALUMNO_ID).build());

        PerfilDiscapacidadRequest req = new PerfilDiscapacidadRequest();
        req.setModoComunicacionPreferido("LSP");
        req.setObservacionesGenerales("nuevo");

        perfilDiscapacidadService.guardar(ALUMNO_ID, req);

        assertThat(perfilExistente.getModoComunicacionPreferido()).isEqualTo("LSP");
        assertThat(perfilExistente.getObservacionesGenerales()).isEqualTo("nuevo");
    }

    @Test
    void debeReemplazarColeccionesHijasAlGuardar() {
        PerfilDiscapacidadAuditiva perfilExistente = PerfilDiscapacidadAuditiva.builder()
                .id(50L)
                .alumno(alumno())
                .barreras(new ArrayList<>(List.of(
                        PerfilBarrera.builder().id(1L).tipo(TipoBarrera.FISICA).descripcion("antigua").build())))
                .fortalezas(new ArrayList<>(List.of(
                        PerfilFortaleza.builder().id(2L).dimension(TipoDimension.EXPRESIONES).descripcion("antigua").build())))
                .apoyos(new ArrayList<>(List.of(
                        PerfilApoyo.builder().id(3L).intensidad(TipoIntensidad.GENERALIZADO)
                                .funcion(TipoFuncion.ROL_COMPORTAMIENTO).descripcion("antigua").fuente(TipoFuente.SAAC).build())))
                .build();

        when(alumnoRepository.existsById(ALUMNO_ID)).thenReturn(true);
        stubUsuarioActualConRol(TipoRol.SAANEE);
        when(alumnoRepository.findById(ALUMNO_ID)).thenReturn(Optional.of(alumno()));
        when(perfilRepository.findByAlumnoId(ALUMNO_ID)).thenReturn(Optional.of(perfilExistente));
        when(perfilRepository.save(any(PerfilDiscapacidadAuditiva.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(perfilMapper.toBarreraEntity(any(), any()))
                .thenReturn(PerfilBarrera.builder().tipo(TipoBarrera.PEDAGOGICA).descripcion("nueva").build());
        when(perfilMapper.toFortalezaEntity(any(), any()))
                .thenReturn(PerfilFortaleza.builder().dimension(TipoDimension.MOTIVACIONES).descripcion("nueva").build());
        when(perfilMapper.toApoyoEntity(any(), any()))
                .thenReturn(PerfilApoyo.builder().intensidad(TipoIntensidad.LIMITADO)
                        .funcion(TipoFuncion.ACCESO_INFORMACION).descripcion("nueva").fuente(TipoFuente.PERSONAS).build());
        when(perfilMapper.toResponse(any())).thenReturn(PerfilDiscapacidadResponse.builder().build());

        perfilDiscapacidadService.guardar(ALUMNO_ID, requestConColecciones());

        assertThat(perfilExistente.getBarreras()).hasSize(1)
                .allMatch(b -> "nueva".equals(b.getDescripcion()));
        assertThat(perfilExistente.getFortalezas()).hasSize(1)
                .allMatch(f -> "nueva".equals(f.getDescripcion()));
        assertThat(perfilExistente.getApoyos()).hasSize(1)
                .allMatch(a -> "nueva".equals(a.getDescripcion()));
    }

    // ---------- Control de acceso por rol (RNF01) ----------

    @Test
    void debePermitirAccesoADocenteAsignado() {
        when(alumnoRepository.existsById(ALUMNO_ID)).thenReturn(true);
        stubUsuarioActualConRol(TipoRol.DOCENTE);
        when(alumnoRepository.existsByIdAndDocentesId(ALUMNO_ID, USUARIO_ID)).thenReturn(true);
        when(perfilRepository.findByAlumnoId(ALUMNO_ID))
                .thenReturn(Optional.of(PerfilDiscapacidadAuditiva.builder().id(1L).alumno(alumno()).build()));
        when(perfilMapper.toResponse(any())).thenReturn(PerfilDiscapacidadResponse.builder().id(1L).build());

        PerfilDiscapacidadResponse response = perfilDiscapacidadService.obtenerPorAlumnoId(ALUMNO_ID);

        assertThat(response).isNotNull();
    }

    @Test
    void debeNegarAccesoADocenteNoAsignado() {
        when(alumnoRepository.existsById(ALUMNO_ID)).thenReturn(true);
        stubUsuarioActualConRol(TipoRol.DOCENTE);
        when(alumnoRepository.existsByIdAndDocentesId(ALUMNO_ID, USUARIO_ID)).thenReturn(false);

        assertThatThrownBy(() -> perfilDiscapacidadService.obtenerPorAlumnoId(ALUMNO_ID))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void debePermitirAccesoAPadreDelAlumno() {
        when(alumnoRepository.existsById(ALUMNO_ID)).thenReturn(true);
        stubUsuarioActualConRol(TipoRol.PADRE);
        when(alumnoRepository.existsByIdAndPadresId(ALUMNO_ID, USUARIO_ID)).thenReturn(true);
        when(perfilRepository.findByAlumnoId(ALUMNO_ID))
                .thenReturn(Optional.of(PerfilDiscapacidadAuditiva.builder().id(1L).alumno(alumno()).build()));
        when(perfilMapper.toResponse(any())).thenReturn(PerfilDiscapacidadResponse.builder().id(1L).build());

        PerfilDiscapacidadResponse response = perfilDiscapacidadService.obtenerPorAlumnoId(ALUMNO_ID);

        assertThat(response).isNotNull();
    }

    @Test
    void debeNegarAccesoAPadreNoRelacionado() {
        when(alumnoRepository.existsById(ALUMNO_ID)).thenReturn(true);
        stubUsuarioActualConRol(TipoRol.PADRE);
        when(alumnoRepository.existsByIdAndPadresId(ALUMNO_ID, USUARIO_ID)).thenReturn(false);

        assertThatThrownBy(() -> perfilDiscapacidadService.obtenerPorAlumnoId(ALUMNO_ID))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void debePermitirAccesoASaanee() {
        when(alumnoRepository.existsById(ALUMNO_ID)).thenReturn(true);
        stubUsuarioActualConRol(TipoRol.SAANEE);
        when(perfilRepository.findByAlumnoId(ALUMNO_ID))
                .thenReturn(Optional.of(PerfilDiscapacidadAuditiva.builder().id(1L).alumno(alumno()).build()));
        when(perfilMapper.toResponse(any())).thenReturn(PerfilDiscapacidadResponse.builder().id(1L).build());

        PerfilDiscapacidadResponse response = perfilDiscapacidadService.obtenerPorAlumnoId(ALUMNO_ID);

        assertThat(response).isNotNull();
    }

    @Test
    void debeNegarAccesoAAdmin() {
        when(alumnoRepository.existsById(ALUMNO_ID)).thenReturn(true);
        stubUsuarioActualConRol(TipoRol.ADMIN);

        assertThatThrownBy(() -> perfilDiscapacidadService.obtenerPorAlumnoId(ALUMNO_ID))
                .isInstanceOf(AccessDeniedException.class);
    }

    // ---------- Recursos inexistentes ----------

    @Test
    void debeLanzarResourceNotFoundSiAlumnoNoExiste() {
        when(alumnoRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> perfilDiscapacidadService.obtenerPorAlumnoId(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void debeLanzarResourceNotFoundAlObtenerSinPerfil() {
        when(alumnoRepository.existsById(ALUMNO_ID)).thenReturn(true);
        stubUsuarioActualConRol(TipoRol.SAANEE);
        when(perfilRepository.findByAlumnoId(ALUMNO_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> perfilDiscapacidadService.obtenerPorAlumnoId(ALUMNO_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
