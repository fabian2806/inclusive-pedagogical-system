package pe.edu.pucp.signaedu.signaedu_backend.service.storage;

import java.io.InputStream;

/**
 * Abstraccion sobre el almacenamiento de archivos del sistema.
 *
 * Aplica DIP: el resto del backend depende de esta interfaz, no de una
 * implementacion concreta. La unica implementacion activa es
 * {@link FilesystemArchivoStorage}; una S3ArchivoStorage queda como trabajo
 * futuro alineado con la Vista Fisica del 4+1.
 *
 * Las keys son rutas logicas estilo S3 (e.g. "expedientes/123.pdf"). Cada
 * implementacion las traduce a su backend.
 */
public interface ArchivoStorage {

    /**
     * Guarda contenido bajo la key indicada. Falla si la key ya existe
     * (la inmutabilidad del archivo es responsabilidad del storage; el
     * versionado de DocumentoExpediente se modela aparte).
     *
     * @param contenido stream de entrada; no se cierra automaticamente.
     * @param tamano    tamano en bytes (informativo; algunas implementaciones
     *                  lo requieren upfront, p.ej. S3 PutObject).
     */
    void guardar(String key, InputStream contenido, long tamano);

    /**
     * Devuelve un stream para leer el archivo. Quien invoque es responsable
     * de cerrarlo.
     */
    InputStream leer(String key);

    /**
     * Elimina el archivo si existe. Idempotente.
     */
    void eliminar(String key);

    boolean existe(String key);
}
