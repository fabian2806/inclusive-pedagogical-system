package pe.edu.pucp.signaedu.signaedu_backend.repository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.test.context.ActiveProfiles;
import pe.edu.pucp.signaedu.signaedu_backend.model.Indicador;
import pe.edu.pucp.signaedu.signaedu_backend.model.Rol;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.AreaCurricular;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoUsuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;
import pe.edu.pucp.signaedu.signaedu_backend.repository.specs.IndicadorSpecs;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class IndicadorRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private IndicadorRepository indicadorRepository;

    private Usuario creador;

    @BeforeEach
    void setUp() {
        Rol rolDocente = entityManager.persistAndFlush(
                Rol.builder().nombre(TipoRol.DOCENTE).build());

        creador = entityManager.persistAndFlush(Usuario.builder()
                .nombre("Docente").apellido("Test")
                .correo("docente@signaedu.pe")
                .telefono("999111222")
                .passwordHash("h")
                .estado(EstadoUsuario.ACTIVO)
                .roles(new HashSet<>(Set.of(rolDocente)))
                .build());
    }

    private Indicador persistIndicador(
            String nombre, String descripcion, AreaCurricular area, boolean activo) {
        return entityManager.persistAndFlush(Indicador.builder()
                .nombre(nombre)
                .descripcion(descripcion)
                .categoria("cat")
                .areaCurricular(area)
                .usuarioCreador(creador)
                .activo(activo)
                .build());
    }

    private List<Indicador> buscar(AreaCurricular area, String q, Boolean activo) {
        Specification<Indicador> spec = Specification.allOf(
                IndicadorSpecs.conAreaCurricular(area),
                IndicadorSpecs.conQuery(q),
                IndicadorSpecs.conActivo(activo)
        );
        return indicadorRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "nombre"));
    }

    // ---------- Specs ----------

    @Test
    void findAllSinFiltrosDevuelveTodosOrdenadosPorNombreAsc() {
        persistIndicador("Zeta", "z", AreaCurricular.COMUNICACION, true);
        persistIndicador("Alfa", "a", AreaCurricular.MATEMATICA, true);
        persistIndicador("Mu",   "m", AreaCurricular.OTRO, false);

        List<Indicador> resultado = buscar(null, null, null);

        assertThat(resultado).hasSize(3);
        assertThat(resultado.get(0).getNombre()).isEqualTo("Alfa");
        assertThat(resultado.get(1).getNombre()).isEqualTo("Mu");
        assertThat(resultado.get(2).getNombre()).isEqualTo("Zeta");
    }

    @Test
    void filtraPorAreaCurricular() {
        persistIndicador("Indicador A", "x", AreaCurricular.COMUNICACION, true);
        persistIndicador("Indicador B", "y", AreaCurricular.MATEMATICA, true);
        persistIndicador("Indicador C", "z", AreaCurricular.COMUNICACION, true);

        List<Indicador> resultado = buscar(AreaCurricular.COMUNICACION, null, null);

        assertThat(resultado).hasSize(2)
                .allMatch(i -> i.getAreaCurricular() == AreaCurricular.COMUNICACION);
    }

    @Test
    void filtraPorActivoTrueExcluyeInactivos() {
        persistIndicador("Activo 1", "x", AreaCurricular.COMUNICACION, true);
        persistIndicador("Inactivo 1", "y", AreaCurricular.COMUNICACION, false);
        persistIndicador("Activo 2", "z", AreaCurricular.MATEMATICA, true);

        List<Indicador> resultado = buscar(null, null, true);

        assertThat(resultado).hasSize(2)
                .allMatch(Indicador::getActivo);
    }

    @Test
    void buscaCaseInsensitiveEnNombreYDescripcion() {
        persistIndicador("Comprensión LSP", "Lengua de señas peruana", AreaCurricular.COMUNICACION, true);
        persistIndicador("Operaciones básicas", "matemática elemental", AreaCurricular.MATEMATICA, true);
        persistIndicador("Otro indicador", null, AreaCurricular.OTRO, true);  // descripcion null no rompe

        List<Indicador> matchesPorNombre = buscar(null, "lsp", null);
        List<Indicador> matchesPorDescripcion = buscar(null, "señas", null);
        List<Indicador> matchesCaseInsensitive = buscar(null, "MATEMÁTICA", null);

        assertThat(matchesPorNombre).hasSize(1)
                .first().extracting(Indicador::getNombre).isEqualTo("Comprensión LSP");
        assertThat(matchesPorDescripcion).hasSize(1)
                .first().extracting(Indicador::getNombre).isEqualTo("Comprensión LSP");
        assertThat(matchesCaseInsensitive).hasSize(1)
                .first().extracting(Indicador::getNombre).isEqualTo("Operaciones básicas");
    }
}
