import { useState } from 'react';
import {
  MessageSquare,
  Route,
  Clock,
  GitMerge,
  FolderKanban,
  FileText,
  UserPlus,
  Users,
  UserCircle,
  Calculator,
  KeyRound,
  HelpCircle,
  User,
  Package,
  PackagePlus,
  PackageCheck,
  LayoutDashboard,
  MapPin,
  Wallet,
  Receipt,
  Building,
  Share2,
  Shield,
  ChevronRight,
  ChevronLeft,
  type LucideIcon,
} from 'lucide-react';
import { LOGOS } from '@/data/constants';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  hasSubmenu?: boolean;
}

const ADMIN_NAV: NavItem[] = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'routes', label: 'Rutas', icon: Route, hasSubmenu: true },
  { id: 'schedule', label: 'Horario', icon: Clock },
  { id: 'matching', label: 'Matching', icon: GitMerge, hasSubmenu: true },
  { id: 'projects', label: 'Proyectos', icon: FolderKanban },
  { id: 'quotations', label: 'Cotizaciones', icon: FileText },
  { id: 'acquisition', label: 'Adquisición', icon: UserPlus },
  { id: 'affiliations', label: 'Afiliaciones', icon: Users, hasSubmenu: true },
  { id: 'customers', label: 'Clientes', icon: UserCircle, hasSubmenu: true },
  { id: 'accounting', label: 'Contabilidad', icon: Calculator, hasSubmenu: true },
  { id: 'update-password', label: 'Cambiar Contraseña', icon: KeyRound },
];

const CUSTOMER_NAV: NavItem[] = [
  { id: 'request-delivery', label: 'Solicitar Envío', icon: PackagePlus },
  { id: 'dedicated-delivery', label: 'Envío Dedicado', icon: Package },
  { id: 'previous-delivery', label: 'Envíos Anteriores', icon: PackageCheck },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'saved-address', label: 'Direcciones Guardadas', icon: MapPin },
  { id: 'wallet', label: 'Billetera', icon: Wallet },
  { id: 'invoice', label: 'Facturación', icon: Receipt },
  { id: 'branch-details', label: 'Detalles de Sucursal', icon: Building },
  { id: 'refer-contact', label: 'Referir Contacto', icon: Share2 },
  { id: 'admin', label: 'Admin', icon: Shield, hasSubmenu: true },
];

const BOTTOM_NAV: NavItem[] = [
  { id: 'faqs', label: 'Preguntas Frecuentes', icon: HelpCircle },
  { id: 'profile', label: 'Perfil Personal', icon: User },
];

interface AdminSidebarProps {
  expanded: boolean;
  onToggle: () => void;
  activeItem: string;
  onNavigate: (item: string) => void;
  variant?: 'customer' | 'admin';
}

export function AdminSidebar({
  expanded,
  onToggle,
  activeItem,
  onNavigate,
  variant = 'admin',
}: AdminSidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const navItems = variant === 'admin' ? ADMIN_NAV : CUSTOMER_NAV;

  return (
    <aside
      className={`flex flex-col h-screen flex-shrink-0 transition-all duration-300 ease-in-out bg-pr-yellow ${
        variant === 'admin' ? 'font-ui' : 'font-sans'
      } ${expanded ? 'w-64' : 'w-16'}`}
    >
      {/* Logo */}
      <div
        className={`flex items-center h-16 flex-shrink-0 ${
          expanded ? 'px-5' : 'justify-center'
        }`}
      >
        <img
          src={expanded ? LOGOS.fullBlack : LOGOS.isoBlack}
          alt="Partrunner"
          className={`flex-shrink-0 object-contain ${expanded ? 'h-8' : 'w-8 h-8'}`}
        />
      </div>

      {/* Separator */}
      <div className={`mx-3 border-t border-black/10`} />

      {/* Main navigation — scrollable */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {navItems.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={activeItem === item.id}
            expanded={expanded}
            hovered={hoveredItem === item.id}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={() => onNavigate(item.id)}
          />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-2 pb-2 space-y-0.5">
        <div className="mx-1 mb-1 border-t border-black/10" />
        {BOTTOM_NAV.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={activeItem === item.id}
            expanded={expanded}
            hovered={hoveredItem === item.id}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={() => onNavigate(item.id)}
          />
        ))}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className={`flex items-center h-12 border-t border-black/10 text-pr-black/60 hover:text-pr-black transition-colors ${
          expanded ? 'justify-end px-4' : 'justify-center'
        }`}
        aria-label={expanded ? 'Colapsar menú' : 'Expandir menú'}
      >
        {expanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>
    </aside>
  );
}

interface NavButtonProps {
  item: NavItem;
  active: boolean;
  expanded: boolean;
  hovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

function NavButton({
  item,
  active,
  expanded,
  hovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: NavButtonProps) {
  const Icon = item.icon;

  if (!expanded) {
    return (
      <button
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        title={item.label}
        className={`relative flex items-center justify-center w-full h-10 rounded-lg transition-colors ${
          active
            ? 'bg-white text-pr-black'
            : hovered
              ? 'bg-black/10 text-pr-black'
              : 'text-pr-black/70'
        }`}
      >
        <Icon size={20} strokeWidth={active ? 2.5 : 2} />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`flex items-center gap-3 w-full h-10 px-3 rounded-lg text-sm transition-colors ${
        active
          ? 'bg-white text-pr-black font-semibold'
          : hovered
            ? 'bg-black/10 text-pr-black'
            : 'text-pr-black/80'
      }`}
    >
      <Icon size={20} className="flex-shrink-0" strokeWidth={active ? 2.5 : 2} />
      <span className="truncate flex-1 text-left">{item.label}</span>
      {item.hasSubmenu && (
        <ChevronRight size={16} className="flex-shrink-0 opacity-50" />
      )}
    </button>
  );
}
