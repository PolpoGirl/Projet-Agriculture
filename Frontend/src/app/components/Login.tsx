  import { useState } from 'react';
  import { Eye, EyeOff, Mail, Lock, ArrowRight, Globe, Sprout, AlertCircle } from 'lucide-react';
  import { useNavigate } from 'react-router';
  import { useLanguage } from '../contexts/LanguageContext';
  import { useAuth } from '../contexts/AuthContext';

  export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState('');
    const [loading, setLoading] = useState(false);

    const { lang, setLang, t } = useLanguage();
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (!username || !password) {
        setError(
          lang === 'fr'
            ? 'Veuillez remplir tous les champs'
            : 'Please fill all fields'
        );
        return;
      }

      setLoading(true);

      try {
        const res = await login(username, password);

        if (!res.success) {
          setError(
            lang === 'fr'
              ? res.message || 'Erreur de connexion'
              : res.message || 'Login failed'
          );
          return;
        }

        const user = res.user;
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/user/dashboard');
        }
      } catch {
        setError(
          lang === 'fr'
            ? 'Erreur serveur. Veuillez réessayer.'
            : 'Server error. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="flex min-h-screen bg-gradient-to-br from-green-50 to-gray-50">

        {/* ====== CÔTÉ GAUCHE — desktop uniquement, inchangé ====== */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-green-700 items-center justify-center">
          <div className="text-center text-white px-8">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 p-6 rounded-full">
                <Sprout size={72} className="text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Agriculture Intelligente</h1>
            <p className="text-green-100 text-lg">
              {lang === 'fr'
                ? 'Gérez vos cultures avec intelligence et précision.'
                : 'Manage your crops with intelligence and precision.'}
            </p>
          </div>
        </div>

        {/* ====== CÔTÉ DROIT / PLEIN ÉCRAN MOBILE ====== */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-hidden min-h-screen lg:min-h-0">

          {/* ── Décorations : visibles sur MOBILE et desktop ── */}

       {/* Coin haut gauche */}
<div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-green-200/30 border border-green-300/40 pointer-events-none" />

{/* Coin haut droit */}
<div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-green-200/25 border border-green-300/35 pointer-events-none" />

{/* Coin bas gauche */}
<div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-green-200/28 border border-green-300/38 pointer-events-none" />

{/* Coin bas droit */}
<div className="absolute -bottom-14 -right-14 w-52 h-52 rounded-full bg-green-200/20 border border-green-300/30 pointer-events-none" />

          {/* ── Formulaire ── */}
          <div className="max-w-md w-full relative z-10">

            {/* En-tête */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center mb-4 lg:hidden">
                <div className="bg-green-600 p-4 rounded-full">
                  <Sprout size={48} className="text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {lang === 'fr' ? 'Connexion' : 'Sign In'}
              </h2>
              <p className="text-gray-500 text-sm">
                {lang === 'fr'
                  ? 'Accédez à votre espace agricole. (admin:admin/user:user)'
                  : 'Access your agricultural space'}
              </p>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Username */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('username')}
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${
                    focusedField === 'username' ? 'text-green-500' : 'text-gray-400'
                  }`}>
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(''); }}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField('')}
                    placeholder={lang === 'fr' ? 'Entrez votre identifiant' : 'Enter your username'}
                    className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 focus:outline-none hover:border-gray-300"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('password')}
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${
                    focusedField === 'password' ? 'text-green-500' : 'text-gray-400'
                  }`}>
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField('')}
                    placeholder="••••••••"
                    className="block w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 focus:outline-none hover:border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center group"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {lang === 'fr' ? 'Connexion en cours...' : 'Signing in...'}
                    </>
                  ) : (
                    <>
                      {t('loginButton')}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </div>

            </form>

            {/* Language Toggle */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
                className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-green-600 transition-colors duration-200 text-sm"
              >
                <Globe size={18} />
                {lang === 'fr' ? 'English' : 'Français'}
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }