import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import BottomNav from "@/components/BottomNav";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import AuthRedirect from "@/components/AuthRedirect";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Inicio from "./pages/Inicio";
import Pedidos from "./pages/Pedidos";
import Fazenda from "./pages/Fazenda";
import ProviderProfile from "./pages/ProviderProfile";
import Cadastro from "./pages/Cadastro";
import CadastroProdutor from "./pages/CadastroProdutor";
import CadastroPrestador from "./pages/CadastroPrestador";
import CadastroAmbos from "./pages/CadastroAmbos";
import Login from "./pages/Login";
import ChatList from "./pages/ChatList";
import ChatConversation from "./pages/ChatConversation";
import Orcamento from "./pages/Orcamento";
import Avaliar from "./pages/Avaliar";
import Marketplace from "./pages/Marketplace";
import MarketplaceNovo from "./pages/MarketplaceNovo";
import MarketplaceDetalhe from "./pages/MarketplaceDetalhe";
import Perfil from "./pages/Perfil";
import Admin from "./pages/Admin";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Indicar from "./pages/Indicar";
import Laudos from "./pages/Laudos";
import LaudoDetalhe from "./pages/LaudoDetalhe";
import NotificacoesDemanda from "./pages/NotificacoesDemanda";
import BuscarCidade from "./pages/BuscarCidade";
import Clima from "./pages/Clima";
import MeusServicos from "./pages/MeusServicos";
import NotFound from "./pages/NotFound";
import { Suspense } from "react";

const queryClient = new QueryClient();

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground animate-pulse">Carregando...</p>
    </div>
  );
}

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PWAInstallBanner />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public / Landing */}
              <Route path="/" element={<AuthRedirect><Index /></AuthRedirect>} />
              <Route path="/login" element={<AuthRedirect><Login /></AuthRedirect>} />
              <Route path="/cadastro" element={<AuthRedirect><Cadastro /></AuthRedirect>} />
              <Route path="/cadastro/produtor" element={<AuthRedirect><CadastroProdutor /></AuthRedirect>} />
              <Route path="/cadastro/prestador" element={<CadastroPrestador />} />
              <Route path="/cadastro/ambos" element={<CadastroAmbos />} />

              {/* Unified Panel - 5 main tabs */}
              <Route path="/inicio" element={<Inicio />} />
              <Route path="/buscar" element={<Home />} />
              <Route path="/buscar/:cidadeEstado" element={<BuscarCidade />} />
              <Route path="/pedidos" element={<Pedidos />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/fazenda" element={<Fazenda />} />

              {/* Secondary pages */}
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/perfil-prestador/:id" element={<ProviderProfile />} />
              <Route path="/chat" element={<ChatList />} />
              <Route path="/chat/:id" element={<ChatConversation />} />
              <Route path="/orcamento/:prestadorId" element={<Orcamento />} />
              <Route path="/avaliar/:servicoId" element={<Avaliar />} />
              <Route path="/criar-anuncio" element={<MarketplaceNovo />} />
              <Route path="/marketplace/novo" element={<MarketplaceNovo />} />
              <Route path="/marketplace/laudos" element={<Laudos />} />
              <Route path="/marketplace/laudos/:id" element={<LaudoDetalhe />} />
              <Route path="/marketplace/:id" element={<MarketplaceDetalhe />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/indicar" element={<Indicar />} />
              <Route path="/notificacoes-demanda" element={<NotificacoesDemanda />} />
              <Route path="/clima" element={<Clima />} />
              <Route path="/meus-servicos" element={<MeusServicos />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/verificacoes" element={<Admin />} />

              {/* Legacy panel redirects */}
              <Route path="/produtor" element={<Inicio />} />
              <Route path="/produtor/*" element={<Inicio />} />
              <Route path="/prestador" element={<Inicio />} />
              <Route path="/prestador/*" element={<Inicio />} />
              <Route path="/ambos" element={<Inicio />} />
              <Route path="/ambos/*" element={<Inicio />} />
              <Route path="/painel" element={<Inicio />} />
              <Route path="/painel/*" element={<Inicio />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <BottomNav />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
