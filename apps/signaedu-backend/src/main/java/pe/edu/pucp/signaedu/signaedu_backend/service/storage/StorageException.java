package pe.edu.pucp.signaedu.signaedu_backend.service.storage;

public class StorageException extends RuntimeException {

    public StorageException(String mensaje) {
        super(mensaje);
    }

    public StorageException(String mensaje, Throwable causa) {
        super(mensaje, causa);
    }
}
