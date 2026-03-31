import React from "react";
import { Home, Search, ClipboardList, Store, Landmark } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const tabs = [
  { icon: Home, label: "Início", path: "/inicio" },
  { icon: Search, label: "Buscar", path: "/buscar" },
  { icon: ClipboardList, label: "Pedidos", path: "/pedidos" },
  { icon: Store, label: "Loja", path: "/marketplace" },
  { icon: Landmark, label: "Fazenda", path: "/fazenda" },
];

const BottomNav = React.forwardRef<HTMLElement, {}>((_props, ref) => {
  const { pathname } = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const legacyUser = localStorage.getItem("agroconnect_user");
      setIsAuthenticated(!!session || !!legacyUser);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session || !!localStorage.getItem("agroconnect_user"));
    });

    return () => subscription.unsubscribe();
  }, []);

  // Hide on public/auth pages
  const hiddenPaths = ["/admin", "/cadastro", "/login", "/onboarding"];
  const shouldHide = hiddenPaths.some(p => pathname.startsWith(p));
  // Hide on landing page when not authenticated
  if (pathname === "/" && !isAuthenticated) return null;
  if (!isAuthenticated || shouldHide) return null;

  return (
    <nav
      ref={ref}
      className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border md:hidden safe-bottom"
    >
      <div className="flex items-center justify-around h-[60px]">
        {tabs.map((tab) => {
          const active = pathname === tab.path || (tab.path !== "/inicio" && pathname.startsWith(tab.path));
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 relative rounded-xl transition-all duration-200 min-w-[56px] active:scale-[0.92] ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon size={22} strokeWidth={active ? 2.5 : 1.8} className="transition-all duration-200" />
              <span className={`text-[10px] leading-tight ${active ? "font-semibold" : "font-medium"}`}>{tab.label}</span>
              {active && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full bg-primary transition-all duration-200" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
});

BottomNav.displayName = "BottomNav";

export default BottomNav;
