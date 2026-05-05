package pe.edu.pucp.signaedu.signaedu_backend.repository.specs;

import org.springframework.data.jpa.domain.Specification;
import pe.edu.pucp.signaedu.signaedu_backend.model.EntradaExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoEntrada;

import java.time.LocalDateTime;

public final class EntradaExpedienteSpecs {

    private EntradaExpedienteSpecs() {
    }

    public static Specification<EntradaExpediente> delExpediente(Long expedienteId) {
        return (root, query, cb) -> cb.equal(root.get("expediente").get("id"), expedienteId);
    }

    public static Specification<EntradaExpediente> conTipo(TipoEntrada tipo) {
        if (tipo == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("tipoEntrada"), tipo);
    }

    public static Specification<EntradaExpediente> desde(LocalDateTime desde) {
        if (desde == null) {
            return null;
        }
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("fecha"), desde);
    }

    public static Specification<EntradaExpediente> hasta(LocalDateTime hasta) {
        if (hasta == null) {
            return null;
        }
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("fecha"), hasta);
    }
}
