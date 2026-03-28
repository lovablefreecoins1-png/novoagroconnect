import { Link } from "react-router-dom";
import { ArrowLeft, MessageCircle } from "lucide-react";

export default function ChatList() {
  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground" aria-label="Voltar"><ArrowLeft size={24} /></Link>
          <h1 className="text-lg font-medium">Conversas</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        <div className="text-center py-16 px-4">
          <MessageCircle size={48} className="mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-[15px] font-medium text-foreground">Você ainda não tem conversas</p>
          <p className="text-[15px] text-muted-foreground mt-1">Busque um prestador para começar uma conversa.</p>
          <Link to="/buscar" className="btn-primary mt-4 inline-flex text-sm !min-h-[48px]">Buscar prestador</Link>
        </div>
      </div>
    </div>
  );
}
