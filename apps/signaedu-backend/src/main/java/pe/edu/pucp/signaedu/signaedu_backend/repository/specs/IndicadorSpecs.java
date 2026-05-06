package pe.edu.pucp.signaedu.signaedu_backend.repository.specs;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import pe.edu.pucp.signaedu.signaedu_backend.model.Indicador;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.AreaCurricular;

public final class IndicadorSpecs {

    private IndicadorSpecs() {
    }

    public static Specification<Indicador> conAreaCurricular(AreaCurricular area) {
        if (area == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("areaCurricular"), area);
    }

    public static Specification<Indicador> conActivo(Boolean activo) {
        if (activo == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("activo"), activo);
    }

    public static Specification<Indicador> conQuery(String q) {
        if (q == null || q.isBlank()) {
            return null;
        }
        String patron = "%" + q.toLowerCase() + "%";
        return (root, query, cb) -> {
            Predicate enNombre = cb.like(cb.lower(root.get("nombre")), patron);
            Predicate enDescripcion = cb.like(cb.lower(cb.coalesce(root.get("descripcion"), "")), patron);
            return cb.or(enNombre, enDescripcion);
        };
    }
}
