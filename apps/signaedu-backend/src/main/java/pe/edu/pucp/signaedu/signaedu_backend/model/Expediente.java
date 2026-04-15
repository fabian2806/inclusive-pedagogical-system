package pe.edu.pucp.signaedu.signaedu_backend.model;

import jakarta.persistence.*;
import lombok.*;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoExpediente;

import java.time.LocalDate;

@Entity
@Table(name = "expediente", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"alumno_id", "periodo_lectivo"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Expediente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alumno_id", nullable = false)
    private Alumno alumno;

    @Column(name = "fecha_apertura", nullable = false)
    private LocalDate fechaApertura;

    @Column(name = "periodo_lectivo", nullable = false, length = 10)
    private String periodoLectivo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EstadoExpediente estado = EstadoExpediente.ACTIVO;
}
