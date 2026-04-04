package pe.edu.pucp.signaedu.signaedu_backend.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String recurso, String campo, Object valor) {
        super(String.format("%s no encontrado con %s: %s", recurso, campo, valor));
    }
}
