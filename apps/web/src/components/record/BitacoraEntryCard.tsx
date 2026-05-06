import { CheckCircle2, Clock, MessageSquare, Paperclip, Target, X, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { getEntryTypeColor, getRoleColor } from "@/lib/bitacora-ui"
import type { Attachment, BitacoraEntry, Reply } from "@/types/bitacora"

const AREA_LABEL: Record<string, string> = {
  COMUNICACION: "Comunicación",
  MATEMATICA: "Matemática",
  ED_FISICA: "Ed. Física",
  PERSONAL_SOCIAL: "Personal Social",
  OTRO: "Otro",
}

interface Props {
  entry: BitacoraEntry
  isLast: boolean
  isReplying: boolean
  replyText: string
  setReplyText: (s: string) => void
  startReply: (id: string) => void
  cancelReply: () => void
  onReply: (id: string) => void
  submitting: boolean
}

function avatarIniciales(autor: string): string {
  return autor.split(" ").map((n) => n[0]).join("").slice(0, 2)
}

function severidadClasses(severidad: string): string {
  if (severidad === "grave") return "bg-[#FEE2E2] text-[#DC2626]"
  if (severidad === "moderada") return "bg-[#FEF3C7] text-[#D97706]"
  return "bg-[#F3F4F6] text-[#6B7280]"
}

function AttachmentChip({ file, withSize = true }: { file: Attachment; withSize?: boolean }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#F3F4F6] text-xs text-[#374151]">
      <Paperclip size={12} className="text-[#6B7280]" />
      <span>{file.name}</span>
      {withSize && <span className="text-[#9CA3AF]">({file.size})</span>}
    </div>
  )
}

function ReplyItem({ reply }: { reply: Reply }) {
  return (
    <div className="flex gap-3">
      <div
        className={`w-6 h-6 rounded-full ${getRoleColor(reply.role)} flex items-center justify-center flex-shrink-0`}
      >
        <span className="text-[10px] text-white font-semibold">
          {avatarIniciales(reply.author)}
        </span>
      </div>
      <div className="flex-1 pl-3 border-l-2 border-[#BFDBFE]">
        <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-1">
          <span className="font-medium text-[#374151]">{reply.author}</span>
          <span>·</span>
          <span>{reply.role}</span>
          <span>·</span>
          <span>{reply.date}, {reply.time}</span>
        </div>
        <p className="text-sm text-[#374151]">{reply.content}</p>
        {reply.attachments && reply.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {reply.attachments.map((file, fIdx) => (
              <AttachmentChip key={fIdx} file={file} withSize={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function BitacoraEntryCard({
  entry,
  isLast,
  isReplying,
  replyText,
  setReplyText,
  startReply,
  cancelReply,
  onReply,
  submitting,
}: Props) {
  const typeStyle = getEntryTypeColor(entry.type)
  const roleColor = getRoleColor(entry.role)

  return (
    <div className="relative">
      {!isLast && <div className="absolute left-4 top-12 bottom-0 w-px bg-[#E5E7EB]" />}

      <div className="flex gap-4">
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-full ${roleColor} flex items-center justify-center flex-shrink-0 z-10`}
        >
          <span className="text-xs text-white font-semibold">
            {avatarIniciales(entry.author)}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 pb-4">
          <div className={`p-4 rounded-lg border-l-4 border ${typeStyle.border} ${typeStyle.bg}`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-sm font-semibold text-[#1E3A5F]">{entry.title}</p>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${typeStyle.bg} ${typeStyle.text} border-transparent`}
                  >
                    {typeStyle.label}
                  </Badge>
                  {entry.importancia && (
                    <Badge variant="outline" className="text-[10px] border-[#D1D5DB] text-[#6B7280]">
                      {entry.importancia}
                    </Badge>
                  )}
                  {entry.severidad && (
                    <Badge
                      variant="outline"
                      className={`text-[10px] border-transparent ${severidadClasses(entry.severidad)}`}
                    >
                      {entry.severidad}
                    </Badge>
                  )}
                  {entry.resultado && (
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-[#ECFDF5] text-[#059669] border-transparent"
                    >
                      {entry.resultado}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                  <span className="font-medium">{entry.author}</span>
                  <span>·</span>
                  <span>{entry.role}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    {entry.date}, {entry.time}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-sm text-[#374151] leading-relaxed mb-3">{entry.content}</p>

            {entry.indicador && (
              <div className="mb-3 p-3 rounded-md bg-white/70 border border-[#E5E7EB] flex items-start gap-2">
                <Target size={14} className="text-[#7C3AED] mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-[#1E3A5F]">{entry.indicador.nombre}</p>
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-[#F5F3FF] text-[#7C3AED] border-[#C4B5FD]"
                    >
                      {AREA_LABEL[entry.indicador.areaCurricular] ?? entry.indicador.areaCurricular}
                    </Badge>
                    {entry.indicador.categoria && (
                      <span className="text-[10px] text-[#6B7280]">· {entry.indicador.categoria}</span>
                    )}
                    {entry.resultadoLogrado === true && (
                      <Badge variant="outline" className="text-[10px] bg-[#D1FAE5] text-[#059669] border-[#10B981] gap-1">
                        <CheckCircle2 size={10} /> Logrado
                      </Badge>
                    )}
                    {entry.resultadoLogrado === false && (
                      <Badge variant="outline" className="text-[10px] bg-[#FEE2E2] text-[#DC2626] border-[#EF4444] gap-1">
                        <XCircle size={10} /> No logrado
                      </Badge>
                    )}
                    {entry.resultadoLogrado == null && (
                      <Badge variant="outline" className="text-[10px] text-[#6B7280] border-[#D1D5DB]">
                        Resultado pendiente
                      </Badge>
                    )}
                  </div>
                  {entry.indicador.descripcion && (
                    <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-2">{entry.indicador.descripcion}</p>
                  )}
                </div>
              </div>
            )}

            {entry.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {entry.attachments.map((file, idx) => (
                  <AttachmentChip key={idx} file={file} />
                ))}
              </div>
            )}

            {entry.replies && entry.replies.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[#E5E7EB] space-y-3">
                {entry.replies.map((reply, replyIdx) => (
                  <ReplyItem key={replyIdx} reply={reply} />
                ))}
              </div>
            )}

            {!isReplying ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => startReply(entry.id)}
                className="mt-2 text-xs text-[#6B7280] hover:text-[#3B82F6] gap-1 -ml-2"
              >
                <MessageSquare size={12} />
                Responder
              </Button>
            ) : (
              <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
                <Textarea
                  placeholder="Escribe una respuesta..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="bg-white border-[#E5E7EB] min-h-[70px] resize-none text-sm mb-2"
                  autoFocus
                />
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancelReply}
                    className="text-xs text-[#6B7280] gap-1"
                  >
                    <X size={12} />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onReply(entry.id)}
                    disabled={!replyText.trim() || submitting}
                    className="text-xs bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white gap-1"
                  >
                    <MessageSquare size={12} />
                    {submitting ? "Publicando…" : "Publicar respuesta"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
