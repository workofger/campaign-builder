import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';

interface AdminLayoutProps {
  variant?: 'customer' | 'admin';
}

export function AdminLayout({ variant = 'admin' }: AdminLayoutProps) {
  const [expanded, setExpanded] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const basePath = variant === 'customer' ? '/customer' : '/admin';

  const segments = location.pathname.replace(basePath, '').split('/').filter(Boolean);
  const activeItem = segments[0] || '';

  const handleNavigate = (item: string) => {
    navigate(`${basePath}/${item}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-pr-surface-light">
      <AdminSidebar
        expanded={expanded}
        onToggle={() => setExpanded((p) => !p)}
        activeItem={activeItem}
        onNavigate={handleNavigate}
        variant={variant}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
