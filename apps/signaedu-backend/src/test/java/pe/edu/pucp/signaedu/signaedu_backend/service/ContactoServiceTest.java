package pe.edu.pucp.signaedu.signaedu_backend.service;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.ContactoResponse;
import pe.edu.pucp.signaedu.signaedu_backend.mapper.ContactoMapper;
import pe.edu.pucp.signaedu.signaedu_backend.model.Alumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.Rol;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoAlumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoUsuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;
import pe.edu.pucp.signaedu.signaedu_backend.repository.AlumnoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.UsuarioRepository;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ContactoServiceTest {

    private static final Long ALUMNO_ID = 1L;
    private static final Long DOCENTE_ID = 10L;
    private static final Long PADRE_ID = 20L;
    private static final Long SAANEE_ID = 30L;
    private static final String CORREO = "user@signaedu.pe";

    @Mock private AlumnoRepository alumnoRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private ContactoMapper contactoMapper;

    @InjectMocks
    private ContactoService contactoService;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.getContext().setAuthentication(
                new TestingAuthenticationToken(CORREO, "x"));
        lenient().when(contactoMapper.toResponse(any(Usuario.class), any(TipoRol.class)))
                .thenAnswer(inv -> {
                    Usuario u = inv.getArgument(0);
                    TipoRol rol = inv.getArgument(1);
                    return ContactoResponse.builder()
                            .usuarioId(u.getId())
                            .rol(rol.name())
                            .nombre(u.getNombre())
                            .apellido(u.getApellido())
                            .correo(u.getCorreo())
                            .telefono(u.getTelefono())
                            .build();
                });
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private Usuario usuario(Long id, String nombre, String apellido, TipoRol tipo) {
        Rol rol = Rol.builder().id((long) tipo.ordinal() + 1).nombre(tipo).build();
        return Usuario.builder()
                .id(id).nombre(nombre).apellido(apellido)
                .correo(nombre.toLowerCase() + "@signaedu.pe").passwordHash("hash")
                .estado(EstadoUsuario.ACTIVO)
                .roles(new HashSet<>(Set.of(rol)))
                .build();
    }

    private Alumno alumnoConContactos(Set<Usuario> docentes, Set<Usuario> padres) {
        return Alumno.builder()
                .id(ALUMNO_ID).nombre("Sofia").apellido("Rodriguez")
                .fechaNacimiento(LocalDate.of(2015, 1, 1))
                .grado("3ro").seccion("A")
                .estado(EstadoAlumno.ACTIVO)
                .docentes(docentes)
                .padres(padres)
                .build();
    }

    // ============ obtenerContactosDelAlumno ============

    @Test
    void obtenerContactosDelAlumno_docenteAsignado_veDocentesYPadres() {
        Usuario solicitante = usuario(DOCENTE_ID, "Maria", "Castro", TipoRol.DOCENTE);
        Usuario padre1 = usuario(PADRE_ID, "Laura", "Diaz", TipoRol.PADRE);
        when(usuarioRepository.findByCorreo(CORREO)).thenReturn(Optional.of(solicitante));
        when(alumnoRepository.findById(ALUMNO_ID))
                .thenReturn(Optional.of(alumnoConContactos(Set.of(solicitante), Set.of(padre1))));
        when(alumnoRepository.existsByIdAndDocentesId(ALUMNO_ID, DOCENTE_ID)).thenReturn(true);

        List<ContactoResponse> contactos = contactoService.obtenerContactosDelAlumno(ALUMNO_ID);

        assertThat(contactos).hasSize(2);
        assertThat(contactos).extracting(ContactoResponse::getRol)
                .containsExactlyInAnyOrder(TipoRol.DOCENTE.name(), TipoRol.PADRE.name());
    }

    @Test
    void obtenerContactosDelAlumno_docenteNoAsignado_lanzaAccessDenied() {
        Usuario solicitante = usuario(DOCENTE_ID, "Maria", "Castro", TipoRol.DOCENTE);
        when(usuarioRepository.findByCorreo(CORREO)).thenReturn(Optional.of(solicitante));
        when(alumnoRepository.findById(ALUMNO_ID))
                .thenReturn(Optional.of(alumnoConContactos(Set.of(), Set.of())));
        when(alumnoRepository.existsByIdAndDocentesId(ALUMNO_ID, DOCENTE_ID)).thenReturn(false);

        assertThatThrownBy(() -> contactoService.obtenerContactosDelAlumno(ALUMNO_ID))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void obtenerContactosDelAlumno_padreSoloVeContactosDeSuHijo() {
        Usuario solicitante = usuario(PADRE_ID, "Laura", "Diaz", TipoRol.PADRE);
        when(usuarioRepository.findByCorreo(CORREO)).thenReturn(Optional.of(solicitante));
        when(alumnoRepository.findById(ALUMNO_ID))
                .thenReturn(Optional.of(alumnoConContactos(Set.of(), Set.of(solicitante))));
        when(alumnoRepository.existsByIdAndPadresId(ALUMNO_ID, PADRE_ID)).thenReturn(true);

        List<ContactoResponse> contactos = contactoService.obtenerContactosDelAlumno(ALUMNO_ID);

        assertThat(contactos).isNotEmpty();
    }

    @Test
    void obtenerContactosDelAlumno_saaneePuedeAccederACualquierAlumno() {
        Usuario solicitante = usuario(SAANEE_ID, "Roberto", "Quispe", TipoRol.SAANEE);
        when(usuarioRepository.findByCorreo(CORREO)).thenReturn(Optional.of(solicitante));
        when(alumnoRepository.findById(ALUMNO_ID))
                .thenReturn(Optional.of(alumnoConContactos(Set.of(), Set.of())));

        // SAANEE no requiere validar la tabla intermedia (regla de sistema:
        // SAANEE es transversal).
        List<ContactoResponse> contactos = contactoService.obtenerContactosDelAlumno(ALUMNO_ID);

        assertThat(contactos).isNotNull();
    }

    // ============ listarSaaneeActivos ============

    @Test
    void listarSaaneeActivos_retornaSoloSaaneeActivosOrdenadosPorApellido() {
        Usuario quispe = usuario(30L, "Roberto", "Quispe", TipoRol.SAANEE);
        Usuario flores = usuario(31L, "Ana", "Flores", TipoRol.SAANEE);
        when(usuarioRepository.findByRoles_NombreAndEstado(TipoRol.SAANEE, EstadoUsuario.ACTIVO))
                .thenReturn(List.of(quispe, flores));

        List<ContactoResponse> contactos = contactoService.listarSaaneeActivos();

        assertThat(contactos).hasSize(2);
        // Ordenamiento por apellido: Flores (F) antes que Quispe (Q).
        assertThat(contactos.get(0).getApellido()).isEqualTo("Flores");
        assertThat(contactos.get(1).getApellido()).isEqualTo("Quispe");
        // Todos los retornados tienen rol SAANEE.
        assertThat(contactos).allMatch(c -> TipoRol.SAANEE.name().equals(c.getRol()));
    }
}
