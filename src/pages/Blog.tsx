import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowLeft } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import BlogCard from "@/components/BlogCard";
import { artigosMock, blogCategories } from "@/data/blogData";

export default function Blog() {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("Todos");

  const filtered = artigosMock.filter(a => {
    const matchCat = cat === "Todos" || a.categoria === cat;
    const matchSearch = !search || a.titulo.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <SEOHead title="Blog — AgroConnect" description="Conteúdo técnico para o produtor rural. Artigos sobre sanidade animal, solo, tecnologia agro e mais." />
      
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => window.history.back()} className="text-muted-foreground hover:text-foreground" aria-label="Voltar"><ArrowLeft size={20} /></button>
            <span className="font-medium">Blog</span>
          </div>
          <h1 className="text-xl font-medium">Conteúdo técnico para o produtor rural</h1>
          <div className="relative mt-3">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input className="input-field pl-10 !h-10" placeholder="Buscar artigos..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {blogCategories.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm border transition-colors ${cat === c ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground"}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {filtered.map(a => <BlogCard key={a.id} artigo={a} />)}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhum artigo encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
