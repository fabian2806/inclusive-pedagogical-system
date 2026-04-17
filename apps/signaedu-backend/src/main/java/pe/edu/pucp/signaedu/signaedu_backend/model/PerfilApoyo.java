package pe.edu.pucp.signaedu.signaedu_backend.model;

import jakarta.persistence.*;
import lombok.*;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoFuente;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoFuncion;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoIntensidad;

@Entity
@Table(name = "perfil_apoyo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class PerfilApoyo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "perfil_discapacidad_auditiva_id", nullable = false)
    private PerfilDiscapacidadAuditiva perfilDiscapacidadAuditiva;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private TipoIntensidad intensidad;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private TipoFuncion funcion;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private TipoFuente fuente;
}
