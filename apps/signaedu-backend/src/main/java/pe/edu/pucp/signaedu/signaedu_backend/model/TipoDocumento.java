package pe.edu.pucp.signaedu.signaedu_backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tipo_documento")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class TipoDocumento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombre;

    @Column(name = "es_obligatorio", nullable = false)
    @Builder.Default
    private Boolean esObligatorio = false;

    @Column(name = "es_versionable", nullable = false)
    @Builder.Default
    private Boolean esVersionable = false;

    @Column(name = "es_periodico", nullable = false)
    @Builder.Default
    private Boolean esPeriodico = false;

    private String periodicidad;

    @Column(name = "es_predefinido", nullable = false)
    @Builder.Default
    private Boolean esPredefinido = false;
}
