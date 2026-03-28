import { Link } from "react-router-dom";
import { Clock } from "lucide-react";

interface BlogCardProps {
  artigo: {
    slug: string;
    titulo: string;
    resumo: string;
    categoria: string;
    autor: string;
    data: string;
    tempoLeitura: number;
    imagem: string;
  };
}

export default function BlogCard({ artigo }: BlogCardProps) {
  return (
    <Link to={`/blog/${artigo.slug}`} className="card-agro overflow-hidden group block">
      <img src={artigo.imagem} alt={artigo.titulo} className="w-full h-40 object-cover -mx-[18px] -mt-[18px] mb-3" style={{ width: "calc(100% + 36px)" }} />
      <span className="badge-verified text-xs">{artigo.categoria}</span>
      <h3 className="font-medium mt-2 text-[15px] leading-snug group-hover:text-primary transition-colors">{artigo.titulo}</h3>
      <p className="text-[14px] text-muted-foreground mt-1.5 line-clamp-2">{artigo.resumo}</p>
      <div className="flex items-center gap-2 mt-3 text-[13px] text-muted-foreground">
        <span>Por {artigo.autor}</span>
        <span>·</span>
        <Clock size={13} />
        <span>{artigo.tempoLeitura} min</span>
      </div>
    </Link>
  );
}
