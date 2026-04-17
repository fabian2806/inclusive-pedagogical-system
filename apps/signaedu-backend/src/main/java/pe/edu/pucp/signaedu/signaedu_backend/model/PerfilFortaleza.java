package pe.edu.pucp.signaedu.signaedu_backend.model;

import jakarta.persistence.*;
import lombok.*;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoDimension;

@Entity
@Table(name = "perfil_fortaleza")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class PerfilFortaleza {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "perfil_discapacidad_auditiva_id", nullable = false)
    private PerfilDiscapacidadAuditiva perfilDiscapacidadAuditiva;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private TipoDimension dimension;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;
}
