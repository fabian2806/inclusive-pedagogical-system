package pe.edu.pucp.signaedu.signaedu_backend.exception;

public class IllegalOperationException extends RuntimeException {

    public IllegalOperationException(String mensaje) {
        super(mensaje);
    }
}
