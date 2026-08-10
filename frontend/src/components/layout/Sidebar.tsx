import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { ShoppingCart, Users, Package, BarChart3, LogOut, User, ChevronLeft, ChevronRight, Receipt } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useState, useEffect } from 'react';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const roleMap: Record<string, string> = {
  dueno: 'Dueño',
  cajero: 'Cajero'
};

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { isMobileCartOpen } = useUIStore();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', isCollapsed.toString());
  }, [isCollapsed]);

  const links = [
    { to: '/pos', label: 'Punto de Venta', icon: ShoppingCart, roles: ['cajero', 'dueno'] },
    { to: '/ventas', label: 'Ventas / Facturas', icon: Receipt, roles: ['cajero', 'dueno'] },
    { to: '/fiado', label: 'Fiado', icon: Users, roles: ['cajero', 'dueno'] },
    { to: '/inventario', label: 'Inventario', icon: Package, roles: ['dueno'] },
    { to: '/dashboard', label: 'Dashboard', icon: BarChart3, roles: ['dueno'] },
  ];

  const visibleLinks = links.filter(link => user && link.roles.includes(user.rol));
  const displayRole = user?.rol ? roleMap[user.rol] || user.rol : '';

  return (
    <aside className={cn(
      "bg-surface border-border transition-all duration-300 shrink-0 relative order-2 md:order-1",
      // Mobile styles: bottom bar, row layout, fixed height, border-top
      "w-full h-16 md:h-full border-t md:border-t-0 md:border-r flex-row md:flex-col shadow-[0_-4px_12px_rgba(0,0,0,0.05)] md:shadow-sm z-50",
      // Hide on mobile if cart is open
      isMobileCartOpen ? "hidden md:flex" : "flex",
      // Desktop width logic
      isCollapsed ? "md:w-[80px]" : "md:w-56 lg:w-[260px]"
    )}>
      
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-surface border border-border rounded-full p-1 text-muted hover:text-ink hover:border-primary shadow-sm hidden md:flex transition-colors z-20"
        title={isCollapsed ? "Expandir" : "Colapsar"}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className={cn(
        "p-4 md:p-6 items-center h-20 shrink-0 hidden md:flex", 
        isCollapsed ? "justify-center" : "justify-center md:justify-start"
      )}>
        <img src="/brand/colmao-logo.svg" alt="Colmao" className={cn("h-10 w-auto object-contain -ml-2", isCollapsed ? "hidden" : "block")} />
        <img src="/brand/colmao-icono.svg" alt="Colmao" className={cn("h-10 w-auto object-contain scale-110", isCollapsed ? "block" : "hidden")} />
      </div>

      {/* Mobile Logo (leftmost on bottom nav) */}
      <div className="md:hidden flex items-center justify-center pl-3 pr-2 shrink-0">
        <img src="/brand/colmao-icono.svg" alt="Colmao" className="h-9 w-auto object-contain scale-110" />
      </div>

      <nav className="flex-1 px-2 md:px-4 flex flex-row md:flex-col gap-1 md:gap-2 mt-0 md:mt-2 h-full items-center md:items-stretch justify-around md:justify-start">
        {visibleLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            title={link.label}
            className={({ isActive }) =>
              cn(
                'flex flex-col md:flex-row items-center gap-1 md:gap-3 py-1.5 md:py-3 rounded-lg text-[10px] md:text-[15px] font-bold transition-colors w-full md:w-auto h-full md:h-auto justify-center',
                isCollapsed ? 'md:justify-center px-1' : 'md:justify-start px-1 md:px-4',
                isActive
                  ? 'text-primary md:bg-primary/10'
                  : 'text-muted md:text-secondary hover:text-primary hover:md:bg-surface-2'
              )
            }
          >
            <link.icon className={cn(
              "shrink-0",
              "w-6 h-6 md:w-5 md:h-5"
            )} />
            <span className={cn("text-center leading-tight hidden md:inline", isCollapsed && "md:hidden")}>{link.label}</span>
            <span className="md:hidden text-center leading-tight truncate w-full px-0.5">{link.label.split(' ')[0]}</span>
          </NavLink>
        ))}
      </nav>

      <div className={cn("hidden md:block p-4 border-t border-border bg-surface-2/50 shrink-0", isCollapsed && "px-2")}>
        <div className={cn("flex items-center gap-3 mb-4", isCollapsed ? "justify-center" : "px-2")}>
          <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shrink-0" title={isCollapsed ? displayRole : undefined}>
            <User className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ink truncate">{user?.nombre}</p>
              <p className="text-xs font-bold text-muted uppercase tracking-wider">{displayRole}</p>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          title={isCollapsed ? "Salir" : undefined}
          className={cn(
            "flex items-center justify-center gap-2 py-3 rounded-xl text-error hover:bg-error/10 font-bold transition-colors w-full",
            !isCollapsed && "px-4"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Salir</span>}
        </button>
      </div>

      {/* Logout button for mobile (inside the bottom nav) */}
      <button
        onClick={logout}
        className="md:hidden flex flex-col items-center justify-center gap-1 py-1.5 px-2 text-muted hover:text-error h-full"
      >
        <LogOut className="w-6 h-6 shrink-0" />
        <span className="text-[10px] font-bold text-center leading-tight">Salir</span>
      </button>
    </aside>
  );
}
