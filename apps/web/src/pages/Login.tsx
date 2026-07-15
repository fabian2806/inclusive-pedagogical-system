import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, ArrowLeft, GraduationCap, Users, ClipboardCheck, KeyRound, Mail, Phone, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { configuracionService } from "@/lib/api/configuracionService"
import type { ContactoAdminResponse } from "@/types/api"

export default function Login() {

    {/* TODO: Exportar year a un componente (quizá a utils?) */}
    const year = new Date().getFullYear();
    const navigate = useNavigate()
    const { login } = useAuth()

    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    // Modales de ayuda (olvidé contraseña / contacto)
    const [forgotOpen, setForgotOpen] = useState(false)
    const [contactOpen, setContactOpen] = useState(false)
    const [forgotEmail, setForgotEmail] = useState("")
    const [contacto, setContacto] = useState<ContactoAdminResponse | null>(null)
    const [contactoLoading, setContactoLoading] = useState(false)
    const [copiado, setCopiado] = useState(false)

    // Fallback si aún no se ha cargado o falla la consulta del contacto.
    const adminCorreo = contacto?.correo?.trim() || "admin@signaedu.pe"
    const adminTelefono = contacto?.telefono?.trim() || ""

    // Carga perezosa: se pide el contacto solo al abrir un modal, una sola vez.
    const cargarContacto = async () => {
        if (contacto || contactoLoading) return
        setContactoLoading(true)
        try {
            const data = await configuracionService.obtenerContactoAdmin()
            setContacto(data)
        } catch {
            // Si falla, se mantiene el fallback de adminCorreo.
        } finally {
            setContactoLoading(false)
        }
    }

    const abrirOlvideContrasena = () => {
        setForgotEmail(email)
        cargarContacto()
        setForgotOpen(true)
    }

    const abrirContacto = () => {
        cargarContacto()
        setContactOpen(true)
    }

    const enviarSolicitudReset = () => {
        const asunto = encodeURIComponent("Solicitud de restablecimiento de contraseña")
        const cuerpo = encodeURIComponent(
            `Hola,\n\nSolicito el restablecimiento de la contraseña de mi cuenta en SignaEdu.\n\n` +
            `Correo de la cuenta: ${forgotEmail || "(indica tu correo)"}\n\nGracias.`
        )
        window.location.href = `mailto:${adminCorreo}?subject=${asunto}&body=${cuerpo}`
    }

    const copiarCorreo = async () => {
        try {
            await navigator.clipboard.writeText(adminCorreo)
            setCopiado(true)
            setTimeout(() => setCopiado(false), 2000)
        } catch {
            // El navegador puede bloquear el portapapeles; no es crítico.
        }
    }

    const features = [
        "Expediente digital del estudiante",
        "Comunicación en tiempo real",
        "Coordinación de eventos",
    ];
    
    {/* Reemplazar íconos por SVG? RNF*/}
    const roles = [
        { label: "Docente", icon: <GraduationCap /> },
        { label: "SAANEE", icon: <ClipboardCheck /> },
        { label: "Familia", icon: <Users /> },
    ];

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            await login(email, password)
            navigate("/dashboard")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al iniciar sesión")
        } finally {
            setLoading(false)
        }   

    }

    return (
        <div className="min-h-screen bg-[#F3F4F6] flex">
            <title>Iniciar sesión</title>

            {/* En el lado izquierdo: logo y breve texto descriptivo del sistema */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#1E3A5F] relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-[#1E3A5F] via-[#2D4A6F] to-[#1E3A5F]" />
                <div className="relative z-10 flex flex-col justify-between p-12 w-full">

                    {/*TODO: Exportar logo a un único componente */}
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 
                                19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 
                                7A3.37 3.37 0 0 0 9 18.13V22" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-white">SignaEdu</span>
                    </Link>

                    {/* Texto descriptivo */}
                    <div className="flex-1 flex flex-col justify-center max-w-lg">
                        <h1 className="text-5xl font-bold text-white leading-tight mb-4">
                            Seguimiento pedagógico inclusivo
                        </h1>
                        <p className="text-lg text-white/70 leading-relaxed">
                            Conectamos a docentes, familias y especialistas SAANEE para garantizar el desarrollo integral de estudiantes con discapacidad auditiva.
                        </p>

                        <div className="mt-10 space-y-4">
                            {features.map((feature) => (
                                <div key={feature} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[#3B82F6] flex items-center justify-center shrink-0">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                    <span className="text-white/90 text-md">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-sm text-white/50">
                        © {year} SignaEdu
                    </p>
                </div>

                {/* Círculos decorativos (para que no sea tan estático el fondo) */}
                <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#3B82F6]/10" />
                <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#8B5CF6]/10" />
            </div>

            {/* En el lado derecho: Forms de login */}
            <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16">
                <div className="w-full max-w-md mx-auto">
                    {/* Botón de retroceso para móvil */}
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#1E3A5F] mb-8 transition-colors lg:hidden"
                    >
                        <ArrowLeft size={16} />
                        Volver al inicio
                    </Link>

                    {/* Logo en móvil */}
                    <div className="lg:hidden mb-8">
                        <Link to="/" className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-[#1E3A5F] flex items-center justify-center">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 
                                    19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 
                                    7A3.37 3.37 0 0 0 9 18.13V22" />
                                </svg>
                            </div>
                            <span className="text-lg font-bold text-[#1E3A5F]">SignaEdu</span>
                        </Link>
                    </div>

                    {/* Encabezado */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-[#1E3A5F] mb-2">
                            Iniciar sesión
                        </h2>
                        <p className="text-sm text-[#6B7280]">
                            Ingresa tus credenciales para acceder a la plataforma
                        </p>
                    </div>

                    {error && (
                        <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Correo */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-[#374151]">
                                Correo electrónico
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="usuario@ejemplo.com"
                                value={email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                className="h-11 border-[#D1D5DB] focus:border-[#3B82F6] focus:ring-[#3B82F6]"
                                required
                            />
                        </div>

                        {/* Contraseña */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-[#374151]">
                                Contraseña
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Ingresa tu contraseña"
                                    value={password}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                    className="h-11 pr-10 border-[#D1D5DB] focus:border-[#3B82F6] focus:ring-[#3B82F6]"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Checkbox id="remember" className="border-[#D1D5DB]" />
                                <Label htmlFor="remember" className="text-sm text-[#6B7280] font-normal cursor-pointer">
                                    Recordarme
                                </Label>
                            </div>
                            <button
                                type="button"
                                onClick={abrirOlvideContrasena}
                                className="text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium transition-colors"
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white font-medium transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? "Iniciando..." : "Iniciar sesión"}
                        </Button>
                    </form>

                    {/* Divisor informativo de accesos permitidos por rol */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#E5E7EB]" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-[#F3F4F6] px-3 text-[#9CA3AF]">Acceso por rol</span>
                        </div>
                    </div>

                    {/* Botones por rol (quizá agregar SVG? y considerar extraer a componente) */}
                    <div className="grid grid-cols-3 gap-3">
                        {roles.map((role) => (
                            <div
                                key={role.label}
                                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[#E5E7EB] bg-white 
                                hover:border-[#3B82F6] hover:bg-[#EFF6FF] transition-colors group"
                            >
                                {role.icon}
                                <span className="text-xs font-medium text-[#6B7280] group-hover:text-[#1E3A5F] transition-colors">
                                    {role.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Texto de apoyo (quizá solo considerar mensaje de contactar al admin. A evaluar) */}
                    <p className="mt-8 text-center text-sm text-[#9CA3AF]">
                        ¿Necesitas ayuda?{" "}
                        <button
                            type="button"
                            onClick={abrirContacto}
                            className="text-[#3B82F6] hover:text-[#2563EB] font-medium transition-colors"
                        >
                            Contacta al administrador
                        </button>
                    </p>
                </div>
            </div>

            {/* Modal: ¿Olvidaste tu contraseña? */}
            <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-[#1E3A5F]">
                            <KeyRound size={18} className="text-[#3B82F6]" />
                            Restablecer contraseña
                        </DialogTitle>
                        <DialogDescription>
                            Por seguridad, el restablecimiento lo gestiona el administrador. Indica el correo
                            de tu cuenta y se abrirá tu aplicación de correo con la solicitud lista para enviar.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2 py-1">
                        <Label htmlFor="forgot-email" className="text-sm font-medium text-[#374151]">
                            Correo de tu cuenta
                        </Label>
                        <Input
                            id="forgot-email"
                            type="email"
                            placeholder="usuario@ejemplo.com"
                            value={forgotEmail}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForgotEmail(e.target.value)}
                            className="h-11 border-[#D1D5DB] focus:border-[#3B82F6] focus:ring-[#3B82F6]"
                        />
                        <p className="text-xs text-[#9CA3AF]">
                            Se enviará a{" "}
                            <span className="font-medium text-[#6B7280]">{adminCorreo}</span>.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setForgotOpen(false)}
                            className="border-[#E5E7EB] text-[#374151]"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={enviarSolicitudReset}
                            disabled={!forgotEmail}
                            className="bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white gap-2"
                        >
                            <Mail size={16} />
                            Enviar solicitud
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Contacta al administrador */}
            <Dialog open={contactOpen} onOpenChange={setContactOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-[#1E3A5F]">
                            <Users size={18} className="text-[#3B82F6]" />
                            Contacta al administrador
                        </DialogTitle>
                        <DialogDescription>
                            Si tienes problemas para acceder o necesitas una cuenta, comunícate con el
                            administrador del sistema.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-1">
                        {/* Correo */}
                        <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 rounded-lg bg-[#EFF6FF] shrink-0">
                                    <Mail size={16} className="text-[#3B82F6]" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-[#9CA3AF]">Correo</p>
                                    <p className="text-sm font-medium text-[#1E3A5F] truncate">
                                        {contactoLoading ? "Cargando..." : adminCorreo}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={copiarCorreo}
                                className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-[#3B82F6] hover:text-[#2563EB] transition-colors"
                                aria-label="Copiar correo"
                            >
                                {copiado ? <Check size={14} /> : <Copy size={14} />}
                                {copiado ? "Copiado" : "Copiar"}
                            </button>
                        </div>

                        {/* Teléfono (solo si está configurado) */}
                        {adminTelefono && (
                            <div className="flex items-center gap-3 p-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
                                <div className="p-2 rounded-lg bg-[#ECFDF5] shrink-0">
                                    <Phone size={16} className="text-[#059669]" />
                                </div>
                                <div>
                                    <p className="text-xs text-[#9CA3AF]">Teléfono</p>
                                    <p className="text-sm font-medium text-[#1E3A5F]">{adminTelefono}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setContactOpen(false)}
                            className="border-[#E5E7EB] text-[#374151]"
                        >
                            Cerrar
                        </Button>
                        <Button
                            type="button"
                            onClick={() => { window.location.href = `mailto:${adminCorreo}` }}
                            className="bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white gap-2"
                        >
                            <Mail size={16} />
                            Escribir correo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}