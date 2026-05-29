package pe.edu.pucp.signaedu.signaedu_backend.repository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.test.context.ActiveProfiles;
import pe.edu.pucp.signaedu.signaedu_backend.model.Alumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.EntradaExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.Evento;
import pe.edu.pucp.signaedu.signaedu_backend.model.Expediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.Rol;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoAlumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoEvento;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoUsuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.ModalidadEvento;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoEntrada;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoEvento;
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

    private Rol rolDocente;
    private Rol rolPadre;
    private Usuario autor;
    private Alumno alumnoA;
    private Alumno alumnoB;
    private Expediente expedienteA;
    private Expediente expedienteB;

    @BeforeEach
    void setUp() {
        rolDocente = entityManager.persistAndFlush(Rol.builder().nombre(TipoRol.DOCENTE).build());
        rolPadre = entityManager.persistAndFlush(Rol.builder().nombre(TipoRol.PADRE).build());

        autor = Usuario.builder()
                .nombre("María").apellido("Torres")
                .correo("docente@signaedu.pe")
                .telefono("999111222")
                .passwordHash("hashed")
                .estado(EstadoUsuario.ACTIVO)
                .roles(new HashSet<>(Set.of(rolDocente)))
                .build();
        autor = entityManager.persistAndFlush(autor);

        alumnoA = entityManager.persistAndFlush(crearAlumno("Carlos"));
        alumnoB = entityManager.persistAndFlush(crearAlumno("Ana"));

        expedienteA = entityManager.persistAndFlush(crearExpediente(alumnoA, "2026"));
        expedienteB = entityManager.persistAndFlush(crearExpediente(alumnoB, "2026"));
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

    // ---------- Queries de dashboard (Fase 3) ----------

    private Usuario crearUsuario(String correo, TipoRol rol) {
        Rol rolEntity = switch (rol) {
            case DOCENTE -> rolDocente;
            case PADRE -> rolPadre;
            default -> throw new IllegalArgumentException("Rol no soportado en este helper: " + rol);
        };
        return entityManager.persistAndFlush(Usuario.builder()
                .nombre("Test").apellido("User")
                .correo(correo)
                .telefono("999000000")
                .passwordHash("hashed")
                .estado(EstadoUsuario.ACTIVO)
                .roles(new HashSet<>(Set.of(rolEntity)))
                .build());
    }

    private void asignarDocente(Alumno alumno, Usuario docente) {
        alumno.getDocentes().add(docente);
        entityManager.persistAndFlush(alumno);
    }

    private void asignarPadre(Alumno alumno, Usuario padre) {
        alumno.getPadres().add(padre);
        entityManager.persistAndFlush(alumno);
    }

    @Test
    void contarEntradasDesdeFechaParaDocente_cuentaSoloEnAlumnosAsignados() {
        Usuario docente2 = crearUsuario("docente2@signaedu.pe", TipoRol.DOCENTE);
        asignarDocente(alumnoA, docente2);          // alumnoA → docente2
        // alumnoB queda sin asignar a docente2

        crearEntrada(expedienteA, TipoEntrada.OBSERVACION_PEDAGOGICA, LocalDateTime.now(), "asignado");
        crearEntrada(expedienteB, TipoEntrada.OBSERVACION_PEDAGOGICA, LocalDateTime.now(), "no-asignado");

        long count = entradaRepository.contarEntradasDesdeFechaParaDocente(
                docente2.getId(), LocalDate.now().atStartOfDay());

        assertThat(count).isEqualTo(1L);
    }

    @Test
    void contarEntradasDesdeFechaParaDocente_excluyeAnterioresAlDesde() {
        Usuario docente2 = crearUsuario("docente2@signaedu.pe", TipoRol.DOCENTE);
        asignarDocente(alumnoA, docente2);

        crearEntrada(expedienteA, TipoEntrada.OBSERVACION_PEDAGOGICA,
                LocalDate.now().minusDays(1).atTime(23, 59), "ayer");
        crearEntrada(expedienteA, TipoEntrada.APOYO_O_AJUSTE,
                LocalDate.now().atTime(8, 0), "hoy");

        long count = entradaRepository.contarEntradasDesdeFechaParaDocente(
                docente2.getId(), LocalDate.now().atStartOfDay());

        assertThat(count).isEqualTo(1L);
    }

    @Test
    void contarEntradasDesdeFechaParaPadre_cuentaSoloEnHijos() {
        Usuario padre = crearUsuario("padre@signaedu.pe", TipoRol.PADRE);
        asignarPadre(alumnoA, padre);               // alumnoA es hijo del padre
        // alumnoB no es hijo

        crearEntrada(expedienteA, TipoEntrada.COMUNICACION_FAMILIAR, LocalDateTime.now(), "del-hijo");
        crearEntrada(expedienteB, TipoEntrada.COMUNICACION_FAMILIAR, LocalDateTime.now(), "no-hijo");

        long count = entradaRepository.contarEntradasDesdeFechaParaPadre(
                padre.getId(), LocalDate.now().atStartOfDay());

        assertThat(count).isEqualTo(1L);
    }

    @Test
    void obtenerActividadRecienteDeDocente_ordenaPorFechaDesc() {
        Usuario docente2 = crearUsuario("docente2@signaedu.pe", TipoRol.DOCENTE);
        asignarDocente(alumnoA, docente2);

        crearEntrada(expedienteA, TipoEntrada.OBSERVACION_PEDAGOGICA,
                LocalDateTime.of(2026, 5, 25, 9, 0), "vieja");
        crearEntrada(expedienteA, TipoEntrada.APOYO_O_AJUSTE,
                LocalDateTime.of(2026, 5, 25, 15, 0), "nueva");
        crearEntrada(expedienteA, TipoEntrada.INCIDENCIA_COMUNICACION,
                LocalDateTime.of(2026, 5, 25, 12, 0), "media");

        List<EntradaExpediente> resultado = entradaRepository
                .obtenerActividadRecienteDeDocente(docente2.getId(), PageRequest.of(0, 10));

        assertThat(resultado).hasSize(3);
        assertThat(resultado.get(0).getDescripcion()).isEqualTo("nueva");
        assertThat(resultado.get(1).getDescripcion()).isEqualTo("media");
        assertThat(resultado.get(2).getDescripcion()).isEqualTo("vieja");
    }

    @Test
    void obtenerActividadRecienteDeDocente_respetaLimitePageable() {
        Usuario docente2 = crearUsuario("docente2@signaedu.pe", TipoRol.DOCENTE);
        asignarDocente(alumnoA, docente2);

        for (int i = 1; i <= 7; i++) {
            crearEntrada(expedienteA, TipoEntrada.OBSERVACION_PEDAGOGICA,
                    LocalDateTime.of(2026, 5, 25, i, 0), "entrada-" + i);
        }

        List<EntradaExpediente> resultado = entradaRepository
                .obtenerActividadRecienteDeDocente(docente2.getId(), PageRequest.of(0, 3));

        assertThat(resultado).hasSize(3);
    }

    @Test
    void obtenerActividadRecienteDeDocente_excluyeAlumnosDeOtroDocente() {
        Usuario docente2 = crearUsuario("docente2@signaedu.pe", TipoRol.DOCENTE);
        Usuario otroDocente = crearUsuario("otro@signaedu.pe", TipoRol.DOCENTE);
        asignarDocente(alumnoA, docente2);
        asignarDocente(alumnoB, otroDocente);

        crearEntrada(expedienteA, TipoEntrada.OBSERVACION_PEDAGOGICA, LocalDateTime.now(), "del-mio");
        crearEntrada(expedienteB, TipoEntrada.OBSERVACION_PEDAGOGICA, LocalDateTime.now(), "del-otro");

        List<EntradaExpediente> resultado = entradaRepository
                .obtenerActividadRecienteDeDocente(docente2.getId(), PageRequest.of(0, 10));

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getDescripcion()).isEqualTo("del-mio");
    }

    // ============ Fase 4: queries de evento_id ============

    @Test
    void existsByEvento_IdAndTipoEntrada_retornaTrueCuandoExisteEntradaVinculada() {
        Evento evento = crearEvento();
        crearEntradaVinculadaAEvento(expedienteA, TipoEntrada.EVENTO_AGENDA, evento, "Resultado registrado");

        boolean existe = entradaRepository.existsByEvento_IdAndTipoEntrada(
                evento.getId(), TipoEntrada.EVENTO_AGENDA);

        assertThat(existe).isTrue();
    }

    @Test
    void existsByEvento_IdAndTipoEntrada_retornaFalseCuandoNoHayEntradaVinculada() {
        Evento evento = crearEvento();
        // Hay una entrada del expediente pero sin evento_id.
        crearEntrada(expedienteA, TipoEntrada.OBSERVACION_PEDAGOGICA, LocalDateTime.now(), "no vinculada");

        boolean existe = entradaRepository.existsByEvento_IdAndTipoEntrada(
                evento.getId(), TipoEntrada.EVENTO_AGENDA);

        assertThat(existe).isFalse();
    }

    @Test
    void findFirstByEvento_IdAndTipoEntrada_retornaLaEntradaDeResultadoCuandoExiste() {
        Evento evento = crearEvento();
        EntradaExpediente esperada = crearEntradaVinculadaAEvento(
                expedienteA, TipoEntrada.EVENTO_AGENDA, evento, "El resultado");

        java.util.Optional<EntradaExpediente> resultado = entradaRepository
                .findFirstByEvento_IdAndTipoEntrada(evento.getId(), TipoEntrada.EVENTO_AGENDA);

        assertThat(resultado).isPresent();
        assertThat(resultado.get().getId()).isEqualTo(esperada.getId());
        assertThat(resultado.get().getDescripcion()).isEqualTo("El resultado");
    }

    private Evento crearEvento() {
        return entityManager.persistAndFlush(Evento.builder()
                .titulo("Reunion")
                .fechaInicio(LocalDateTime.now().plusDays(1))
                .fechaFin(LocalDateTime.now().plusDays(1).plusHours(1))
                .tipoEvento(TipoEvento.REUNION_PADRES)
                .modalidad(ModalidadEvento.PRESENCIAL)
                .estado(EstadoEvento.ACTIVO)
                .alumno(alumnoA)
                .usuarioCreador(autor)
                .fechaCreacion(LocalDateTime.now())
                .build());
    }

    private EntradaExpediente crearEntradaVinculadaAEvento(
            Expediente expediente, TipoEntrada tipo, Evento evento, String descripcion) {
        return entityManager.persistAndFlush(EntradaExpediente.builder()
                .expediente(expediente)
                .tipoEntrada(tipo)
                .usuario(autor)
                .fecha(LocalDateTime.now())
                .descripcion(descripcion)
                .evento(evento)
                .build());
    }
}
