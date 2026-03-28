import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import LaudoCard from "@/components/LaudoCard";
import { laudosMock, laudoCategories } from "@/data/laudosData";

export default function Laudos() {
  const [cat, setCat] = useState("Todos");

  const filtered = laudosMock.filter(l => cat === "Todos" || l.tipo.includes(cat));

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <SEOHead title="Laudos Técnicos — AgroConnect" description="Solicite laudos de solo, receituários agronômicos e laudos fitossanitários online com agrônomos registrados no CREA." />

      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <button onClick={() => window.history.back()} className="text-muted-foreground hover:text-foreground mb-1" aria-label="Voltar"><ArrowLeft size={20} /></button>
          <h1 className="text-xl font-medium mt-1">Laudos e Receituários Agronômicos</h1>
          <p className="text-sm text-muted-foreground mt-1">Documentos técnicos emitidos por agrônomos registrados no CREA/CFO</p>
          <span className="badge-premium text-xs mt-2 inline-block">Emissão em até 48h</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {laudoCategories.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm border transition-colors ${cat === c ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground"}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {filtered.map(l => <LaudoCard key={l.id} laudo={l} />)}
        </div>
      </div>
    </div>
  );
}
