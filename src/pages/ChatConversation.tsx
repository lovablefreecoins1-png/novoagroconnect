import { Link } from "react-router-dom";
import { ArrowLeft, MessageCircle } from "lucide-react";

export default function ChatConversation() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link to="/chat" className="text-muted-foreground hover:text-foreground" aria-label="Voltar"><ArrowLeft size={24} /></Link>
          <p className="text-[15px] font-medium">Conversa</p>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <MessageCircle size={48} className="mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-[15px] font-medium text-foreground">Conversa não encontrada</p>
          <p className="text-[15px] text-muted-foreground mt-1">Esta conversa não existe ou foi removida.</p>
          <Link to="/chat" className="btn-primary mt-4 inline-flex text-sm !min-h-[48px]">Voltar às conversas</Link>
        </div>
      </div>
    </div>
  );
}
