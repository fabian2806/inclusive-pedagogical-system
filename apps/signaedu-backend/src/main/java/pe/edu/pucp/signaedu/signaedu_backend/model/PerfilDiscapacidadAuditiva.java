package pe.edu.pucp.signaedu.signaedu_backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "perfil_discapacidad_auditiva")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class PerfilDiscapacidadAuditiva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alumno_id", nullable = false, unique = true)
    private Alumno alumno;

    @Column(name = "modo_comunicacion_preferido")
    private String modoComunicacionPreferido;

    @Column(name = "observaciones_generales", columnDefinition = "TEXT")
    private String observacionesGenerales;

    @OneToMany(mappedBy = "perfilDiscapacidadAuditiva", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PerfilBarrera> barreras = new ArrayList<>();

    @OneToMany(mappedBy = "perfilDiscapacidadAuditiva", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PerfilFortaleza> fortalezas = new ArrayList<>();

    @OneToMany(mappedBy = "perfilDiscapacidadAuditiva", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PerfilApoyo> apoyos = new ArrayList<>();
}
