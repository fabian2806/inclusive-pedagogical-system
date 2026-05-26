package pe.edu.pucp.signaedu.signaedu_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.ActividadEntradaResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.AdminDashboardResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.DocenteDashboardResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.HijoResumen;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.PadreDashboardResponse;
import pe.edu.pucp.signaedu.signaedu_backend.dto.response.SaaneeDashboardResponse;
import pe.edu.pucp.signaedu.signaedu_backend.exception.ResourceNotFoundException;
import pe.edu.pucp.signaedu.signaedu_backend.mapper.UsuarioMapper;
import pe.edu.pucp.signaedu.signaedu_backend.model.Alumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.EntradaExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.Usuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoAlumno;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoExpediente;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.EstadoUsuario;
import pe.edu.pucp.signaedu.signaedu_backend.model.enums.TipoRol;
import pe.edu.pucp.signaedu.signaedu_backend.repository.AlumnoRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.EntradaExpedienteRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.ExpedienteRepository;
import pe.edu.pucp.signaedu.signaedu_backend.repository.UsuarioRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final UsuarioRepository usuarioRepository;
    private final AlumnoRepository alumnoRepository;
    private final ExpedienteRepository expedienteRepository;
    private final EntradaExpedienteRepository entradaExpedienteRepository;
    private final ConfiguracionService configuracionService;
    private final UsuarioMapper usuarioMapper;

    public AdminDashboardResponse obtenerResumenAdmin() {
        String periodo = configuracionService.obtenerValorPeriodo();

        Map<TipoRol, Long> usuariosPorRol = new EnumMap<>(TipoRol.class);
        for (TipoRol rol : TipoRol.values()) {
            usuariosPorRol.put(rol, usuarioRepository.countByRoles_Nombre(rol));
        }

        return AdminDashboardResponse.builder()
                .totalUsuarios(usuarioRepository.countByEstado(EstadoUsuario.ACTIVO))
                .totalAlumnosActivos(alumnoRepository.countByEstado(EstadoAlumno.ACTIVO))
                .expedientesAbiertos(expedienteRepository.countByPeriodoLectivoAndEstado(
                        periodo, EstadoExpediente.ACTIVO))
                .periodoVigente(periodo)
                .usuariosPorRol(usuariosPorRol)
                .build();
    }

    public DocenteDashboardResponse obtenerResumenDocente() {
        Usuario docente = obtenerUsuarioAutenticado();
        LocalDateTime inicioHoy = LocalDate.now().atStartOfDay();

        return DocenteDashboardResponse.builder()
                .alumnosAsignados(alumnoRepository.countByDocentes_Id(docente.getId()))
                .entradasBitacoraHoy(entradaExpedienteRepository
                        .contarEntradasDesdeFechaParaDocente(docente.getId(), inicioHoy))
                .alumnosSinPerfilDiscapacidad(alumnoRepository
                        .contarAsignadosSinPerfilDiscapacidad(docente.getId()))
                .build();
    }

    public List<ActividadEntradaResponse> obtenerActividadRecienteDocente(int limit) {
        // Normaliza límite recibido: [1, 20]. Previene errores de PageRequest
        // ante 0/negativos y limita el tamaño de respuesta ante valores exorbitantes.
        int limiteSeguro = Math.min(Math.max(limit, 1), 20);
        Usuario docente = obtenerUsuarioAutenticado();
        List<EntradaExpediente> entradas = entradaExpedienteRepository
                .obtenerActividadRecienteDeDocente(docente.getId(), PageRequest.of(0, limiteSeguro));
        return entradas.stream().map(this::toActividadResponse).toList();
    }

    public PadreDashboardResponse obtenerResumenPadre() {
        Usuario padre = obtenerUsuarioAutenticado();
        String periodo = configuracionService.obtenerValorPeriodo();
        LocalDateTime inicioHoy = LocalDate.now().atStartOfDay();

        List<Alumno> hijos = alumnoRepository.findByPadres_Id(padre.getId());
        List<HijoResumen> hijosResumen = hijos.stream()
                .map(a -> HijoResumen.builder()
                        .id(a.getId())
                        .nombre(a.getNombre())
                        .apellido(a.getApellido())
                        .grado(a.getGrado())
                        .seccion(a.getSeccion())
                        .expedienteId(buscarExpedienteIdVigente(a.getId(), periodo))
                        .build())
                .toList();

        long entradasHoy = entradaExpedienteRepository
                .contarEntradasDesdeFechaParaPadre(padre.getId(), inicioHoy);

        return PadreDashboardResponse.builder()
                .hijos(hijosResumen)
                .entradasNuevasHoy(entradasHoy)
                .build();
    }

    public SaaneeDashboardResponse obtenerResumenSaanee() {
        return SaaneeDashboardResponse.builder()
                .totalAlumnosActivos(alumnoRepository.countByEstado(EstadoAlumno.ACTIVO))
                .build();
    }

    private Usuario obtenerUsuarioAutenticado() {
        String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "correo", correo));
    }

    private Long buscarExpedienteIdVigente(Long alumnoId, String periodo) {
        return expedienteRepository
                .findByAlumnoIdAndPeriodoLectivoAndEstado(alumnoId, periodo, EstadoExpediente.ACTIVO)
                .map(e -> e.getId())
                .orElse(null);
    }

    private ActividadEntradaResponse toActividadResponse(EntradaExpediente entrada) {
        Alumno alumno = entrada.getExpediente().getAlumno();
        return ActividadEntradaResponse.builder()
                .id(entrada.getId())
                .tipo(entrada.getTipoEntrada())
                .fecha(entrada.getFecha())
                .autor(usuarioMapper.toBitacoraResponse(entrada.getUsuario()))
                .alumnoId(alumno.getId())
                .alumnoNombre(alumno.getNombre())
                .alumnoApellido(alumno.getApellido())
                .titulo(entrada.getTitulo())
                .descripcion(entrada.getDescripcion())
                .build();
    }
}
