import { useState } from 'react';
import { Loader2, Mail } from 'lucide-react';
import { LOGOS } from '@/data/constants';

interface LoginPageProps {
  onSignInWithGoogle: () => Promise<void>;
  onSignInWithEmail: (email: string, password: string) => Promise<void>;
}

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function LoginPage({ onSignInWithGoogle, onSignInWithEmail }: LoginPageProps) {
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await onSignInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSignInWithEmail(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <img src={LOGOS.fullColor} alt="Partrunner" className="h-10 mx-auto mb-5" />
          <h1 className="font-display text-3xl text-pr-yellow tracking-wide">
            CAMPAIGN BUILDER
          </h1>
          <p className="text-white/50 mt-2 font-sans text-sm">
            Herramienta interna del equipo de growth
          </p>
        </div>

        <div className="space-y-3">
          {/* Google OAuth — primary */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white text-black font-medium py-3 px-4 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading && !showEmail ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continuar con Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <button
              onClick={() => setShowEmail(!showEmail)}
              className="text-white/30 text-xs hover:text-white/50 transition-colors"
            >
              {showEmail ? 'ocultar' : 'o usa email y contraseña'}
            </button>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Email/password — secondary */}
          {showEmail && (
            <form onSubmit={handleEmailSignIn} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-pr-yellow/50 transition-colors"
                placeholder="tu@partrunner.com"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-pr-yellow/50 transition-colors"
                placeholder="Contraseña"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white/10 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-white/15 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {loading && showEmail ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Mail size={16} />
                )}
                Iniciar sesión
              </button>
            </form>
          )}

          {error && (
            <div className="bg-pr-danger/10 border border-pr-danger/30 rounded-lg px-4 py-3 text-pr-danger text-sm">
              {error}
            </div>
          )}
        </div>

        <p className="text-center text-white/30 text-xs mt-8">
          Acceso restringido a emails corporativos de Partrunner
        </p>
      </div>
    </div>
  );
}
