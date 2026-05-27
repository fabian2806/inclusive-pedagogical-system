package pe.edu.pucp.signaedu.signaedu_backend.model;

import jakarta.persistence.*;
import lombok.*;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoEntrada;

import java.time.LocalDateTime;

@Entity
@Table(name = "entrada_expediente")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class EntradaExpediente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expediente_id", nullable = false)
    private Expediente expediente;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_entrada", nullable = false, length = 50)
    private TipoEntrada tipoEntrada;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Column(length = 150)
    private String titulo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entrada_raiz_id")
    private EntradaExpediente entradaRaiz;

    @Column(name = "nivel_importancia", length = 20)
    private String nivelImportancia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dirigido_a_usuario_id")
    private Usuario dirigidoA;

    @Column(length = 20)
    private String severidad;

    @Column(columnDefinition = "TEXT")
    private String resultado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "indicador_id")
    private Indicador indicador;

    @Column(name = "resultado_logrado")
    private Boolean resultadoLogrado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evento_id")
    private Evento evento;
}
