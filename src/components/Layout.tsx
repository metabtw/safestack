import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Scan, PlusCircle, Settings } from 'lucide-react';

export function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans text-text-main">
      {/* Medical Disclaimer - Always visible */}
      <div className="bg-[#FEF2F2] text-[#991B1B] p-3 text-center text-[16px] font-semibold border-b-2 border-[#FEE2E2]">
        ⚠️ Bu uygulama tıbbi tavsiye değildir, lütfen doktorunuza danışın.
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-md mx-auto bg-transparent relative pb-24 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full max-w-md left-1/2 -translate-x-1/2 bg-white border-t border-border flex justify-around items-center h-[88px] px-4 pb-safe z-50">
        <NavItem to="/" icon={<Home size={28} />} label="Ana Sayfa" active={location.pathname === '/'} />
        <NavItem to="/scan" icon={<Scan size={28} />} label="Tara" active={location.pathname === '/scan'} />
        <NavItem to="/stack/new" icon={<PlusCircle size={28} />} label="Yeni" active={location.pathname === '/stack/new'} />
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label, active }: { to: string, icon: React.ReactNode, label: string, active: boolean }) {
  return (
    <Link to={to} className={`flex flex-col items-center justify-center w-20 h-full ${active ? 'text-primary' : 'text-text-muted'}`}>
      <div className="mb-1">{icon}</div>
      <span className="text-[16px] font-semibold">{label}</span>
    </Link>
  );
}
