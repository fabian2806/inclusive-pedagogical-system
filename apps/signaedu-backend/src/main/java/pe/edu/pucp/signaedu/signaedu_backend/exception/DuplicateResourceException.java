package pe.edu.pucp.signaedu.signaedu_backend.exception;

public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String recurso, String campo, Object valor) {
        super(String.format("%s ya existe con %s: %s", recurso, campo, valor));
    }
}
