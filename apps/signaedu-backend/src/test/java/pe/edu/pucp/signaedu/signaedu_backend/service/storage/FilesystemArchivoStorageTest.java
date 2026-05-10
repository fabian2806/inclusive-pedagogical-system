package pe.edu.pucp.signaedu.signaedu_backend.service.storage;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FilesystemArchivoStorageTest {

    @TempDir
    Path rootDir;

    private FilesystemArchivoStorage storage;

    @BeforeEach
    void setUp() {
        storage = new FilesystemArchivoStorage(rootDir.toString());
    }

    @Test
    void debeGuardarYLeerArchivoComoRoundtrip() throws Exception {
        byte[] contenido = "hola mundo".getBytes(StandardCharsets.UTF_8);

        storage.guardar("expedientes/123.pdf", new ByteArrayInputStream(contenido), contenido.length);

        try (InputStream is = storage.leer("expedientes/123.pdf")) {
            assertThat(is.readAllBytes()).isEqualTo(contenido);
        }
    }

    @Test
    void debeIndicarExistenciaCorrectamente() {
        assertThat(storage.existe("expedientes/no-existe.pdf")).isFalse();

        storage.guardar("expedientes/1.pdf", new ByteArrayInputStream(new byte[]{1, 2, 3}), 3);

        assertThat(storage.existe("expedientes/1.pdf")).isTrue();
    }

    @Test
    void debeEliminarArchivoExistente() {
        storage.guardar("expedientes/2.pdf", new ByteArrayInputStream(new byte[]{1}), 1);
        assertThat(storage.existe("expedientes/2.pdf")).isTrue();

        storage.eliminar("expedientes/2.pdf");

        assertThat(storage.existe("expedientes/2.pdf")).isFalse();
    }

    @Test
    void debeSerIdempotenteAlEliminarInexistente() {
        storage.eliminar("expedientes/no-existe.pdf");

        assertThat(storage.existe("expedientes/no-existe.pdf")).isFalse();
    }

    @Test
    void debeLanzarAlLeerArchivoInexistente() {
        assertThatThrownBy(() -> storage.leer("expedientes/no-existe.pdf"))
                .isInstanceOf(StorageException.class)
                .hasMessageContaining("no encontrado");
    }

    @Test
    void debeLanzarAlGuardarKeyExistente() {
        storage.guardar("expedientes/3.pdf", new ByteArrayInputStream(new byte[]{1}), 1);

        assertThatThrownBy(() ->
                storage.guardar("expedientes/3.pdf", new ByteArrayInputStream(new byte[]{2}), 1)
        ).isInstanceOf(StorageException.class)
         .hasMessageContaining("Ya existe");
    }

    @Test
    void debeRechazarPathTraversalEnGuardar() {
        assertThatThrownBy(() ->
                storage.guardar("../afuera.pdf", new ByteArrayInputStream(new byte[]{1}), 1)
        ).isInstanceOf(StorageException.class)
         .hasMessageContaining("salir del root");
    }

    @Test
    void debeRechazarPathTraversalEnLeer() {
        assertThatThrownBy(() -> storage.leer("../../etc/passwd"))
                .isInstanceOf(StorageException.class)
                .hasMessageContaining("salir del root");
    }

    @Test
    void debeRechazarKeyVacia() {
        assertThatThrownBy(() ->
                storage.guardar("", new ByteArrayInputStream(new byte[]{1}), 1)
        ).isInstanceOf(StorageException.class);

        assertThatThrownBy(() -> storage.existe("   "))
                .isInstanceOf(StorageException.class);
    }

    @Test
    void debeCrearSubdirectoriosAutomaticamente() {
        storage.guardar("a/b/c/d.txt", new ByteArrayInputStream(new byte[]{1}), 1);

        assertThat(Files.exists(rootDir.resolve("a/b/c/d.txt"))).isTrue();
    }

    @Test
    void debeCrearRootSiNoExiste() {
        Path nuevoRoot = rootDir.resolve("subdir-no-existente");
        assertThat(Files.exists(nuevoRoot)).isFalse();

        new FilesystemArchivoStorage(nuevoRoot.toString());

        assertThat(Files.exists(nuevoRoot)).isTrue();
    }
}
