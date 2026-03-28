import { useEffect, useState } from "react";
import { Check, Download, PlusSquare, Share, Smartphone, X } from "lucide-react";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useToast } from "@/hooks/use-toast";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "pwa_install_dismissed_permanently";

export default function PWAInstallBanner() {
  const { toast } = useToast();
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || (navigator as any).standalone === true
      || document.referrer.includes("android-app://");
    const mobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
    const permanentlyDismissed = localStorage.getItem(DISMISS_KEY) === "true";

    setIsIOS(ios);
    setIsInstalled(standalone);

    // If already installed as PWA, permanently dismiss and never show again
    if (standalone) {
      localStorage.setItem(DISMISS_KEY, "true");
      return;
    }

    if (!mobile || permanentlyDismissed) return;

    const handleBeforeInstallPrompt = (event: Event) => {
      const installEvent = event as InstallPromptEvent;
      installEvent.preventDefault();
      setDeferredPrompt(installEvent);
      setShowBanner(true);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
      localStorage.setItem(DISMISS_KEY, "true");
      toast({ title: "App instalado com sucesso! Procure o ícone verde na sua tela." });
    };

    const handleOpenInstall = () => {
      if (permanentlyDismissed) return;
      setShowInstallModal(true);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    window.addEventListener("agroconnect:open-install", handleOpenInstall);

    if (ios) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      window.removeEventListener("agroconnect:open-install", handleOpenInstall);
    };
  }, [toast]);

  const handleInstall = async () => {
    if (isIOS) {
      setShowInstallModal(true);
      return;
    }

    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setShowBanner(false);
        localStorage.setItem(DISMISS_KEY, "true");
      }

      setDeferredPrompt(null);
      return;
    }

    setShowInstallModal(true);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "true");
    setShowBanner(false);
  };

  if (!showBanner || isInstalled) return null;

  return (
    <>
      <div className="border-b border-border bg-[hsl(var(--primary-bg))] px-4 py-3.5">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Smartphone size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-medium text-foreground leading-tight">
              Instale o AgroConnect no seu celular
            </p>
            <p className="mt-0.5 text-[15px] text-muted-foreground leading-snug">
              Fica na tela do seu celular e abre mais rápido
            </p>
          </div>
          <button
            onClick={handleInstall}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-4 text-[15px] font-medium text-primary-foreground whitespace-nowrap active:scale-[0.98]"
          >
            Instalar agora
          </button>
          <button onClick={handleDismiss} className="p-1.5 text-muted-foreground" aria-label="Fechar aviso de instalação">
            <X size={18} />
          </button>
        </div>
      </div>

      <Drawer open={showInstallModal} onOpenChange={setShowInstallModal}>
        <DrawerContent className="bg-card">
          <DrawerHeader className="px-6 pb-2 text-left">
            <DrawerTitle className="text-[24px] font-medium text-foreground">Como instalar no seu celular</DrawerTitle>
            <p className="mt-1 text-[15px] text-muted-foreground">
              {isIOS ? "Siga os 3 passos abaixo — é rápido e gratuito" : "Siga os passos abaixo e deixe o AgroConnect na sua tela inicial"}
            </p>
          </DrawerHeader>

          <div className="space-y-0 px-6 pb-8">
            <div className="flex items-start gap-4 border-b border-border py-5">
              <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-primary text-[16px] font-medium text-primary-foreground">1</span>
              <div>
                <p className="text-[15px] font-medium text-foreground">
                  {isIOS ? "Toque no botão de compartilhar" : "Abra o menu do navegador"}
                </p>
                <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
                  {isIOS
                    ? "Fica na barra de baixo do Safari. Parece uma caixa com uma seta saindo pra cima."
                    : "No Android, ele costuma ficar no canto de cima. Procure os 3 pontinhos do navegador."}
                </p>
                <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-primary">
                  {isIOS ? <Share size={20} /> : <Download size={20} />}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 border-b border-border py-5">
              <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-primary text-[16px] font-medium text-primary-foreground">2</span>
              <div>
                <p className="text-[15px] font-medium text-foreground">
                  {isIOS ? 'Toque em "Adicionar à Tela de Início"' : 'Toque em "Instalar app" ou "Adicionar à tela inicial"'}
                </p>
                <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
                  {isIOS
                    ? "Role a lista para baixo até encontrar essa opção. Tem um quadradinho com um + do lado."
                    : "Se aparecer essa opção, toque nela. Em alguns celulares o nome pode mudar um pouco."}
                </p>
                <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-primary">
                  <PlusSquare size={20} />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 py-5">
              <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-primary text-[16px] font-medium text-primary-foreground">3</span>
              <div>
                <p className="text-[15px] font-medium text-foreground">
                  {isIOS ? 'Toque em "Adicionar" no canto direito' : "Confirme a instalação"}
                </p>
                <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
                  {isIOS
                    ? "O ícone do AgroConnect vai aparecer direto na tela do seu celular. Pronto!"
                    : "Pronto. O ícone do AgroConnect vai aparecer na tela do seu celular para abrir mais rápido."}
                </p>
                <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary-bg))] text-primary">
                  <Check size={20} />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <DrawerClose asChild>
                <button className="btn-primary w-full">Entendido, vou instalar agora</button>
              </DrawerClose>
              <DrawerClose asChild>
                <button onClick={handleDismiss} className="w-full py-2 text-center text-[15px] text-muted-foreground">Agora não</button>
              </DrawerClose>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
