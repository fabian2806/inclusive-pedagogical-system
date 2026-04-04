package pe.edu.pucp.signaedu.signaedu_backend.model;

import jakarta.persistence.*;
import lombok.*;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoAlumno;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "alumno")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Alumno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String apellido;

    @Column(name = "id_foto_perfil")
    private Long idFotoPerfil;

    @Column(name = "fecha_nacimiento", nullable = false)
    private LocalDate fechaNacimiento;

    @Column(nullable = false)
    private String grado;

    @Column(nullable = false)
    private String seccion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EstadoAlumno estado = EstadoAlumno.ACTIVO;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "docente_alumno",
            joinColumns = @JoinColumn(name = "alumno_id"),
            inverseJoinColumns = @JoinColumn(name = "docente_id")
    )
    @Builder.Default
    private Set<Usuario> docentes = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "padre_alumno",
            joinColumns = @JoinColumn(name = "alumno_id"),
            inverseJoinColumns = @JoinColumn(name = "padre_id")
    )
    @Builder.Default
    private Set<Usuario> padres = new HashSet<>();
}
