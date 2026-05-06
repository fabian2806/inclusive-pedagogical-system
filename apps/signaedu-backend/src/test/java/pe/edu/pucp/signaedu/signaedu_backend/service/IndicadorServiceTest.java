package pe.edu.pucp.signaedu.signaedu_backend.service;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.IndicadorCreateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.IndicadorUpdateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.IndicadorResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.UsuarioSimpleResponse;
import pe.edu.pucp.signaedu.signaedu_backend.exception.ResourceNotFoundException;
import pe.edu.pucp.signaedu.signaedu_backend.mapper.IndicadorMapper;
import pe.edu.pucp.signaedu.signaedu_backend.model.Indicador;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.AreaCurricular;
import pe.edu.pucp.signaedu.signaedu_backend.repository.IndicadorRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.UsuarioRepository;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IndicadorServiceTest {

    private static final String CORREO_ACTUAL = "docente@signaedu.pe";
    private static final Long USUARIO_ACTUAL_ID = 10L;
    private static final Long OTRO_USUARIO_ID = 20L;
    private static final Long INDICADOR_ID = 100L;

    @Mock
    private IndicadorRepository indicadorRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private IndicadorMapper mapper;

    @InjectMocks
    private IndicadorService indicadorService;

    @BeforeEach
    void setUpSecurityContext() {
        SecurityContextHolder.getContext().setAuthentication(
                new TestingAuthenticationToken(CORREO_ACTUAL, "n/a"));
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    // ---------- Helpers ----------

    private Usuario usuarioActual() {
        return Usuario.builder()
                .id(USUARIO_ACTUAL_ID)
                .nombre("Docente").apellido("Actual")
                .correo(CORREO_ACTUAL)
                .passwordHash("h")
                .roles(new HashSet<>())
                .build();
    }

    private Usuario otroUsuario() {
        return Usuario.builder()
                .id(OTRO_USUARIO_ID)
                .nombre("Otro").apellido("Docente")
                .correo("otro@signaedu.pe")
                .passwordHash("h")
                .roles(new HashSet<>())
                .build();
    }

    private Indicador indicadorDe(Usuario creador, boolean activo) {
        return Indicador.builder()
                .id(INDICADOR_ID)
                .nombre("Comprensión LSP")
                .descripcion("Descripción del indicador")
                .categoria("Comunicación")
                .areaCurricular(AreaCurricular.COMUNICACION)
                .usuarioCreador(creador)
                .activo(activo)
                .build();
    }

    private IndicadorCreateRequest createRequest() {
        IndicadorCreateRequest req = new IndicadorCreateRequest();
        req.setNombre("Comprensión LSP");
        req.setDescripcion("Descripción");
        req.setCategoria("Comunicación");
        req.setAreaCurricular(AreaCurricular.COMUNICACION);
        return req;
    }

    private IndicadorUpdateRequest updateRequest() {
        IndicadorUpdateRequest req = new IndicadorUpdateRequest();
        req.setNombre("Comprensión LSP avanzada");
        req.setDescripcion("Nueva descripción");
        req.setCategoria("Comunicación");
        req.setAreaCurricular(AreaCurricular.COMUNICACION);
        return req;
    }

    private void stubUsuarioActual() {
        when(usuarioRepository.findByCorreo(CORREO_ACTUAL))
                .thenReturn(Optional.of(usuarioActual()));
    }

    private IndicadorResponse responseStub() {
        return IndicadorResponse.builder()
                .id(INDICADOR_ID)
                .nombre("Comprensión LSP")
                .areaCurricular(AreaCurricular.COMUNICACION)
                .usuarioCreador(UsuarioSimpleResponse.builder().id(USUARIO_ACTUAL_ID).build())
                .activo(true)
                .build();
    }

    // ---------- crear ----------

    @Test
    void crearAsignaUsuarioAutenticadoComoCreador() {
        stubUsuarioActual();
        Indicador entidadConCreador = indicadorDe(usuarioActual(), true);
        when(mapper.toEntity(any(IndicadorCreateRequest.class), eq(usuarioActual())))
                .thenReturn(entidadConCreador);
        when(indicadorRepository.save(entidadConCreador)).thenReturn(entidadConCreador);
        when(mapper.toResponse(entidadConCreador)).thenReturn(responseStub());

        IndicadorResponse response = indicadorService.crear(createRequest());

        assertThat(response.getUsuarioCreador().getId()).isEqualTo(USUARIO_ACTUAL_ID);
        verify(indicadorRepository).save(entidadConCreador);
    }

    // ---------- listar ----------

    @Test
    void listarPasaSpecificationAlRepository() {
        when(indicadorRepository.findAll(any(Specification.class), any(Sort.class)))
                .thenReturn(List.of());

        indicadorService.listar(AreaCurricular.MATEMATICA, "lsp", true);

        verify(indicadorRepository).findAll(
                any(Specification.class),
                eq(Sort.by(Sort.Direction.ASC, "nombre")));
    }

    // ---------- obtenerPorId ----------

    @Test
    void obtenerPorIdDevuelveIndicador() {
        Indicador indicador = indicadorDe(usuarioActual(), true);
        when(indicadorRepository.findById(INDICADOR_ID)).thenReturn(Optional.of(indicador));
        when(mapper.toResponse(indicador)).thenReturn(responseStub());

        IndicadorResponse response = indicadorService.obtenerPorId(INDICADOR_ID);

        assertThat(response.getId()).isEqualTo(INDICADOR_ID);
    }

    @Test
    void obtenerPorIdLanzaNotFoundSiNoExiste() {
        when(indicadorRepository.findById(INDICADOR_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> indicadorService.obtenerPorId(INDICADOR_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ---------- actualizar (ownership) ----------

    @Test
    void actualizarPermiteAlCreador() {
        Indicador indicador = indicadorDe(usuarioActual(), true);
        when(indicadorRepository.findById(INDICADOR_ID)).thenReturn(Optional.of(indicador));
        stubUsuarioActual();
        when(indicadorRepository.save(any(Indicador.class))).thenAnswer(inv -> inv.getArgument(0));
        when(mapper.toResponse(any(Indicador.class))).thenReturn(responseStub());

        indicadorService.actualizar(INDICADOR_ID, updateRequest());

        ArgumentCaptor<Indicador> captor = ArgumentCaptor.forClass(Indicador.class);
        verify(indicadorRepository).save(captor.capture());
        assertThat(captor.getValue().getNombre()).isEqualTo("Comprensión LSP avanzada");
    }

    @Test
    void actualizarRechazaSiNoEsCreador() {
        // Indicador creado por OTRO usuario
        Indicador indicadorAjeno = indicadorDe(otroUsuario(), true);
        when(indicadorRepository.findById(INDICADOR_ID)).thenReturn(Optional.of(indicadorAjeno));
        // El usuario autenticado NO es el creador
        stubUsuarioActual();

        assertThatThrownBy(() -> indicadorService.actualizar(INDICADOR_ID, updateRequest()))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Solo el docente que creó");

        verify(indicadorRepository, never()).save(any(Indicador.class));
    }

    // ---------- desactivar / activar (ownership) ----------

    @Test
    void desactivarRechazaSiNoEsCreador() {
        Indicador indicadorAjeno = indicadorDe(otroUsuario(), true);
        when(indicadorRepository.findById(INDICADOR_ID)).thenReturn(Optional.of(indicadorAjeno));
        stubUsuarioActual();

        assertThatThrownBy(() -> indicadorService.desactivar(INDICADOR_ID))
                .isInstanceOf(AccessDeniedException.class);

        // El estado del indicador NO cambió
        assertThat(indicadorAjeno.getActivo()).isTrue();
        verify(indicadorRepository, never()).save(any(Indicador.class));
    }

    @Test
    void desactivarPermiteAlCreador() {
        Indicador propio = indicadorDe(usuarioActual(), true);
        when(indicadorRepository.findById(INDICADOR_ID)).thenReturn(Optional.of(propio));
        stubUsuarioActual();
        when(indicadorRepository.save(any(Indicador.class))).thenAnswer(inv -> inv.getArgument(0));
        lenient().when(mapper.toResponse(any(Indicador.class))).thenReturn(responseStub());

        indicadorService.desactivar(INDICADOR_ID);

        ArgumentCaptor<Indicador> captor = ArgumentCaptor.forClass(Indicador.class);
        verify(indicadorRepository).save(captor.capture());
        assertThat(captor.getValue().getActivo()).isFalse();
    }

    @Test
    void activarPermiteAlCreador() {
        Indicador propio = indicadorDe(usuarioActual(), false);
        when(indicadorRepository.findById(INDICADOR_ID)).thenReturn(Optional.of(propio));
        stubUsuarioActual();
        when(indicadorRepository.save(any(Indicador.class))).thenAnswer(inv -> inv.getArgument(0));
        lenient().when(mapper.toResponse(any(Indicador.class))).thenReturn(responseStub());

        indicadorService.activar(INDICADOR_ID);

        ArgumentCaptor<Indicador> captor = ArgumentCaptor.forClass(Indicador.class);
        verify(indicadorRepository).save(captor.capture());
        assertThat(captor.getValue().getActivo()).isTrue();
    }
}
