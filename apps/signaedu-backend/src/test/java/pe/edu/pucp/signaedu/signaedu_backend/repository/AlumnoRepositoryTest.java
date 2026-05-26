package pe.edu.pucp.signaedu.signaedu_backend.repository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;
import pe.edu.pucp.signaedu.signaedu_backend.model.Alumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.PerfilDiscapacidadAuditiva;
import pe.edu.pucp.signaedu.signaedu_backend.model.Rol;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoAlumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoUsuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class AlumnoRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private AlumnoRepository alumnoRepository;

    private Rol rolDocente;
    private Usuario docente;

    @BeforeEach
    void setUp() {
        rolDocente = entityManager.persistAndFlush(Rol.builder().nombre(TipoRol.DOCENTE).build());
        docente = entityManager.persistAndFlush(Usuario.builder()
                .nombre("María").apellido("Torres")
                .correo("docente@signaedu.pe")
                .telefono("999111222")
                .passwordHash("hashed")
                .estado(EstadoUsuario.ACTIVO)
                .roles(new HashSet<>(Set.of(rolDocente)))
                .build());
    }

    private Alumno crearAlumno(String nombre) {
        return entityManager.persistAndFlush(Alumno.builder()
                .nombre(nombre).apellido("Test")
                .fechaNacimiento(LocalDate.of(2015, 1, 1))
                .grado("3ro").seccion("A")
                .estado(EstadoAlumno.ACTIVO)
                .build());
    }

    private void asignarDocente(Alumno alumno, Usuario doc) {
        alumno.getDocentes().add(doc);
        entityManager.persistAndFlush(alumno);
    }

    private void crearPerfilDiscapacidad(Alumno alumno) {
        entityManager.persistAndFlush(PerfilDiscapacidadAuditiva.builder()
                .alumno(alumno)
                .modoComunicacionPreferido("LSP")
                .build());
    }

    @Test
    void contarAsignadosSinPerfilDiscapacidad_cuentaSoloAsignadosSinPerfil() {
        Alumno conPerfil = crearAlumno("Carlos");
        Alumno sinPerfil1 = crearAlumno("Ana");
        Alumno sinPerfil2 = crearAlumno("Luis");
        asignarDocente(conPerfil, docente);
        asignarDocente(sinPerfil1, docente);
        asignarDocente(sinPerfil2, docente);
        crearPerfilDiscapacidad(conPerfil);

        long count = alumnoRepository.contarAsignadosSinPerfilDiscapacidad(docente.getId());

        assertThat(count).isEqualTo(2L);
    }

    @Test
    void contarAsignadosSinPerfilDiscapacidad_excluyeAlumnosConPerfil() {
        Alumno asignado = crearAlumno("Sofía");
        asignarDocente(asignado, docente);
        crearPerfilDiscapacidad(asignado);

        long count = alumnoRepository.contarAsignadosSinPerfilDiscapacidad(docente.getId());

        assertThat(count).isZero();
    }

    @Test
    void contarAsignadosSinPerfilDiscapacidad_noCuentaAlumnosDeOtroDocente() {
        Usuario otroDocente = entityManager.persistAndFlush(Usuario.builder()
                .nombre("José").apellido("Rivera")
                .correo("otro@signaedu.pe")
                .telefono("999333444")
                .passwordHash("hashed")
                .estado(EstadoUsuario.ACTIVO)
                .roles(new HashSet<>(Set.of(rolDocente)))
                .build());

        Alumno alumnoMio = crearAlumno("Mio");
        Alumno alumnoOtro = crearAlumno("Otro");
        asignarDocente(alumnoMio, docente);          // sin perfil
        asignarDocente(alumnoOtro, otroDocente);     // sin perfil tambien, pero de otro docente

        long count = alumnoRepository.contarAsignadosSinPerfilDiscapacidad(docente.getId());

        assertThat(count).isEqualTo(1L);
    }
}
