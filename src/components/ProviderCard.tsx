import { Star, CheckCircle, MessageCircle, MapPin, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import type { Provider } from "@/data/mockData";

interface ProviderCardProps {
  provider: Provider;
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  const whatsappUrl = `https://wa.me/${provider.phone}?text=${encodeURIComponent(
    `Olá ${provider.name}, encontrei você no AgroConnect e gostaria de um orçamento.`
  )}`;

  return (
    <div className="card-agro">
      <div className="flex gap-3.5">
        <img
          src={provider.photo}
          alt={provider.name}
          className="h-14 w-14 rounded-full object-cover flex-shrink-0"
          loading="lazy"
          width={56}
          height={56}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-[16px] text-foreground truncate">{provider.name}</h3>
            <span className="text-[13px] text-muted-foreground whitespace-nowrap flex-shrink-0">
              {provider.distance} km
            </span>
          </div>
          <p className="text-[15px] text-muted-foreground mt-0.5">{provider.category}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {provider.verified && (
              <span className="badge-verified">
                <CheckCircle size={12} />
                Verificado ✓
              </span>
            )}
            {provider.available === "now" && (
              <span className="badge-online">
                <span className="dot" />
                Online agora
              </span>
            )}
            {provider.premium && <span className="badge-premium">Premium ★</span>}
          </div>
        </div>
      </div>

      <div className="border-t border-border mt-3.5 pt-3">
        <div className="flex items-center gap-3 text-[15px]">
          <div className="flex items-center gap-1">
            <Star size={16} className="fill-secondary text-secondary" />
            <span className="font-medium">{provider.rating.toFixed(1)}</span>
          </div>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{provider.totalRatings} avaliações</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground flex items-center gap-1">
            <MapPin size={14} />
            {provider.city}, {provider.state}
          </span>
        </div>
      </div>

      <div className="border-t border-border mt-3 pt-3 flex gap-2.5">
        <Link to={`/perfil-prestador/${provider.id}`} className="btn-secondary flex-1 !min-h-[48px] !text-[15px]">
          <Eye size={18} />
          Ver perfil
        </Link>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp flex-1 !min-h-[48px] !text-[15px]"
        >
          <MessageCircle size={18} />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
