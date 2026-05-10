package pe.edu.pucp.signaedu.signaedu_backend.repository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;
import pe.edu.pucp.signaedu.signaedu_backend.model.Alumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.ArchivoAdjunto;
import pe.edu.pucp.signaedu.signaedu_backend.model.DocumentoExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.EntradaExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.Expediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.Rol;
import pe.edu.pucp.signaedu.signaedu_backend.model.TipoDocumento;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoAlumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoDocumento;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoUsuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoEntrada;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class DocumentoExpedienteRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private DocumentoExpedienteRepository documentoRepository;

    private Usuario autor;
    private Expediente expedienteA;
    private Expediente expedienteB;
    private Expediente expedienteAnteriorMismoAlumno;
    private TipoDocumento tipoPep;
    private TipoDocumento tipoIb;

    @BeforeEach
    void setUp() {
        Rol rolDocente = entityManager.persistAndFlush(
                Rol.builder().nombre(TipoRol.DOCENTE).build());

        autor = entityManager.persistAndFlush(Usuario.builder()
                .nombre("María").apellido("Torres")
                .correo("docente@signaedu.pe")
                .telefono("999111222")
                .passwordHash("hashed")
                .estado(EstadoUsuario.ACTIVO)
                .roles(new HashSet<>(Set.of(rolDocente)))
                .build());

        Alumno alumnoA = entityManager.persistAndFlush(crearAlumno("Sofía"));
        Alumno alumnoB = entityManager.persistAndFlush(crearAlumno("Carlos"));

        expedienteA = entityManager.persistAndFlush(crearExpediente(alumnoA, "2026"));
        expedienteB = entityManager.persistAndFlush(crearExpediente(alumnoB, "2026"));

        // Mismo alumno A pero un expediente del periodo anterior, ya cerrado.
        // Sirve para validar que el scoping por expediente_id no colisiona
        // con documentos de expedientes anteriores del mismo alumno.
        expedienteAnteriorMismoAlumno = entityManager.persistAndFlush(
                Expediente.builder()
                        .alumno(alumnoA)
                        .fechaApertura(LocalDate.of(2025, 1, 1))
                        .periodoLectivo("2025")
                        .estado(EstadoExpediente.INACTIVO)
                        .build());

        tipoPep = entityManager.persistAndFlush(TipoDocumento.builder()
                .nombre("PEP").esObligatorio(true).esVersionable(true)
                .esPeriodico(false).esPredefinido(true).build());
        tipoIb = entityManager.persistAndFlush(TipoDocumento.builder()
                .nombre("IB").esObligatorio(true).esVersionable(false)
                .esPeriodico(true).periodicidad("BIMESTRAL").esPredefinido(true).build());
    }

    private Alumno crearAlumno(String nombre) {
        return Alumno.builder()
                .nombre(nombre).apellido("Test")
                .fechaNacimiento(LocalDate.of(2015, 1, 1))
                .grado("3ro").seccion("A")
                .estado(EstadoAlumno.ACTIVO)
                .build();
    }

    private Expediente crearExpediente(Alumno alumno, String periodo) {
        return Expediente.builder()
                .alumno(alumno)
                .fechaApertura(LocalDate.now())
                .periodoLectivo(periodo)
                .estado(EstadoExpediente.ACTIVO)
                .build();
    }

    private EntradaExpediente crearEntrada(Expediente exp) {
        return entityManager.persistAndFlush(EntradaExpediente.builder()
                .expediente(exp)
                .tipoEntrada(TipoEntrada.DOCUMENTO_ADJUNTADO)
                .usuario(autor)
                .fecha(LocalDateTime.now())
                .descripcion("subida documento")
                .build());
    }

    private ArchivoAdjunto crearArchivo() {
        return entityManager.persistAndFlush(ArchivoAdjunto.builder()
                .nombreOriginal("doc.pdf")
                .mimeType("application/pdf")
                .tamano(1024L)
                .rutaAlmacenamiento("expedientes/" + UUID.randomUUID() + ".pdf")
                .fechaSubida(LocalDateTime.now())
                .build());
    }

    private DocumentoExpediente crearDocumento(
            Expediente exp, TipoDocumento tipo, String periodo,
            Integer version, EstadoDocumento estado, LocalDateTime fechaSubida) {
        EntradaExpediente entrada = crearEntrada(exp);
        ArchivoAdjunto archivo = crearArchivo();
        return entityManager.persistAndFlush(DocumentoExpediente.builder()
                .entrada(entrada)
                .tipoDocumento(tipo)
                .archivo(archivo)
                .titulo("doc " + tipo.getNombre() + " v" + (version == null ? "?" : version))
                .periodo(periodo)
                .version(version)
                .fechaEmision(LocalDate.now())
                .fechaSubida(fechaSubida)
                .usuarioSubido(autor)
                .estado(estado)
                .build());
    }

    // ---------- findByExpedienteId ----------

    @Test
    void findByExpedienteIdOrdenaPorFechaSubidaDesc() {
        crearDocumento(expedienteA, tipoPep, null, 1, EstadoDocumento.ARCHIVADO,
                LocalDateTime.of(2026, 1, 15, 10, 0));
        crearDocumento(expedienteA, tipoPep, null, 2, EstadoDocumento.VIGENTE,
                LocalDateTime.of(2026, 3, 20, 10, 0));
        crearDocumento(expedienteA, tipoIb, "I Bimestre", null, EstadoDocumento.VIGENTE,
                LocalDateTime.of(2026, 2, 28, 10, 0));

        List<DocumentoExpediente> result = documentoRepository.findByExpedienteId(expedienteA.getId());

        assertThat(result).hasSize(3);
        assertThat(result.get(0).getFechaSubida()).isEqualTo(LocalDateTime.of(2026, 3, 20, 10, 0));
        assertThat(result.get(2).getFechaSubida()).isEqualTo(LocalDateTime.of(2026, 1, 15, 10, 0));
    }

    @Test
    void findByExpedienteIdNoIncluyeOtrosExpedientes() {
        crearDocumento(expedienteA, tipoPep, null, 1, EstadoDocumento.VIGENTE, LocalDateTime.now());
        crearDocumento(expedienteB, tipoPep, null, 1, EstadoDocumento.VIGENTE, LocalDateTime.now());

        List<DocumentoExpediente> result = documentoRepository.findByExpedienteId(expedienteA.getId());

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEntrada().getExpediente().getId()).isEqualTo(expedienteA.getId());
    }

    @Test
    void findByExpedienteIdNoIncluyeOtroExpedienteDelMismoAlumno() {
        // Mismo alumno tiene PEP en el expediente cerrado 2025 y en el vigente 2026.
        // El listado del expediente vigente solo debe traer el de 2026.
        crearDocumento(expedienteAnteriorMismoAlumno, tipoPep, null, 1,
                EstadoDocumento.VIGENTE, LocalDateTime.of(2025, 1, 15, 10, 0));
        crearDocumento(expedienteA, tipoPep, null, 1,
                EstadoDocumento.VIGENTE, LocalDateTime.of(2026, 1, 15, 10, 0));

        List<DocumentoExpediente> result = documentoRepository.findByExpedienteId(expedienteA.getId());

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEntrada().getExpediente().getId()).isEqualTo(expedienteA.getId());
        assertThat(result.get(0).getFechaSubida().getYear()).isEqualTo(2026);
    }

    // ---------- findByExpedienteTipoPeriodoYEstado ----------

    @Test
    void findByExpedienteTipoPeriodoYEstadoEncuentraVigenteConPeriodo() {
        crearDocumento(expedienteA, tipoIb, "I Bimestre", null, EstadoDocumento.VIGENTE, LocalDateTime.now());
        crearDocumento(expedienteA, tipoIb, "II Bimestre", null, EstadoDocumento.VIGENTE, LocalDateTime.now());

        Optional<DocumentoExpediente> result = documentoRepository
                .findByExpedienteTipoPeriodoYEstado(
                        expedienteA.getId(), tipoIb.getId(), "I Bimestre", EstadoDocumento.VIGENTE);

        assertThat(result).isPresent();
        assertThat(result.get().getPeriodo()).isEqualTo("I Bimestre");
    }

    @Test
    void findByExpedienteTipoPeriodoYEstadoFiltraPorEstado() {
        crearDocumento(expedienteA, tipoIb, "I Bimestre", null, EstadoDocumento.ARCHIVADO, LocalDateTime.now());

        Optional<DocumentoExpediente> result = documentoRepository
                .findByExpedienteTipoPeriodoYEstado(
                        expedienteA.getId(), tipoIb.getId(), "I Bimestre", EstadoDocumento.VIGENTE);

        assertThat(result).isEmpty();
    }

    // ---------- findByExpedienteTipoSinPeriodoYEstado ----------

    @Test
    void findByExpedienteTipoSinPeriodoYEstadoEncuentraSoloLosNullos() {
        crearDocumento(expedienteA, tipoPep, null, 2, EstadoDocumento.VIGENTE, LocalDateTime.now());
        crearDocumento(expedienteA, tipoPep, null, 1, EstadoDocumento.ARCHIVADO, LocalDateTime.now());

        Optional<DocumentoExpediente> vigente = documentoRepository
                .findByExpedienteTipoSinPeriodoYEstado(
                        expedienteA.getId(), tipoPep.getId(), EstadoDocumento.VIGENTE);

        assertThat(vigente).isPresent();
        assertThat(vigente.get().getVersion()).isEqualTo(2);
    }

    @Test
    void findByExpedienteTipoSinPeriodoYEstadoNoIncluyeDeOtroExpediente() {
        crearDocumento(expedienteB, tipoPep, null, 1, EstadoDocumento.VIGENTE, LocalDateTime.now());

        Optional<DocumentoExpediente> result = documentoRepository
                .findByExpedienteTipoSinPeriodoYEstado(
                        expedienteA.getId(), tipoPep.getId(), EstadoDocumento.VIGENTE);

        assertThat(result).isEmpty();
    }

    @Test
    void findByExpedienteTipoSinPeriodoYEstadoNoColisionaEntreExpedientesDelMismoAlumno() {
        // Escenario clave para el versionado: el alumno tiene PEP vigente en
        // su expediente 2025 (cerrado) y otro PEP vigente en el 2026 (activo).
        // Buscar el vigente del 2026 NO debe encontrar el del 2025 — si no,
        // el versionado se rompe y Optional lanza NonUniqueResultException.
        crearDocumento(expedienteAnteriorMismoAlumno, tipoPep, null, 1,
                EstadoDocumento.VIGENTE, LocalDateTime.of(2025, 6, 1, 10, 0));
        DocumentoExpediente pep2026 = crearDocumento(
                expedienteA, tipoPep, null, 1,
                EstadoDocumento.VIGENTE, LocalDateTime.of(2026, 6, 1, 10, 0));

        Optional<DocumentoExpediente> result = documentoRepository
                .findByExpedienteTipoSinPeriodoYEstado(
                        expedienteA.getId(), tipoPep.getId(), EstadoDocumento.VIGENTE);

        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(pep2026.getId());
        assertThat(result.get().getEntrada().getExpediente().getId()).isEqualTo(expedienteA.getId());
    }
}
