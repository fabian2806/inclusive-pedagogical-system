package pe.edu.pucp.signaedu.signaedu_backend.service;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.EntradaExpedienteRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.EntradaExpedienteResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.UsuarioBitacoraResponse;
import pe.edu.pucp.signaedu.signaedu_backend.exception.IllegalOperationException;
import pe.edu.pucp.signaedu.signaedu_backend.exception.ResourceNotFoundException;
import pe.edu.pucp.signaedu.signaedu_backend.mapper.EntradaExpedienteMapper;
import pe.edu.pucp.signaedu.signaedu_backend.model.Alumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.EntradaExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.Expediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.Indicador;
import pe.edu.pucp.signaedu.signaedu_backend.model.Rol;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.AreaCurricular;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoAlumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoEntrada;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;
import pe.edu.pucp.signaedu.signaedu_backend.repository.AlumnoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.EntradaExpedienteRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.ExpedienteRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.IndicadorRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.UsuarioRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BitacoraServiceTest {

    private static final Long ALUMNO_ID = 1L;
    private static final Long USUARIO_ID = 10L;
    private static final Long EXPEDIENTE_ID = 100L;
    private static final String PERIODO = "2026";
    private static final String CORREO = "docente@signaedu.pe";

    @Mock
    private EntradaExpedienteRepository entradaRepository;

    @Mock
    private ExpedienteRepository expedienteRepository;

    @Mock
    private AlumnoRepository alumnoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private IndicadorRepository indicadorRepository;

    @Mock
    private ConfiguracionService configuracionService;

    @Mock
    private EntradaExpedienteMapper mapper;

    @InjectMocks
    private BitacoraService bitacoraService;

    @BeforeEach
    void setUpSecurityContext() {
        SecurityContextHolder.getContext().setAuthentication(
                new TestingAuthenticationToken(CORREO, "n/a"));
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    // ---------- Helpers ----------

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

    private Expediente expedienteVigente() {
        return Expediente.builder()
                .id(EXPEDIENTE_ID)
                .alumno(alumno())
                .fechaApertura(LocalDate.now())
                .periodoLectivo(PERIODO)
                .estado(EstadoExpediente.ACTIVO)
                .build();
    }

    private EntradaExpedienteRequest request(TipoEntrada tipo) {
        EntradaExpedienteRequest req = new EntradaExpedienteRequest();
        req.setTipo(tipo);
        req.setDescripcion("Descripción de prueba");
        return req;
    }

    private void stubUsuarioActualConRol(TipoRol rol) {
        lenient().when(usuarioRepository.findByCorreo(CORREO))
                .thenReturn(Optional.of(usuarioConRol(rol)));
    }

    private void stubExpedienteVigente() {
        lenient().when(configuracionService.obtenerValorPeriodo()).thenReturn(PERIODO);
        lenient().when(expedienteRepository.findByAlumnoIdAndPeriodoLectivoAndEstado(
                ALUMNO_ID, PERIODO, EstadoExpediente.ACTIVO))
                .thenReturn(Optional.of(expedienteVigente()));
    }

    private void stubSinExpedienteVigente() {
        lenient().when(configuracionService.obtenerValorPeriodo()).thenReturn(PERIODO);
        lenient().when(expedienteRepository.findByAlumnoIdAndPeriodoLectivoAndEstado(
                ALUMNO_ID, PERIODO, EstadoExpediente.ACTIVO))
                .thenReturn(Optional.empty());
    }

    private void stubAccesoDocenteAsignado() {
        when(alumnoRepository.existsById(ALUMNO_ID)).thenReturn(true);
        stubUsuarioActualConRol(TipoRol.DOCENTE);
        when(alumnoRepository.existsByIdAndDocentesId(ALUMNO_ID, USUARIO_ID)).thenReturn(true);
    }

    private void stubAccesoPadreAsignado() {
        when(alumnoRepository.existsById(ALUMNO_ID)).thenReturn(true);
        stubUsuarioActualConRol(TipoRol.PADRE);
        when(alumnoRepository.existsByIdAndPadresId(ALUMNO_ID, USUARIO_ID)).thenReturn(true);
    }

    private void stubGuardadoYRespuesta() {
        when(entradaRepository.save(any(EntradaExpediente.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(mapper.toResponse(any())).thenReturn(EntradaExpedienteResponse.builder().id(1L).build());
    }

    // ---------- crear: tipos permitidos por rol (matriz rol×tipo) ----------

    @Test
    void docenteDebePoderCrearObservacionPedagogica() {
        stubAccesoDocenteAsignado();
        stubExpedienteVigente();
        stubGuardadoYRespuesta();

        EntradaExpedienteResponse response = bitacoraService.crear(
                ALUMNO_ID, request(TipoEntrada.OBSERVACION_PEDAGOGICA));

        assertThat(response).isNotNull();
        verify(entradaRepository).save(any(EntradaExpediente.class));
    }

    @Test
    void padreDebePoderCrearComunicacionFamiliar() {
        stubAccesoPadreAsignado();
        stubExpedienteVigente();
        stubGuardadoYRespuesta();

        EntradaExpedienteResponse response = bitacoraService.crear(
                ALUMNO_ID, request(TipoEntrada.COMUNICACION_FAMILIAR));

        assertThat(response).isNotNull();
    }

    @Test
    void saaneeDebePoderCrearFeedbackSaanee() {
        when(alumnoRepository.existsById(ALUMNO_ID)).thenReturn(true);
        stubUsuarioActualConRol(TipoRol.SAANEE);
        stubExpedienteVigente();
        stubGuardadoYRespuesta();

        EntradaExpedienteResponse response = bitacoraService.crear(
                ALUMNO_ID, request(TipoEntrada.FEEDBACK_SAANEE));

        assertThat(response).isNotNull();
    }

    @Test
    void docenteNoDebePoderCrearComunicacionFamiliar() {
        stubAccesoDocenteAsignado();
        stubExpedienteVigente();

        assertThatThrownBy(() -> bitacoraService.crear(
                ALUMNO_ID, request(TipoEntrada.COMUNICACION_FAMILIAR)))
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("rol del usuario no permite");

        verify(entradaRepository, never()).save(any());
    }

    @Test
    void debeRechazarTipoDiferidoAFaseFutura() {
        // EVALUACION_INDICADOR ya está habilitado en Fase 2c.
        // Los tipos aún diferidos son EVENTO_AGENDA (Fase 3) y DOCUMENTO_ADJUNTADO (Fase 2d).
        stubAccesoDocenteAsignado();
        stubExpedienteVigente();

        assertThatThrownBy(() -> bitacoraService.crear(
                ALUMNO_ID, request(TipoEntrada.EVENTO_AGENDA)))
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("no está disponible en esta fase");
    }

    // ---------- crear: control de acceso por rol ----------

    @Test
    void debeLanzarResourceNotFoundSiAlumnoNoExiste() {
        when(alumnoRepository.existsById(ALUMNO_ID)).thenReturn(false);

        assertThatThrownBy(() -> bitacoraService.crear(
                ALUMNO_ID, request(TipoEntrada.OBSERVACION_PEDAGOGICA)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void debeNegarAccesoADocenteNoAsignado() {
        when(alumnoRepository.existsById(ALUMNO_ID)).thenReturn(true);
        stubUsuarioActualConRol(TipoRol.DOCENTE);
        when(alumnoRepository.existsByIdAndDocentesId(ALUMNO_ID, USUARIO_ID)).thenReturn(false);

        assertThatThrownBy(() -> bitacoraService.crear(
                ALUMNO_ID, request(TipoEntrada.OBSERVACION_PEDAGOGICA)))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void debeNegarAccesoAAdmin() {
        when(alumnoRepository.existsById(ALUMNO_ID)).thenReturn(true);
        stubUsuarioActualConRol(TipoRol.ADMIN);

        assertThatThrownBy(() -> bitacoraService.crear(
                ALUMNO_ID, request(TipoEntrada.OBSERVACION_PEDAGOGICA)))
                .isInstanceOf(AccessDeniedException.class);
    }

    // ---------- crear: expediente vigente ----------

    @Test
    void debeRechazarSiAlumnoNoTieneExpedienteVigente() {
        stubAccesoDocenteAsignado();
        stubSinExpedienteVigente();

        assertThatThrownBy(() -> bitacoraService.crear(
                ALUMNO_ID, request(TipoEntrada.OBSERVACION_PEDAGOGICA)))
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("expediente activo");
    }

    // ---------- crear: respuestas (Opción B, un nivel) ----------

    @Test
    void debeAceptarRespuestaConTipoQueCoincideConRaiz() {
        stubAccesoDocenteAsignado();
        stubExpedienteVigente();
        stubGuardadoYRespuesta();

        EntradaExpediente raiz = EntradaExpediente.builder()
                .id(50L)
                .expediente(expedienteVigente())
                .tipoEntrada(TipoEntrada.OBSERVACION_PEDAGOGICA)
                .entradaRaiz(null)
                .build();
        when(entradaRepository.findById(50L)).thenReturn(Optional.of(raiz));

        EntradaExpedienteRequest req = request(TipoEntrada.OBSERVACION_PEDAGOGICA);
        req.setEntradaRaizId(50L);

        bitacoraService.crear(ALUMNO_ID, req);

        verify(entradaRepository).save(any(EntradaExpediente.class));
    }

    @Test
    void debeRechazarRespuestaConTipoDistintoAlDeLaRaiz() {
        stubAccesoDocenteAsignado();
        stubExpedienteVigente();

        EntradaExpediente raiz = EntradaExpediente.builder()
                .id(50L)
                .expediente(expedienteVigente())
                .tipoEntrada(TipoEntrada.COMUNICACION_FAMILIAR)
                .entradaRaiz(null)
                .build();
        when(entradaRepository.findById(50L)).thenReturn(Optional.of(raiz));

        EntradaExpedienteRequest req = request(TipoEntrada.OBSERVACION_PEDAGOGICA);
        req.setEntradaRaizId(50L);

        assertThatThrownBy(() -> bitacoraService.crear(ALUMNO_ID, req))
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("tipo de la respuesta debe coincidir");
    }

    @Test
    void debeRechazarRespuestaARespuestaAnidada() {
        stubAccesoDocenteAsignado();
        stubExpedienteVigente();

        EntradaExpediente raizDeRaiz = EntradaExpediente.builder().id(40L).build();
        EntradaExpediente raizQueEsRespuesta = EntradaExpediente.builder()
                .id(50L)
                .expediente(expedienteVigente())
                .tipoEntrada(TipoEntrada.OBSERVACION_PEDAGOGICA)
                .entradaRaiz(raizDeRaiz)
                .build();
        when(entradaRepository.findById(50L)).thenReturn(Optional.of(raizQueEsRespuesta));

        EntradaExpedienteRequest req = request(TipoEntrada.OBSERVACION_PEDAGOGICA);
        req.setEntradaRaizId(50L);

        assertThatThrownBy(() -> bitacoraService.crear(ALUMNO_ID, req))
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("solo entradas raíz");
    }

    @Test
    void debeRechazarRespuestaARaizDeOtroExpediente() {
        stubAccesoDocenteAsignado();
        stubExpedienteVigente();

        Expediente otroExpediente = Expediente.builder().id(999L).build();
        EntradaExpediente raizDeOtro = EntradaExpediente.builder()
                .id(50L)
                .expediente(otroExpediente)
                .tipoEntrada(TipoEntrada.OBSERVACION_PEDAGOGICA)
                .entradaRaiz(null)
                .build();
        when(entradaRepository.findById(50L)).thenReturn(Optional.of(raizDeOtro));

        EntradaExpedienteRequest req = request(TipoEntrada.OBSERVACION_PEDAGOGICA);
        req.setEntradaRaizId(50L);

        assertThatThrownBy(() -> bitacoraService.crear(ALUMNO_ID, req))
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("otro expediente");
    }

    // ---------- listar ----------

    @Test
    void listarSinExpedienteVigenteDevuelveListaVacia() {
        when(alumnoRepository.existsById(ALUMNO_ID)).thenReturn(true);
        stubUsuarioActualConRol(TipoRol.SAANEE);
        stubSinExpedienteVigente();

        List<EntradaExpedienteResponse> resultado = bitacoraService.listar(
                ALUMNO_ID, null, null, null);

        assertThat(resultado).isEmpty();
    }

    @Test
    void listarDevuelveEntradasMapeadas() {
        when(alumnoRepository.existsById(ALUMNO_ID)).thenReturn(true);
        stubUsuarioActualConRol(TipoRol.SAANEE);
        stubExpedienteVigente();

        EntradaExpediente entrada = EntradaExpediente.builder()
                .id(1L)
                .expediente(expedienteVigente())
                .tipoEntrada(TipoEntrada.OBSERVACION_PEDAGOGICA)
                .usuario(usuarioConRol(TipoRol.DOCENTE))
                .fecha(LocalDateTime.now())
                .descripcion("x")
                .build();
        when(entradaRepository.findAll(any(Specification.class), any(Sort.class)))
                .thenReturn(List.of(entrada));
        when(mapper.toResponse(entrada))
                .thenReturn(EntradaExpedienteResponse.builder()
                        .id(1L)
                        .autor(UsuarioBitacoraResponse.builder()
                                .id(USUARIO_ID).nombre("María").apellido("Torres").rol("DOCENTE").build())
                        .build());

        List<EntradaExpedienteResponse> resultado = bitacoraService.listar(
                ALUMNO_ID, null, null, null);

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getAutor().getRol()).isEqualTo("DOCENTE");
    }

    @Test
    void listarPasaSpecificationConFiltrosAlRepository() {
        when(alumnoRepository.existsById(ALUMNO_ID)).thenReturn(true);
        stubUsuarioActualConRol(TipoRol.SAANEE);
        stubExpedienteVigente();
        when(entradaRepository.findAll(any(Specification.class), any(Sort.class)))
                .thenReturn(List.of());

        bitacoraService.listar(
                ALUMNO_ID,
                TipoEntrada.OBSERVACION_PEDAGOGICA,
                LocalDateTime.of(2026, 1, 1, 0, 0),
                LocalDateTime.of(2026, 12, 31, 23, 59));

        verify(entradaRepository).findAll(any(Specification.class),
                eq(Sort.by(Sort.Direction.DESC, "fecha")));
    }

    // ---------- crear: EVALUACION_INDICADOR (Fase 2c) ----------
    // Cierra deuda técnica de Fase 2b sobre validación cruzada tipo→indicadorId.

    private Indicador indicador(Long id, boolean activo) {
        return Indicador.builder()
                .id(id)
                .nombre("Comprensión LSP")
                .areaCurricular(AreaCurricular.COMUNICACION)
                .usuarioCreador(usuarioConRol(TipoRol.DOCENTE))
                .activo(activo)
                .build();
    }

    private EntradaExpedienteRequest evaluacionRequest(Long indicadorId, Boolean resultadoLogrado) {
        EntradaExpedienteRequest req = request(TipoEntrada.EVALUACION_INDICADOR);
        req.setIndicadorId(indicadorId);
        req.setResultadoLogrado(resultadoLogrado);
        return req;
    }

    @Test
    void docenteDebeCrearEvaluacionConIndicadorActivo() {
        stubAccesoDocenteAsignado();
        stubExpedienteVigente();
        stubGuardadoYRespuesta();
        when(indicadorRepository.findById(99L))
                .thenReturn(Optional.of(indicador(99L, true)));

        EntradaExpedienteResponse response = bitacoraService.crear(
                ALUMNO_ID, evaluacionRequest(99L, true));

        assertThat(response).isNotNull();
        verify(entradaRepository).save(any(EntradaExpediente.class));
    }

    @Test
    void debeRechazarEvaluacionSinIndicadorId() {
        stubAccesoDocenteAsignado();
        stubExpedienteVigente();

        assertThatThrownBy(() -> bitacoraService.crear(
                ALUMNO_ID, evaluacionRequest(null, true)))
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("indicadorId es obligatorio");

        verify(entradaRepository, never()).save(any());
    }

    @Test
    void debeRechazarEvaluacionConIndicadorInactivo() {
        stubAccesoDocenteAsignado();
        stubExpedienteVigente();
        when(indicadorRepository.findById(99L))
                .thenReturn(Optional.of(indicador(99L, false)));

        assertThatThrownBy(() -> bitacoraService.crear(
                ALUMNO_ID, evaluacionRequest(99L, true)))
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("indicador inactivo");

        verify(entradaRepository, never()).save(any());
    }

    @Test
    void debeRechazarEvaluacionConIndicadorInexistente() {
        stubAccesoDocenteAsignado();
        stubExpedienteVigente();
        when(indicadorRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bitacoraService.crear(
                ALUMNO_ID, evaluacionRequest(99L, true)))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(entradaRepository, never()).save(any());
    }

    @Test
    void debeRechazarOtroTipoConIndicadorId() {
        stubAccesoDocenteAsignado();
        stubExpedienteVigente();

        EntradaExpedienteRequest req = request(TipoEntrada.OBSERVACION_PEDAGOGICA);
        req.setIndicadorId(99L);

        assertThatThrownBy(() -> bitacoraService.crear(ALUMNO_ID, req))
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("indicadorId solo se permite");

        verify(entradaRepository, never()).save(any());
    }
}
