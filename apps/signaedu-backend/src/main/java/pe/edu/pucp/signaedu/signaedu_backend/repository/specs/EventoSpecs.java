package pe.edu.pucp.signaedu.signaedu_backend.repository.specs;

import org.springframework.data.jpa.domain.Specification;
import pe.edu.pucp.signaedu.signaedu_backend.model.Evento;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoEvento;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoEvento;

import java.time.LocalDateTime;

public final class EventoSpecs {

    private EventoSpecs() {
    }

    public static Specification<Evento> delAlumno(Long alumnoId) {
        if (alumnoId == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("alumno").get("id"), alumnoId);
    }

    public static Specification<Evento> conTipo(TipoEvento tipo) {
        if (tipo == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("tipoEvento"), tipo);
    }

    public static Specification<Evento> conEstado(EstadoEvento estado) {
        if (estado == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("estado"), estado);
    }

    public static Specification<Evento> desde(LocalDateTime desde) {
        if (desde == null) {
            return null;
        }
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("fechaInicio"), desde);
    }

    public static Specification<Evento> hasta(LocalDateTime hasta) {
        if (hasta == null) {
            return null;
        }
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("fechaInicio"), hasta);
    }

    /**
     * Visibilidad por rol: el usuario es creador o esta en evento_usuario.
     * Patron equivalente al filtrado en BitacoraService / AlumnoService.
     */
    public static Specification<Evento> visibleParaUsuario(Long usuarioId) {
        if (usuarioId == null) {
            return null;
        }
        return (root, query, cb) -> {
            if (query != null) {
                query.distinct(true);
            }
            var invitadosJoin = root.join("invitados", jakarta.persistence.criteria.JoinType.LEFT);
            return cb.or(
                    cb.equal(root.get("usuarioCreador").get("id"), usuarioId),
                    cb.equal(invitadosJoin.get("usuario").get("id"), usuarioId)
            );
        };
    }
}
