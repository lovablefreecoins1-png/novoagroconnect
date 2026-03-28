export interface Provider {
  id: string;
  name: string;
  phone: string;
  category: string;
  categoryGroup: string;
  categorySecondary?: string;
  city: string;
  state: string;
  distance: number;
  rating: number;
  totalRatings: number;
  servicesCompleted: number;
  verified: boolean;
  premium: boolean;
  available: "now" | "week" | "busy";
  bio: string;
  photo: string;
  photos: string[];
  certifications: string[];
  radius: number;
  reviews: Review[];
}

export interface Review {
  id: string;
  authorName: string;
  city: string;
  rating: number;
  comment: string;
  date: string;
  asAgreed: boolean;
}

export interface Lead {
  id: string;
  produtor: string;
  cidade: string;
  descricao: string;
  categoria: string;
  data: string;
  status: "novo" | "respondido" | "arquivado";
  temFoto: boolean;
  temLocalizacao: boolean;
}

export interface MarketplaceItem {
  id: string;
  titulo: string;
  descricao: string;
  preco: number | null;
  categoria: string;
  cidade: string;
  estado: string;
  fotos: string[];
  vendedor: string;
  vendedorFoto: string;
  membroDesde: string;
  telefone: string;
  criadoEm: string;
}

// Empty — real data comes from the database
export const mockProviders: Provider[] = [];

export const mockLeads: Lead[] = [];

export const mockMarketplace: MarketplaceItem[] = [];

export const mockContracts: { id: string; produtor: string; cidade: string; servico: string; dataInicio: string; status: "negociacao" | "confirmado" | "concluido" | "cancelado" }[] = [];

export const mockMessages: { id: string; recipientName: string; recipientPhoto: string; lastMessage: string; time: string; unread: number }[] = [];
