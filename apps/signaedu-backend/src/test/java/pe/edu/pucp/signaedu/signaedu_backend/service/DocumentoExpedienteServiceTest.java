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
import pe.edu.pucp.signaedu.signaedu_backend.dto.request.DocumentoExpedienteCreateRequest;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.DocumentoExpedienteResponse;
import pe.edu.pucp.signaedu.signaedu_backend.exception.DuplicateResourceException;
import pe.edu.pucp.signaedu.signaedu_backend.exception.IllegalOperationException;
import pe.edu.pucp.signaedu.signaedu_backend.exception.ResourceNotFoundException;
import pe.edu.pucp.signaedu.signaedu_backend.mapper.DocumentoExpedienteMapper;
import pe.edu.pucp.signaedu.signaedu_backend.model.Alumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.ArchivoAdjunto;
import pe.edu.pucp.signaedu.signaedu_backend.model.DocumentoExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.EntradaExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.Expediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.Rol;
import pe.edu.pucp.signaedu.signaedu_backend.model.TipoDocumento;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoDocumento;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoUsuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;
import pe.edu.pucp.signaedu.signaedu_backend.repository.AlumnoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.ArchivoAdjuntoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.DocumentoExpedienteRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.EntradaExpedienteRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.ExpedienteRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.TipoDocumentoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.UsuarioRepository;
import pe.edu.pucp.signaedu.signaedu_backend.service.storage.ArchivoStorage;

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
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DocumentoExpedienteServiceTest {

    @Mock private DocumentoExpedienteRepository documentoRepository;
    @Mock private ArchivoAdjuntoRepository archivoRepository;
    @Mock private EntradaExpedienteRepository entradaRepository;
    @Mock private ExpedienteRepository expedienteRepository;
    @Mock private TipoDocumentoRepository tipoDocumentoRepository;
    @Mock private AlumnoRepository alumnoRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private ConfiguracionService configuracionService;
    @Mock private ArchivoStorage archivoStorage;
    @Mock private DocumentoExpedienteMapper documentoMapper;

    @InjectMocks
    private DocumentoExpedienteService service;

    private static final Long ALUMNO_ID = 5L;
    private static final Long EXPEDIENTE_ID = 50L;
    private static final Long DOCENTE_ID = 10L;
    private static final String DOCENTE_CORREO = "docente@signaedu.pe";

    @BeforeEach
    void setUp() {
        // Inyectar @Value y bypass del @PostConstruct.
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

    private Expediente expediente() {
        return Expediente.builder()
                .id(EXPEDIENTE_ID)
                .alumno(Alumno.builder().id(ALUMNO_ID).build())
                .periodoLectivo("2026")
                .estado(EstadoExpediente.ACTIVO)
                .build();
    }

    private TipoDocumento tipoIpp() {
        // Versionable, no periódico (caso típico).
        return TipoDocumento.builder()
                .id(2L).nombre("IPP")
                .esObligatorio(true).esVersionable(true)
                .esPeriodico(false).esPredefinido(true).build();
    }

    private TipoDocumento tipoIb() {
        // No versionable, periódico bimestral.
        return TipoDocumento.builder()
                .id(3L).nombre("IB")
                .esObligatorio(true).esVersionable(false)
                .esPeriodico(true).periodicidad("BIMESTRAL").esPredefinido(true).build();
    }

    private TipoDocumento tipoOtro() {
        return TipoDocumento.builder()
                .id(5L).nombre("OTRO")
                .esObligatorio(false).esVersionable(false)
                .esPeriodico(false).esPredefinido(true).build();
    }

    private DocumentoExpedienteCreateRequest request(Long tipoId, String periodo) {
        DocumentoExpedienteCreateRequest req = new DocumentoExpedienteCreateRequest();
        req.setTipoDocumentoId(tipoId);
        req.setTitulo("Documento de prueba");
        req.setPeriodo(periodo);
        req.setFechaEmision(java.time.LocalDate.of(2026, 1, 15));
        return req;
    }

    private MockMultipartFile pdfValido() {
        return new MockMultipartFile(
                "archivo", "doc.pdf", "application/pdf", "contenido pdf".getBytes());
    }

    /**
     * Mocks suficientes para superar validarAccesoYObtenerUsuario (acceso por
     * rol al alumno). No incluye expediente vigente — usar mockAccesoOk para
     * flujos que también lo requieren (subir/listar).
     */
    private void mockAccesoUsuario() {
        when(alumnoRepository.existsById(ALUMNO_ID)).thenReturn(true);
        when(usuarioRepository.findByCorreo(DOCENTE_CORREO)).thenReturn(Optional.of(docente()));
        when(alumnoRepository.existsByIdAndDocentesId(ALUMNO_ID, DOCENTE_ID)).thenReturn(true);
    }

    private void mockAccesoOk() {
        mockAccesoUsuario();
        when(configuracionService.obtenerValorPeriodo()).thenReturn("2026");
        when(expedienteRepository.findByAlumnoIdAndPeriodoLectivoAndEstado(
                eq(ALUMNO_ID), eq("2026"), eq(EstadoExpediente.ACTIVO)))
                .thenReturn(Optional.of(expediente()));
    }

    private DocumentoExpedienteResponse anyResponse() {
        return DocumentoExpedienteResponse.builder().id(99L).titulo("ok").build();
    }

    // ============ subir() ============

    @Test
    void subirDebeCrearTodaLaCadenaYInvocarStorage() {
        mockAccesoOk();
        when(tipoDocumentoRepository.findById(2L)).thenReturn(Optional.of(tipoIpp()));
        when(documentoRepository.findByExpedienteTipoSinPeriodoYEstado(
                eq(EXPEDIENTE_ID), eq(2L), eq(EstadoDocumento.VIGENTE)))
                .thenReturn(Optional.empty());
        when(entradaRepository.save(any(EntradaExpediente.class)))
                .thenAnswer(inv -> { EntradaExpediente e = inv.getArgument(0); e.setId(77L); return e; });
        when(archivoRepository.save(any(ArchivoAdjunto.class)))
                .thenAnswer(inv -> { ArchivoAdjunto a = inv.getArgument(0); a.setId(123L); return a; });
        when(documentoRepository.save(any(DocumentoExpediente.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(documentoMapper.toResponse(any(DocumentoExpediente.class))).thenReturn(anyResponse());

        service.subir(ALUMNO_ID, request(2L, null), pdfValido());

        verify(entradaRepository).save(any(EntradaExpediente.class));
        verify(archivoRepository).save(any(ArchivoAdjunto.class));
        verify(documentoRepository).save(any(DocumentoExpediente.class));
        verify(archivoStorage).guardar(eq("expedientes/123.pdf"), any(), eq((long) "contenido pdf".getBytes().length));
    }

    @Test
    void subirVersionableDebeArchivarAnteriorYAsignarSiguienteVersion() {
        mockAccesoOk();
        TipoDocumento ipp = tipoIpp();
        DocumentoExpediente anterior = DocumentoExpediente.builder()
                .id(50L).tipoDocumento(ipp).version(1)
                .estado(EstadoDocumento.VIGENTE).build();

        when(tipoDocumentoRepository.findById(2L)).thenReturn(Optional.of(ipp));
        when(documentoRepository.findByExpedienteTipoSinPeriodoYEstado(
                eq(EXPEDIENTE_ID), eq(2L), eq(EstadoDocumento.VIGENTE)))
                .thenReturn(Optional.of(anterior));
        when(entradaRepository.save(any())).thenAnswer(inv -> { EntradaExpediente e = inv.getArgument(0); e.setId(1L); return e; });
        when(archivoRepository.save(any())).thenAnswer(inv -> { ArchivoAdjunto a = inv.getArgument(0); a.setId(2L); return a; });
        when(documentoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(documentoMapper.toResponse(any())).thenReturn(anyResponse());

        service.subir(ALUMNO_ID, request(2L, null), pdfValido());

        // El anterior queda archivado.
        assertThat(anterior.getEstado()).isEqualTo(EstadoDocumento.ARCHIVADO);
        // Save se llama dos veces: anterior actualizado + nuevo.
        verify(documentoRepository, times(2)).save(any(DocumentoExpediente.class));
    }

    @Test
    void subirOtroDebePermitirMultiplesVigentesSinBuscarAnterior() {
        mockAccesoOk();
        when(tipoDocumentoRepository.findById(5L)).thenReturn(Optional.of(tipoOtro()));
        when(entradaRepository.save(any())).thenAnswer(inv -> { EntradaExpediente e = inv.getArgument(0); e.setId(1L); return e; });
        when(archivoRepository.save(any())).thenAnswer(inv -> { ArchivoAdjunto a = inv.getArgument(0); a.setId(2L); return a; });
        when(documentoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(documentoMapper.toResponse(any())).thenReturn(anyResponse());

        service.subir(ALUMNO_ID, request(5L, null), pdfValido());

        // Para OTRO, NO se busca documento anterior vigente.
        verify(documentoRepository, never()).findByExpedienteTipoSinPeriodoYEstado(
                anyLong(), anyLong(), any());
        verify(documentoRepository, never()).findByExpedienteTipoPeriodoYEstado(
                anyLong(), anyLong(), anyString(), any());
    }

    @Test
    void subirNoVersionableConVigenteExistenteDebeLanzarDuplicate() {
        mockAccesoOk();
        TipoDocumento ib = tipoIb();
        DocumentoExpediente vigente = DocumentoExpediente.builder()
                .id(40L).tipoDocumento(ib).periodo("I Bimestre")
                .estado(EstadoDocumento.VIGENTE).build();

        when(tipoDocumentoRepository.findById(3L)).thenReturn(Optional.of(ib));
        when(documentoRepository.findByExpedienteTipoPeriodoYEstado(
                eq(EXPEDIENTE_ID), eq(3L), eq("I Bimestre"), eq(EstadoDocumento.VIGENTE)))
                .thenReturn(Optional.of(vigente));

        assertThatThrownBy(() -> service.subir(ALUMNO_ID, request(3L, "I Bimestre"), pdfValido()))
                .isInstanceOf(DuplicateResourceException.class);

        verify(archivoStorage, never()).guardar(anyString(), any(), anyLong());
    }

    @Test
    void subirPeriodicoSinPeriodoLanzaIllegalOperation() {
        mockAccesoOk();
        when(tipoDocumentoRepository.findById(3L)).thenReturn(Optional.of(tipoIb()));

        assertThatThrownBy(() -> service.subir(ALUMNO_ID, request(3L, null), pdfValido()))
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("requiere indicar el periodo");
    }

    @Test
    void subirNoPeriodicoConPeriodoLanzaIllegalOperation() {
        mockAccesoOk();
        when(tipoDocumentoRepository.findById(2L)).thenReturn(Optional.of(tipoIpp()));

        assertThatThrownBy(() -> service.subir(ALUMNO_ID, request(2L, "I Bimestre"), pdfValido()))
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("no admite periodo");
    }

    @Test
    void subirArchivoVacioLanzaIllegalOperation() {
        mockAccesoOk();
        when(tipoDocumentoRepository.findById(2L)).thenReturn(Optional.of(tipoIpp()));
        MockMultipartFile vacio = new MockMultipartFile(
                "archivo", "vacio.pdf", "application/pdf", new byte[0]);

        assertThatThrownBy(() -> service.subir(ALUMNO_ID, request(2L, null), vacio))
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("vacio");
    }

    @Test
    void subirArchivoExcedeMaxBytesLanzaIllegalOperation() {
        mockAccesoOk();
        when(tipoDocumentoRepository.findById(2L)).thenReturn(Optional.of(tipoIpp()));
        ReflectionTestUtils.setField(service, "maxBytes", 10L);
        MockMultipartFile grande = new MockMultipartFile(
                "archivo", "big.pdf", "application/pdf", "0123456789ABCDEF".getBytes());

        assertThatThrownBy(() -> service.subir(ALUMNO_ID, request(2L, null), grande))
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("supera el tamano");
    }

    @Test
    void subirMimeNoPermitidoLanzaIllegalOperation() {
        mockAccesoOk();
        when(tipoDocumentoRepository.findById(2L)).thenReturn(Optional.of(tipoIpp()));
        MockMultipartFile exe = new MockMultipartFile(
                "archivo", "virus.exe", "application/x-msdownload", "evil".getBytes());

        assertThatThrownBy(() -> service.subir(ALUMNO_ID, request(2L, null), exe))
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("MIME");
    }

    @Test
    void subirSinExpedienteVigenteLanzaIllegalOperation() {
        when(alumnoRepository.existsById(ALUMNO_ID)).thenReturn(true);
        when(usuarioRepository.findByCorreo(DOCENTE_CORREO)).thenReturn(Optional.of(docente()));
        when(alumnoRepository.existsByIdAndDocentesId(ALUMNO_ID, DOCENTE_ID)).thenReturn(true);
        when(configuracionService.obtenerValorPeriodo()).thenReturn("2026");
        when(expedienteRepository.findByAlumnoIdAndPeriodoLectivoAndEstado(any(), any(), any()))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.subir(ALUMNO_ID, request(2L, null), pdfValido()))
                .isInstanceOf(IllegalOperationException.class)
                .hasMessageContaining("expediente activo");
    }

    @Test
    void subirDocenteNoAsignadoLanzaAccessDenied() {
        when(alumnoRepository.existsById(ALUMNO_ID)).thenReturn(true);
        when(usuarioRepository.findByCorreo(DOCENTE_CORREO)).thenReturn(Optional.of(docente()));
        when(alumnoRepository.existsByIdAndDocentesId(ALUMNO_ID, DOCENTE_ID)).thenReturn(false);

        assertThatThrownBy(() -> service.subir(ALUMNO_ID, request(2L, null), pdfValido()))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void subirAlumnoInexistenteLanzaResourceNotFound() {
        when(alumnoRepository.existsById(ALUMNO_ID)).thenReturn(false);

        assertThatThrownBy(() -> service.subir(ALUMNO_ID, request(2L, null), pdfValido()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ============ listar() ============

    @Test
    void listarDevuelveDocumentosDelExpedienteVigente() {
        mockAccesoOk();
        DocumentoExpediente doc = DocumentoExpediente.builder().id(1L).build();
        when(documentoRepository.findByExpedienteId(EXPEDIENTE_ID)).thenReturn(List.of(doc));
        when(documentoMapper.toResponse(any())).thenReturn(anyResponse());

        List<DocumentoExpedienteResponse> result = service.listar(ALUMNO_ID);

        assertThat(result).hasSize(1);
    }

    @Test
    void listarSinExpedienteVigenteDevuelveListaVacia() {
        when(alumnoRepository.existsById(ALUMNO_ID)).thenReturn(true);
        when(usuarioRepository.findByCorreo(DOCENTE_CORREO)).thenReturn(Optional.of(docente()));
        when(alumnoRepository.existsByIdAndDocentesId(ALUMNO_ID, DOCENTE_ID)).thenReturn(true);
        when(configuracionService.obtenerValorPeriodo()).thenReturn("2026");
        when(expedienteRepository.findByAlumnoIdAndPeriodoLectivoAndEstado(any(), any(), any()))
                .thenReturn(Optional.empty());

        List<DocumentoExpedienteResponse> result = service.listar(ALUMNO_ID);

        assertThat(result).isEmpty();
        verify(documentoRepository, never()).findByExpedienteId(any());
    }

    // ============ descargar() ============

    @Test
    void descargarRetornaRecursoConMetadataDelArchivo() {
        mockAccesoUsuario();
        ArchivoAdjunto archivo = ArchivoAdjunto.builder()
                .id(7L).nombreOriginal("doc.pdf").mimeType("application/pdf")
                .tamano(1024L).rutaAlmacenamiento("expedientes/7.pdf").build();
        DocumentoExpediente doc = DocumentoExpediente.builder()
                .id(1L).archivo(archivo).entrada(EntradaExpediente.builder()
                        .expediente(expediente()).build())
                .build();
        when(documentoRepository.findById(1L)).thenReturn(Optional.of(doc));
        when(archivoStorage.leer("expedientes/7.pdf"))
                .thenReturn(new java.io.ByteArrayInputStream("data".getBytes()));

        ArchivoDescargaResource result = service.descargar(ALUMNO_ID, 1L);

        assertThat(result.nombreOriginal()).isEqualTo("doc.pdf");
        assertThat(result.mimeType()).isEqualTo("application/pdf");
        assertThat(result.tamano()).isEqualTo(1024L);
    }

    @Test
    void descargarDeOtroAlumnoLanzaResourceNotFound() {
        mockAccesoUsuario();
        // Documento existe pero pertenece a otro alumno.
        Expediente ajeno = Expediente.builder()
                .id(999L).alumno(Alumno.builder().id(8888L).build()).build();
        DocumentoExpediente doc = DocumentoExpediente.builder()
                .id(1L).entrada(EntradaExpediente.builder().expediente(ajeno).build()).build();
        lenient().when(documentoRepository.findById(1L)).thenReturn(Optional.of(doc));

        assertThatThrownBy(() -> service.descargar(ALUMNO_ID, 1L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void descargarDocumentoInexistenteLanzaResourceNotFound() {
        mockAccesoUsuario();
        when(documentoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.descargar(ALUMNO_ID, 99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
