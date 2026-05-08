import { Link, Outlet, useNavigate, useLocation } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Sliders, History, LogOut, Globe,
  Users, FileText, Menu, X, Leaf, Settings
} from 'lucide-react';
import { useState, useEffect } from 'react';
import NotificationCenter from './NotificationCenter';
import { Navigate } from 'react-router';

export default function AdminLayout() {
  const { lang, setLang, t } = useLanguage();
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Protection admin : redirige si non connecté ou non admin
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (currentUser.role !== 'admin') {
    return <Navigate to="/user/dashboard" replace />;
  }

  // Détecte si on est en mode mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false); // Sidebar fermée par défaut sur mobile
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Ferme la sidebar quand on navigue sur mobile
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { path: '/admin/actuators', icon: Sliders,          label: t('actuators') },
    { path: '/admin/history',   icon: History,           label: t('history') },
    { path: '/admin/logs',      icon: FileText,          label: 'Logs Actionneurs' },
    { path: '/admin/users',     icon: Users,             label: 'Utilisateurs' },
    { path: '/admin/settings',  icon: Settings,          label: 'Paramètres' },
  ];

  const activeItem = menuItems.find(item => isActive(item.path));

  // ─── Contenu de la sidebar (partagé entre desktop & mobile) ──────────────
  const SidebarContent = () => (
    <>
      {/* ── Logo / Toggle ── */}
      <div className="flex items-center h-16 flex-shrink-0 border-b border-white/10 px-4 justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-white/15 p-2 rounded-xl ring-1 ring-white/20">
            <Leaf size={16} className="text-emerald-200" />
          </div>
          <div>
            <p className="font-bold text-sm text-white tracking-wide leading-tight">AgriSmart</p>
            <p className="text-[10px] text-green-300/80 tracking-widest uppercase">Admin Panel</p>
          </div>
        </div>
        {/* Bouton fermer : sur desktop change le mode, sur mobile ferme l'overlay */}
        <button
          onClick={() => isMobile ? setSidebarOpen(false) : setSidebarOpen(false)}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors text-green-300 hover:text-white"
        >
          <X size={17} />
        </button>
      </div>

      {/* ── Nav items ── */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] text-green-400/60 uppercase tracking-widest px-3 pb-2 font-semibold">
          Navigation
        </p>
        {menuItems.map(item => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 rounded-xl transition-all duration-150 group px-3 py-2.5
                ${active
                  ? 'bg-white/15 text-white font-semibold shadow-sm shadow-black/10'
                  : 'text-green-200/80 hover:bg-white/8 hover:text-white'
                }
              `}
            >
              <div className={`
                flex-shrink-0 p-1.5 rounded-lg transition-all duration-150
                ${active ? 'bg-emerald-400/20 text-emerald-200' : 'text-green-300/70 group-hover:text-white'}
              `}>
                <Icon size={16} />
              </div>
              <span className="text-sm truncate">{item.label}</span>
              {active && (
                <div className="ml-auto flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer sidebar ── */}
      <div className="border-t border-white/10 px-2 py-3 space-y-0.5 flex-shrink-0">
        {/* User card */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 mb-1 bg-white/8 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-emerald-500/40 ring-2 ring-emerald-400/30 flex items-center justify-center text-xs font-bold text-emerald-100 flex-shrink-0">
            {currentUser?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{currentUser?.username}</p>
            <p className="text-xs text-emerald-300/80 capitalize">{currentUser?.role}</p>
          </div>
        </div>

        {/* Language toggle */}
        <button
          onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
          className="w-full flex items-center gap-3 rounded-xl py-2.5 px-3 text-green-200/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
        >
          <Globe size={16} className="flex-shrink-0" />
          <span className="text-sm">{lang === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}</span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-xl py-2.5 px-3 text-red-300/80 hover:bg-red-500/15 hover:text-red-200 transition-colors cursor-pointer"
        >
          <LogOut size={16} className="flex-shrink-0" />
          <span className="text-sm">{t('logout')}</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/30 to-teal-50/20 flex">

      {/* ══════════════ SIDEBAR DESKTOP (sticky, collapsible) ══════════════ */}
      {!isMobile && (
        <aside
          className={`
            flex-shrink-0 flex flex-col
            transition-all duration-300 ease-in-out overflow-hidden
            ${sidebarOpen ? 'w-64' : 'w-[72px]'}
          `}
          style={{
            height: '100vh',
            position: 'sticky',
            top: 0,
            background: 'linear-gradient(180deg, #14532d 0%, #166534 60%, #15803d 100%)',
          }}
        >
          {/* Version desktop : bouton toggle dans le header */}
          <div className={`
            flex items-center h-16 flex-shrink-0 border-b border-white/10
            ${sidebarOpen ? 'px-4 justify-between' : 'justify-center'}
          `}>
            {sidebarOpen && (
              <div className="flex items-center gap-2.5">
                <div className="bg-white/15 p-2 rounded-xl ring-1 ring-white/20">
                  <Leaf size={16} className="text-emerald-200" />
                </div>
                <div>
                  <p className="font-bold text-sm text-white tracking-wide leading-tight">AgriSmart</p>
                  <p className="text-[10px] text-green-300/80 tracking-widest uppercase">Admin Panel</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors text-green-300 hover:text-white flex-shrink-0"
            >
              {sidebarOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>

          {/* Nav items desktop */}
          <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-hidden">
            {sidebarOpen && (
              <p className="text-[10px] text-green-400/60 uppercase tracking-widest px-3 pb-2 font-semibold">
                Navigation
              </p>
            )}
            {menuItems.map(item => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={!sidebarOpen ? item.label : ''}
                  className={`
                    flex items-center gap-3 rounded-xl transition-all duration-150 group
                    ${sidebarOpen ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center'}
                    ${active
                      ? 'bg-white/15 text-white font-semibold shadow-sm shadow-black/10'
                      : 'text-green-200/80 hover:bg-white/8 hover:text-white'
                    }
                  `}
                >
                  <div className={`
                    flex-shrink-0 p-1.5 rounded-lg transition-all duration-150
                    ${active ? 'bg-emerald-400/20 text-emerald-200' : 'text-green-300/70 group-hover:text-white'}
                  `}>
                    <Icon size={16} />
                  </div>
                  {sidebarOpen && <span className="text-sm truncate">{item.label}</span>}
                  {sidebarOpen && active && (
                    <div className="ml-auto flex items-center gap-1 flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer desktop */}
          <div className="border-t border-white/10 px-2 py-3 space-y-0.5 flex-shrink-0">
            {sidebarOpen ? (
              <div className="flex items-center gap-2.5 px-3 py-2.5 mb-1 bg-white/8 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-emerald-500/40 ring-2 ring-emerald-400/30 flex items-center justify-center text-xs font-bold text-emerald-100 flex-shrink-0">
                  {currentUser?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">{currentUser?.username}</p>
                  <p className="text-xs text-emerald-300/80 capitalize">{currentUser?.role}</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center py-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-emerald-500/40 ring-2 ring-emerald-400/30 flex items-center justify-center text-xs font-bold text-emerald-100">
                  {currentUser?.username?.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
            <button
              onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              className={`w-full flex items-center gap-3 rounded-xl py-2.5 text-green-200/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer ${sidebarOpen ? 'px-3' : 'justify-center px-0'}`}
            >
              <Globe size={16} className="flex-shrink-0" />
              {sidebarOpen && <span className="text-sm">{lang === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}</span>}
            </button>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 rounded-xl py-2.5 text-red-300/80 hover:bg-red-500/15 hover:text-red-200 transition-colors cursor-pointer ${sidebarOpen ? 'px-3' : 'justify-center px-0'}`}
            >
              <LogOut size={16} className="flex-shrink-0" />
              {sidebarOpen && <span className="text-sm">{t('logout')}</span>}
            </button>
          </div>
        </aside>
      )}

      {/* ══════════════ SIDEBAR MOBILE (overlay) ══════════════ */}
      {isMobile && (
        <>
          {/* Backdrop semi-transparent */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar en drawer */}
          <aside
            className={`
              fixed top-0 left-0 h-full w-72 z-50 flex flex-col
              transition-transform duration-300 ease-in-out
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
            style={{
              background: 'linear-gradient(180deg, #14532d 0%, #166534 60%, #15803d 100%)',
            }}
          >
            <SidebarContent />
          </aside>

          {/* ── Bouton hamburger flottant ── */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="fixed bottom-6 left-4 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-transform active:scale-95"
              style={{ background: 'linear-gradient(135deg, #166534, #15803d)' }}
              aria-label="Ouvrir le menu"
            >
              <Menu size={20} />
            </button>
          )}
        </>
      )}

      {/* ══════════════ CONTENU PRINCIPAL ══════════════ */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Topbar ── */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-green-100 px-6 py-0 flex-shrink-0 sticky top-0 z-10">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">AgriSmart</span>
                <span className="text-gray-300">/</span>
                <span className="font-semibold text-green-800">
                  {activeItem?.label ?? 'Administration'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationCenter />
              <div className="hidden sm:flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-xs font-medium text-green-700">Système actif</span>
              </div>
              <div className="text-xs text-gray-400 hidden md:block">
                {new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
                  weekday: 'short', day: 'numeric', month: 'short'
                })}
              </div>
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>

        {/* ── Footer ── */}
        <footer className="bg-white/60 border-t border-green-100 text-center py-3 text-xs text-gray-400 flex-shrink-0">
          © 2026 Agriculture Intelligente — Admin Panel
        </footer>
      </div>
    </div>
  );
}
