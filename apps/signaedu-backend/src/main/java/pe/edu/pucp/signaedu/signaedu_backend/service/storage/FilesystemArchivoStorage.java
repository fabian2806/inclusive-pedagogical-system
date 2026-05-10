package pe.edu.pucp.signaedu.signaedu_backend.service.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.FileAlreadyExistsException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Implementacion de {@link ArchivoStorage} que persiste los archivos en el
 * filesystem local bajo {@code ${storage.local.root}}.
 *
 * Pensada para desarrollo; la Vista Fisica del 4+1 contempla S3 en
 * produccion. Migrar implica agregar S3ArchivoStorage como segunda
 * implementacion sin tocar el resto del backend.
 */
@Service
public class FilesystemArchivoStorage implements ArchivoStorage {

    private final Path root;

    public FilesystemArchivoStorage(@Value("${storage.local.root}") String rootPath) {
        this.root = Paths.get(rootPath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.root);
        } catch (IOException e) {
            throw new StorageException("No se pudo crear el directorio raiz de storage: " + this.root, e);
        }
    }

    @Override
    public void guardar(String key, InputStream contenido, long tamano) {
        Path destino = resolverYValidar(key);
        try {
            Files.createDirectories(destino.getParent());
            Files.copy(contenido, destino);
        } catch (FileAlreadyExistsException e) {
            throw new StorageException("Ya existe un archivo con la key: " + key);
        } catch (IOException e) {
            throw new StorageException("Error al guardar archivo en " + destino, e);
        }
    }

    @Override
    public InputStream leer(String key) {
        Path origen = resolverYValidar(key);
        if (!Files.exists(origen)) {
            throw new StorageException("Archivo no encontrado: " + key);
        }
        try {
            return Files.newInputStream(origen);
        } catch (IOException e) {
            throw new StorageException("Error al leer archivo " + key, e);
        }
    }

    @Override
    public void eliminar(String key) {
        Path destino = resolverYValidar(key);
        try {
            Files.deleteIfExists(destino);
        } catch (IOException e) {
            throw new StorageException("Error al eliminar archivo " + key, e);
        }
    }

    @Override
    public boolean existe(String key) {
        return Files.exists(resolverYValidar(key));
    }

    /**
     * Resuelve la key contra el root y verifica que la ruta resultante este
     * contenida en el. Bloquea path traversal (".." o keys absolutas).
     */
    private Path resolverYValidar(String key) {
        if (key == null || key.isBlank()) {
            throw new StorageException("Key invalida (vacia)");
        }
        Path resolved = root.resolve(key).toAbsolutePath().normalize();
        if (!resolved.startsWith(root)) {
            throw new StorageException("Key invalida (intento de salir del root): " + key);
        }
        return resolved;
    }
}
