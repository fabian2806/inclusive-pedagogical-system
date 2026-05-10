package pe.edu.pucp.signaedu.signaedu_backend.service;

import java.io.InputStream;

/**
 * Holder de datos para la descarga de un archivo. Lo devuelve la capa de
 * servicio al controller, que se encarga de armar la respuesta HTTP con
 * Content-Type, Content-Length y Content-Disposition apropiados.
 */
public record ArchivoDescargaResource(
        InputStream contenido,
        String nombreOriginal,
        String mimeType,
        long tamano
) {}
