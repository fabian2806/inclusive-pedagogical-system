package pe.edu.pucp.signaedu.signaedu_backend.repository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;
import pe.edu.pucp.signaedu.signaedu_backend.model.Alumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.Expediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoAlumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoExpediente;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@ActiveProfiles("test")
class ExpedienteRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ExpedienteRepository expedienteRepository;

    private Alumno crearAlumno(String nombre) {
        Alumno alumno = Alumno.builder()
                .nombre(nombre)
                .apellido("Test")
                .fechaNacimiento(LocalDate.of(2015, 1, 1))
                .grado("3ro")
                .seccion("A")
                .estado(EstadoAlumno.ACTIVO)
                .build();
        return entityManager.persistAndFlush(alumno);
    }

    private Expediente crearExpediente(Alumno alumno, String periodo, EstadoExpediente estado) {
        Expediente expediente = Expediente.builder()
                .alumno(alumno)
                .fechaApertura(LocalDate.now())
                .periodoLectivo(periodo)
                .estado(estado)
                .build();
        return entityManager.persistAndFlush(expediente);
    }

    @Test
    void debeEncontrarExpedientesPorPeriodoYEstado() {
        Alumno alumno1 = crearAlumno("Carlos");
        Alumno alumno2 = crearAlumno("Ana");
        crearExpediente(alumno1, "2026", EstadoExpediente.ACTIVO);
        crearExpediente(alumno2, "2026", EstadoExpediente.INACTIVO);

        List<Expediente> activos = expedienteRepository
                .findByPeriodoLectivoAndEstado("2026", EstadoExpediente.ACTIVO);

        assertThat(activos).hasSize(1);
        assertThat(activos.get(0).getAlumno().getNombre()).isEqualTo("Carlos");
    }

    @Test
    void debeValidarUnicidadAlumnoPeriodo() {
        Alumno alumno = crearAlumno("Carlos");
        crearExpediente(alumno, "2026", EstadoExpediente.ACTIVO);

        // Intentar crear otro expediente para el mismo alumno y periodo
        Expediente duplicado = Expediente.builder()
                .alumno(alumno)
                .fechaApertura(LocalDate.now())
                .periodoLectivo("2026")
                .estado(EstadoExpediente.ACTIVO)
                .build();

        assertThatThrownBy(() -> {
            entityManager.persistAndFlush(duplicado);
        }).isInstanceOf(Exception.class);
    }
}
