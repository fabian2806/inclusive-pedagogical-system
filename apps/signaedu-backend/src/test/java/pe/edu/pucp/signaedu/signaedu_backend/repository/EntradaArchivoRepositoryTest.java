package pe.edu.pucp.signaedu.signaedu_backend.repository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;
import pe.edu.pucp.signaedu.signaedu_backend.model.Alumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.ArchivoAdjunto;
import pe.edu.pucp.signaedu.signaedu_backend.model.EntradaArchivo;
import pe.edu.pucp.signaedu.signaedu_backend.model.EntradaExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.Expediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.Rol;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoAlumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoUsuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoEntrada;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class EntradaArchivoRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private EntradaArchivoRepository entradaArchivoRepository;

    private Usuario autor;
    private EntradaExpediente entradaA;
    private EntradaExpediente entradaB;

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

        Alumno alumno = entityManager.persistAndFlush(Alumno.builder()
                .nombre("Sofía").apellido("Test")
                .fechaNacimiento(LocalDate.of(2015, 1, 1))
                .grado("3ro").seccion("A")
                .estado(EstadoAlumno.ACTIVO).build());

        Expediente expediente = entityManager.persistAndFlush(Expediente.builder()
                .alumno(alumno)
                .fechaApertura(LocalDate.now())
                .periodoLectivo("2026")
                .estado(EstadoExpediente.ACTIVO).build());

        entradaA = crearEntrada(expediente);
        entradaB = crearEntrada(expediente);
    }

    private EntradaExpediente crearEntrada(Expediente expediente) {
        return entityManager.persistAndFlush(EntradaExpediente.builder()
                .expediente(expediente)
                .tipoEntrada(TipoEntrada.OBSERVACION_PEDAGOGICA)
                .usuario(autor)
                .fecha(LocalDateTime.now())
                .descripcion("entrada de prueba")
                .build());
    }

    private EntradaArchivo crearArchivo(EntradaExpediente entrada, LocalDateTime fechaSubida) {
        ArchivoAdjunto archivo = entityManager.persistAndFlush(ArchivoAdjunto.builder()
                .nombreOriginal("foto.jpg")
                .mimeType("image/jpeg")
                .tamano(2048L)
                .rutaAlmacenamiento("expedientes/" + UUID.randomUUID() + ".jpg")
                .fechaSubida(fechaSubida)
                .build());
        return entityManager.persistAndFlush(EntradaArchivo.builder()
                .entrada(entrada)
                .archivo(archivo)
                .descripcion("nota")
                .usuarioSubido(autor)
                .fechaSubida(fechaSubida)
                .build());
    }

    @Test
    void findByEntradaIdDevuelveLosArchivosOrdenadosAsc() {
        crearArchivo(entradaA, LocalDateTime.of(2026, 3, 1, 10, 0));
        crearArchivo(entradaA, LocalDateTime.of(2026, 1, 15, 10, 0));
        crearArchivo(entradaA, LocalDateTime.of(2026, 2, 10, 10, 0));

        List<EntradaArchivo> result = entradaArchivoRepository
                .findByEntrada_IdOrderByFechaSubidaAsc(entradaA.getId());

        assertThat(result).hasSize(3);
        assertThat(result.get(0).getFechaSubida()).isEqualTo(LocalDateTime.of(2026, 1, 15, 10, 0));
        assertThat(result.get(2).getFechaSubida()).isEqualTo(LocalDateTime.of(2026, 3, 1, 10, 0));
    }

    @Test
    void findByEntradaIdNoIncluyeArchivosDeOtraEntrada() {
        crearArchivo(entradaA, LocalDateTime.now());
        crearArchivo(entradaB, LocalDateTime.now());

        List<EntradaArchivo> result = entradaArchivoRepository
                .findByEntrada_IdOrderByFechaSubidaAsc(entradaA.getId());

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEntrada().getId()).isEqualTo(entradaA.getId());
    }

    @Test
    void findByEntradaIdDevuelveListaVaciaSiNoHayArchivos() {
        List<EntradaArchivo> result = entradaArchivoRepository
                .findByEntrada_IdOrderByFechaSubidaAsc(entradaA.getId());

        assertThat(result).isEmpty();
    }
}
