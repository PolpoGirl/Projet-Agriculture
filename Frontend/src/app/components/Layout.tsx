import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Sliders, History, LogOut, Globe, Menu, X } from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import InstallButton from './InstallButton';
import { Navigate } from 'react-router';

export default function Layout() {
  const { lang, setLang, t } = useLanguage();
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Protection : redirige si non connecté
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-green-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="flex items-center gap-2 text-lg font-semibold">
              <LayoutDashboard size={24} />
              <span className="hidden sm:inline">Agriculture Intelligente</span>
              <span className="sm:hidden">Agriculture Intelligente</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <nav className="hidden md:flex items-center gap-2 flex-wrap">
              <Link
                to="/user/dashboard"
                className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${
                  isActive('/user/dashboard') ? 'bg-green-800' : 'hover:bg-green-600'
                }`}
              >
                <LayoutDashboard size={18} />
                {t('dashboard')}
              </Link>
              <Link
                to="/user/actuators"
                className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${
                  isActive('/user/actuators') ? 'bg-green-800' : 'hover:bg-green-600'
                }`}
              >
                <Sliders size={18} />
                {t('actuators')}
              </Link>
              <Link
                to="/user/history"
                className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${
                  isActive('/user/history') ? 'bg-green-800' : 'hover:bg-green-600'
                }`}
              >
                <History size={18} />
                {t('history')}
              </Link>

              <button
                onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
                className="px-3 py-2 rounded hover:bg-green-600 flex items-center gap-2"
              >
                <Globe size={18} />
                {lang.toUpperCase()}
              </button>

              {/* Bouton compact dans la navbar — affiche uniquement le bouton, sans texte d'aide */}
              <InstallButton compact />

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 flex items-center gap-2"
              >
                <LogOut size={18} />
                {t('logout')}
              </button>
            </nav>

            <NotificationCenter />

            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded hover:bg-green-600 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-green-800 border-t border-green-600">
            <nav className="container mx-auto px-4 py-2 flex flex-col">
              <Link
                to="/user/dashboard"
                onClick={closeMenu}
                className={`px-4 py-3 rounded flex items-center gap-2 transition-colors ${
                  isActive('/user/dashboard') ? 'bg-green-900' : 'hover:bg-green-700'
                }`}
              >
                <LayoutDashboard size={18} />
                {t('dashboard')}
              </Link>
              <Link
                to="/user/actuators"
                onClick={closeMenu}
                className={`px-4 py-3 rounded flex items-center gap-2 transition-colors ${
                  isActive('/user/actuators') ? 'bg-green-900' : 'hover:bg-green-700'
                }`}
              >
                <Sliders size={18} />
                {t('actuators')}
              </Link>
              <Link
                to="/user/history"
                onClick={closeMenu}
                className={`px-4 py-3 rounded flex items-center gap-2 transition-colors ${
                  isActive('/user/history') ? 'bg-green-900' : 'hover:bg-green-700'
                }`}
              >
                <History size={18} />
                {t('history')}
              </Link>

              {/* Bouton compact dans le menu mobile aussi */}
              <div className="px-4 py-3">
                <InstallButton compact />
              </div>

              <div className="flex gap-2 pt-2 border-t border-green-600 mt-2">
                <button
                  onClick={() => { setLang(lang === 'fr' ? 'en' : 'fr'); closeMenu(); }}
                  className="flex-1 px-4 py-3 rounded hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Globe size={18} />
                  {lang.toUpperCase()}
                </button>

                <button
                  onClick={() => { handleLogout(); closeMenu(); }}
                  className="flex-1 px-4 py-3 rounded bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <LogOut size={18} />
                  {t('logout')}
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>

      <footer className="bg-green-700 text-white text-center py-4 mt-auto">
        <p className="text-sm">© 2026 Agriculture Intelligente</p>
      </footer>
    </div>
  );
}