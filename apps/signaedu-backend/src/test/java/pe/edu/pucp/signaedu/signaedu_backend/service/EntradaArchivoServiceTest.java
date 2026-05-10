package pe.edu.pucp.signaedu.signaedu_backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.EntradaArchivoCreateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.EntradaArchivoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.exception.IllegalOperationException;
import pe.edu.pucp.signaedu.signaedu_backend.exception.ResourceNotFoundException;
import pe.edu.pucp.signaedu.signaedu_backend.mapper.EntradaArchivoMapper;
import pe.edu.pucp.signaedu.signaedu_backend.model.Alumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.ArchivoAdjunto;
import pe.edu.pucp.signaedu.signaedu_backend.model.EntradaArchivo;
import pe.edu.pucp.signaedu.signaedu_backend.model.EntradaExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.Expediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.Rol;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoUsuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoEntrada;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;
import pe.edu.pucp.signaedu.signaedu_backend.repository.AlumnoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.ArchivoAdjuntoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.EntradaArchivoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.EntradaExpedienteRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.UsuarioRepository;
import pe.edu.pucp.signaedu.signaedu_backend.service.storage.ArchivoStorage;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EntradaArchivoServiceTest {

    @Mock private EntradaArchivoRepository entradaArchivoRepository;
    @Mock private EntradaExpedienteRepository entradaRepository;
    @Mock private ArchivoAdjuntoRepository archivoRepository;
    @Mock private AlumnoRepository alumnoRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private ArchivoStorage archivoStorage;
    @Mock private EntradaArchivoMapper entradaArchivoMapper;

    @InjectMocks
    private EntradaArchivoService service;

    private static final Long ALUMNO_ID = 5L;
    private static final Long ENTRADA_ID = 30L;
    private static final Long DOCENTE_ID = 10L;
    private static final String DOCENTE_CORREO = "docente@signaedu.pe";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "maxBytes", 10_485_760L);
        ReflectionTestUtils.setField(service, "allowedMimesCsv",
                "application/pdf,image/jpeg,image/png");
        ReflectionTestUtils.setField(service, "mimesPermitidos",
                Set.of("application/pdf", "image/jpeg", "image/png"));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(DOCENTE_CORREO, "x", List.of()));
    }

    // ============ helpers ============

    private Usuario docente() {
        Rol rol = Rol.builder().id(2L).nombre(TipoRol.DOCENTE).build();
        return Usuario.builder()
                .id(DOCENTE_ID)
                .correo(DOCENTE_CORREO)
                .nombre("María").apellido("Torres")
                .estado(EstadoUsuario.ACTIVO)
                .roles(new HashSet<>(Set.of(rol)))
                .build();
    }

    private Usuario otroUsuario() {
        Rol rol = Rol.builder().id(2L).nombre(TipoRol.DOCENTE).build();
        return Usuario.builder()
                .id(999L)
                .correo("otro@signaedu.pe")
                .estado(EstadoUsuario.ACTIVO)
                .roles(new HashSet<>(Set.of(rol)))
                .build();
    }

    private Expediente expedienteActivo() {
        return Expediente.builder()
                .id(50L)
                .alumno(Alumno.builder().id(ALUMNO_ID).build())
                .estado(EstadoExpediente.ACTIVO)
                .build();
    }

    private EntradaExpediente entradaRaiz(Usuario autor, Expediente exp) {
        return EntradaExpediente.builder()
                .id(ENTRADA_ID)
                .expediente(exp)
                .tipoEntrada(TipoEntrada.OBSERVACION_PEDAGOGICA)
                .usuario(autor)
                .fecha(LocalDateTime.now())
                .descripcion("entrada de prueba")
                .entradaRaiz(null)
                .build();
    }

    private EntradaExpediente entradaRespuesta(Usuario autor, Expediente exp) {
        EntradaExpediente raiz = entradaRaiz(autor, exp);
        raiz.setId(99L);
        return EntradaExpediente.builder()
                .id(ENTRADA_ID)
                .expediente(exp)
                .tipoEntrada(TipoEntrada.OBSERVACION_PEDAGOGICA)
                .usuario(autor)
                .fecha(LocalDateTime.now())
                .descripcion("respuesta")
                .entradaRaiz(raiz)
                .build();
    }

    private MockMultipartFile pdfValido() {
        return new MockMultipartFile(
                "archivo", "nota.pdf", "application/pdf", "contenido".getBytes());
    }

    private void mockAccesoOk() {
        when(alumnoRepository.existsById(ALUMNO_ID)).thenReturn(true);
        when(usuarioRepository.findByCorreo(DOCENTE_CORREO)).thenReturn(Optional.of(docente()));
        when(alumnoRepository.existsByIdAndDocentesId(ALUMNO_ID, DOCENTE_ID)).thenReturn(true);
    }

    private EntradaArchivoResponse anyResponse() {
        return EntradaArchivoResponse.builder().id(99L).build();
    }

    // ============ adjuntar() ============

    @Test
    void adjuntarHappyPathPersisteEntradaArchivoYInvocaStorage() {
        mockAccesoOk();
        when(entradaRepository.findById(ENTRADA_ID))
                .thenReturn(Optional.of(entradaRaiz(docente(), expedienteActivo())));
        when(archivoRepository.save(any())).thenAnswer(inv -> {
            ArchivoAdjunto a = inv.getArgument(0); a.setId(7L); return a;
        });
        when(entradaArchivoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(entradaArchivoMapper.toResponse(any())).thenReturn(anyResponse());

        EntradaArchivoCreateRequest req = new EntradaArchivoCreateRequest();
        req.setDescripcion("foto del cuaderno");

        service.adjuntar(ALUMNO_ID, ENTRADA_ID, req, pdfValido());

        verify(archivoRepository).save(any(ArchivoAdjunto.class));
        verify(entradaArchivoRepository).save(any(EntradaArchivo.class));
        verify(archivoStorage).guardar(eq("expedientes/7.pdf"), any(), anyLong());
    }

    @Test
    void adjuntarSoloPermiteAlAutorDeLaEntrada() {
        mockAccesoOk();
        // La entrada fue creada por OTRO usuario.
        when(entradaRepository.findById(ENTRADA_ID))
                .thenReturn(Optional.of(entradaRaiz(otroUsuario(), expedienteActivo())));

        assertThatThrownBy(() -> service.adjuntar(ALUMNO_ID, ENTRADA_ID, null, pdfValido()))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("autor");

        verify(archivoStorage, never()).guardar(anyString(), any(), anyLong());
    }

    @Test
    void adjuntarRespuestaLanzaIllegalOperation() {
        mockAccesoOk();
        when(entradaRepository.findById(ENTRADA_ID))
                .thenReturn(Optional.of(entradaRespuesta(docente(), expedienteActivo())));

        assertThatThrownBy(() -> service.adjuntar(ALUMNO_ID, ENTRADA_ID, null, pdfValido()))
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("entradas raiz");
    }

    @Test
    void adjuntarExpedienteCerradoLanzaIllegalOperation() {
        mockAccesoOk();
        Expediente cerrado = Expediente.builder()
                .id(50L).alumno(Alumno.builder().id(ALUMNO_ID).build())
                .estado(EstadoExpediente.INACTIVO).build();
        when(entradaRepository.findById(ENTRADA_ID))
                .thenReturn(Optional.of(entradaRaiz(docente(), cerrado)));

        assertThatThrownBy(() -> service.adjuntar(ALUMNO_ID, ENTRADA_ID, null, pdfValido()))
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("expediente cerrado");
    }

    @Test
    void adjuntarEntradaDeOtroAlumnoLanzaResourceNotFound() {
        mockAccesoOk();
        Expediente ajeno = Expediente.builder()
                .id(999L).alumno(Alumno.builder().id(8888L).build())
                .estado(EstadoExpediente.ACTIVO).build();
        when(entradaRepository.findById(ENTRADA_ID))
                .thenReturn(Optional.of(entradaRaiz(docente(), ajeno)));

        assertThatThrownBy(() -> service.adjuntar(ALUMNO_ID, ENTRADA_ID, null, pdfValido()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void adjuntarArchivoVacioLanzaIllegalOperation() {
        mockAccesoOk();
        when(entradaRepository.findById(ENTRADA_ID))
                .thenReturn(Optional.of(entradaRaiz(docente(), expedienteActivo())));
        MockMultipartFile vacio = new MockMultipartFile(
                "archivo", "vacio.pdf", "application/pdf", new byte[0]);

        assertThatThrownBy(() -> service.adjuntar(ALUMNO_ID, ENTRADA_ID, null, vacio))
                .isInstanceOf(IllegalOperationException.class);
    }

    @Test
    void adjuntarMimeNoPermitidoLanzaIllegalOperation() {
        mockAccesoOk();
        when(entradaRepository.findById(ENTRADA_ID))
                .thenReturn(Optional.of(entradaRaiz(docente(), expedienteActivo())));
        MockMultipartFile zip = new MockMultipartFile(
                "archivo", "data.zip", "application/zip", "evil".getBytes());

        assertThatThrownBy(() -> service.adjuntar(ALUMNO_ID, ENTRADA_ID, null, zip))
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("MIME");
    }

    // ============ listar() ============

    @Test
    void listarDevuelveArchivosDeLaEntrada() {
        mockAccesoOk();
        when(entradaRepository.findById(ENTRADA_ID))
                .thenReturn(Optional.of(entradaRaiz(docente(), expedienteActivo())));
        when(entradaArchivoRepository.findByEntrada_IdOrderByFechaSubidaAsc(ENTRADA_ID))
                .thenReturn(List.of(EntradaArchivo.builder().id(1L).build()));
        when(entradaArchivoMapper.toResponse(any())).thenReturn(anyResponse());

        List<EntradaArchivoResponse> result = service.listar(ALUMNO_ID, ENTRADA_ID);

        assertThat(result).hasSize(1);
    }

    @Test
    void listarEntradaDeOtroAlumnoLanzaResourceNotFound() {
        mockAccesoOk();
        Expediente ajeno = Expediente.builder()
                .id(999L).alumno(Alumno.builder().id(8888L).build())
                .estado(EstadoExpediente.ACTIVO).build();
        when(entradaRepository.findById(ENTRADA_ID))
                .thenReturn(Optional.of(entradaRaiz(docente(), ajeno)));

        assertThatThrownBy(() -> service.listar(ALUMNO_ID, ENTRADA_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ============ descargar() ============

    @Test
    void descargarRetornaRecursoConMetadata() {
        mockAccesoOk();
        ArchivoAdjunto archivo = ArchivoAdjunto.builder()
                .id(7L).nombreOriginal("foto.jpg").mimeType("image/jpeg")
                .tamano(2048L).rutaAlmacenamiento("expedientes/7.jpg").build();
        EntradaArchivo entradaArchivo = EntradaArchivo.builder()
                .id(15L).entrada(entradaRaiz(docente(), expedienteActivo()))
                .archivo(archivo).build();
        when(entradaArchivoRepository.findById(15L)).thenReturn(Optional.of(entradaArchivo));
        when(archivoStorage.leer("expedientes/7.jpg"))
                .thenReturn(new java.io.ByteArrayInputStream("data".getBytes()));

        ArchivoDescargaResource result = service.descargar(ALUMNO_ID, 15L);

        assertThat(result.nombreOriginal()).isEqualTo("foto.jpg");
        assertThat(result.tamano()).isEqualTo(2048L);
    }

    @Test
    void descargarDeOtroAlumnoLanzaResourceNotFound() {
        mockAccesoOk();
        Expediente ajeno = Expediente.builder()
                .id(999L).alumno(Alumno.builder().id(8888L).build())
                .estado(EstadoExpediente.ACTIVO).build();
        EntradaArchivo entradaArchivo = EntradaArchivo.builder()
                .id(15L).entrada(entradaRaiz(docente(), ajeno))
                .archivo(ArchivoAdjunto.builder().id(7L).build()).build();
        when(entradaArchivoRepository.findById(15L)).thenReturn(Optional.of(entradaArchivo));

        assertThatThrownBy(() -> service.descargar(ALUMNO_ID, 15L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
