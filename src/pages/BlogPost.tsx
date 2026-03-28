import { useParams, Link } from "react-router-dom";
import { Clock, ArrowLeft, Search } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import BlogCard from "@/components/BlogCard";
import { artigosMock } from "@/data/blogData";
import ReactMarkdown from "react-markdown";

export default function BlogPost() {
  const { slug } = useParams();
  const artigo = artigosMock.find(a => a.slug === slug);

  if (!artigo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Artigo não encontrado.</p>
          <Link to="/blog" className="btn-primary mt-4 inline-flex">Voltar ao blog</Link>
        </div>
      </div>
    );
  }

  const related = artigosMock.filter(a => a.id !== artigo.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <SEOHead
        title={`${artigo.titulo} — AgroConnect`}
        description={artigo.resumo}
        ogType="article"
        canonical={`https://agroconnect.com.br/blog/${artigo.slug}`}
      />

      <div className="relative">
        <img src={artigo.imagem} alt={artigo.titulo} className="w-full h-48 md:h-64 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Link to="/blog" className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
          <ArrowLeft size={20} />
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-8 relative z-10">
        <div className="card-agro">
          <span className="badge-verified text-xs">{artigo.categoria}</span>
          <h1 className="text-lg md:text-xl font-medium mt-2 leading-snug">{artigo.titulo}</h1>
          <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
            <span>Por {artigo.autor}</span>
            <span>·</span>
            <span>{new Date(artigo.data).toLocaleDateString("pt-BR")}</span>
            <span>·</span>
            <Clock size={14} />
            <span>{artigo.tempoLeitura} min</span>
          </div>

          <div className="mt-6 prose prose-sm max-w-none prose-headings:font-medium prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground">
            <ReactMarkdown>{artigo.conteudo}</ReactMarkdown>
          </div>

          <div className="my-8 p-4 bg-primary/5 rounded-lg border border-primary/20 text-center">
            <p className="text-sm font-medium">Precisa de um profissional na sua região?</p>
            <Link to="/buscar" className="btn-primary mt-3 inline-flex gap-2">
              <Search size={18} /> Buscar profissionais perto de mim
            </Link>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-medium mb-4">Artigos relacionados</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {related.map(a => <BlogCard key={a.id} artigo={a} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
