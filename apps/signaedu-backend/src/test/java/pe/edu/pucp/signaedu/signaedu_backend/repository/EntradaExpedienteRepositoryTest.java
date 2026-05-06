package pe.edu.pucp.signaedu.signaedu_backend.repository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.test.context.ActiveProfiles;
import pe.edu.pucp.signaedu.signaedu_backend.model.Alumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.EntradaExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.Expediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.Rol;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoAlumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoUsuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoEntrada;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;
import pe.edu.pucp.signaedu.signaedu_backend.repository.specs.EntradaExpedienteSpecs;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class EntradaExpedienteRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private EntradaExpedienteRepository entradaRepository;

    private Usuario autor;
    private Expediente expedienteA;
    private Expediente expedienteB;

    @BeforeEach
    void setUp() {
        Rol rolDocente = entityManager.persistAndFlush(
                Rol.builder().nombre(TipoRol.DOCENTE).build());

        autor = Usuario.builder()
                .nombre("María").apellido("Torres")
                .correo("docente@signaedu.pe")
                .telefono("999111222")
                .passwordHash("hashed")
                .estado(EstadoUsuario.ACTIVO)
                .roles(new HashSet<>(Set.of(rolDocente)))
                .build();
        autor = entityManager.persistAndFlush(autor);

        Alumno alumno = entityManager.persistAndFlush(crearAlumno("Carlos"));
        Alumno otroAlumno = entityManager.persistAndFlush(crearAlumno("Ana"));

        expedienteA = entityManager.persistAndFlush(crearExpediente(alumno, "2026"));
        expedienteB = entityManager.persistAndFlush(crearExpediente(otroAlumno, "2026"));
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

    private EntradaExpediente crearEntrada(Expediente expediente, TipoEntrada tipo, LocalDateTime fecha, String descripcion) {
        return entityManager.persistAndFlush(EntradaExpediente.builder()
                .expediente(expediente)
                .tipoEntrada(tipo)
                .usuario(autor)
                .fecha(fecha)
                .descripcion(descripcion)
                .build());
    }

    private List<EntradaExpediente> buscar(
            Long expedienteId, TipoEntrada tipo, LocalDateTime desde, LocalDateTime hasta) {
        Specification<EntradaExpediente> spec = Specification.allOf(
                EntradaExpedienteSpecs.delExpediente(expedienteId),
                EntradaExpedienteSpecs.conTipo(tipo),
                EntradaExpedienteSpecs.desde(desde),
                EntradaExpedienteSpecs.hasta(hasta)
        );
        return entradaRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "fecha"));
    }

    // ---------- Specs ----------

    @Test
    void buscarSinFiltrosDevuelveTodasOrdenadasPorFechaDesc() {
        crearEntrada(expedienteA, TipoEntrada.OBSERVACION_PEDAGOGICA,
                LocalDateTime.of(2026, 1, 5, 10, 0), "vieja");
        crearEntrada(expedienteA, TipoEntrada.APOYO_O_AJUSTE,
                LocalDateTime.of(2026, 3, 15, 10, 0), "nueva");
        crearEntrada(expedienteA, TipoEntrada.INCIDENCIA_COMUNICACION,
                LocalDateTime.of(2026, 2, 10, 10, 0), "media");

        List<EntradaExpediente> resultado = buscar(expedienteA.getId(), null, null, null);

        assertThat(resultado).hasSize(3);
        assertThat(resultado.get(0).getDescripcion()).isEqualTo("nueva");
        assertThat(resultado.get(1).getDescripcion()).isEqualTo("media");
        assertThat(resultado.get(2).getDescripcion()).isEqualTo("vieja");
    }

    @Test
    void buscarPorTipoFiltraCorrectamente() {
        crearEntrada(expedienteA, TipoEntrada.OBSERVACION_PEDAGOGICA, LocalDateTime.now(), "obs");
        crearEntrada(expedienteA, TipoEntrada.APOYO_O_AJUSTE, LocalDateTime.now(), "apoyo");
        crearEntrada(expedienteA, TipoEntrada.OBSERVACION_PEDAGOGICA, LocalDateTime.now(), "obs2");

        List<EntradaExpediente> resultado = buscar(
                expedienteA.getId(), TipoEntrada.OBSERVACION_PEDAGOGICA, null, null);

        assertThat(resultado).hasSize(2)
                .allMatch(e -> e.getTipoEntrada() == TipoEntrada.OBSERVACION_PEDAGOGICA);
    }

    @Test
    void buscarPorRangoFechasFiltraCorrectamente() {
        crearEntrada(expedienteA, TipoEntrada.OBSERVACION_PEDAGOGICA,
                LocalDateTime.of(2026, 1, 5, 10, 0), "enero");
        crearEntrada(expedienteA, TipoEntrada.OBSERVACION_PEDAGOGICA,
                LocalDateTime.of(2026, 3, 15, 10, 0), "marzo");
        crearEntrada(expedienteA, TipoEntrada.OBSERVACION_PEDAGOGICA,
                LocalDateTime.of(2026, 6, 1, 10, 0), "junio");

        List<EntradaExpediente> resultado = buscar(
                expedienteA.getId(), null,
                LocalDateTime.of(2026, 2, 1, 0, 0),
                LocalDateTime.of(2026, 4, 30, 23, 59));

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getDescripcion()).isEqualTo("marzo");
    }

    @Test
    void buscarCombinaFiltrosTipoYFecha() {
        crearEntrada(expedienteA, TipoEntrada.OBSERVACION_PEDAGOGICA,
                LocalDateTime.of(2026, 3, 1, 10, 0), "obs-marzo");
        crearEntrada(expedienteA, TipoEntrada.APOYO_O_AJUSTE,
                LocalDateTime.of(2026, 3, 1, 10, 0), "apoyo-marzo");
        crearEntrada(expedienteA, TipoEntrada.OBSERVACION_PEDAGOGICA,
                LocalDateTime.of(2026, 1, 1, 10, 0), "obs-enero");

        List<EntradaExpediente> resultado = buscar(
                expedienteA.getId(), TipoEntrada.OBSERVACION_PEDAGOGICA,
                LocalDateTime.of(2026, 2, 1, 0, 0), null);

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getDescripcion()).isEqualTo("obs-marzo");
    }

    @Test
    void buscarNoIncluyeEntradasDeOtroExpediente() {
        crearEntrada(expedienteA, TipoEntrada.OBSERVACION_PEDAGOGICA, LocalDateTime.now(), "del-A");
        crearEntrada(expedienteB, TipoEntrada.OBSERVACION_PEDAGOGICA, LocalDateTime.now(), "del-B");

        List<EntradaExpediente> resultado = buscar(expedienteA.getId(), null, null, null);

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getDescripcion()).isEqualTo("del-A");
    }
}
