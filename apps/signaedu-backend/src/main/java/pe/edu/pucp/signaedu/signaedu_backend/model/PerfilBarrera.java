package pe.edu.pucp.signaedu.signaedu_backend.model;

import jakarta.persistence.*;
import lombok.*;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoBarrera;

@Entity
@Table(name = "perfil_barrera")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class PerfilBarrera {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "perfil_discapacidad_auditiva_id", nullable = false)
    private PerfilDiscapacidadAuditiva perfilDiscapacidadAuditiva;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private TipoBarrera tipo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;
}
