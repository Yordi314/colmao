import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore(state => state.setAuth);

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const response = await api.post('/auth/demo');
      const { token, usuario } = response.data;
      setAuth(token, usuario);
    } catch (err) {
      console.error('Error entering demo', err);
      setError('Error al conectar con la demo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, usuario } = response.data;
      setAuth(token, usuario);
      // La redirección la maneja el App.tsx por el cambio de estado en el store
    } catch (err: any) {
      if (err.response?.data?.error?.message) {
        setError(err.response.data.error.message);
      } else {
        setError('Ocurrió un error al intentar iniciar sesión. Verifica tu conexión.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex font-sans">
      
      {/* Lado Izquierdo: Marca (Oculto en móviles) */}
      <div className="hidden lg:flex flex-1 bg-primary text-white flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Patrón decorativo muy sutil usando divs */}
        <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
          <div className="w-[800px] h-[800px] border-[100px] border-white/20 rounded-full blur-3xl absolute -top-40 -left-40"></div>
          <div className="w-[600px] h-[600px] bg-accent/20 rounded-full blur-3xl absolute -bottom-20 -right-20"></div>
        </div>
        
        <div className="relative z-10 max-w-lg text-center flex flex-col items-center">
          <img src="/brand/colmao-logo-blanco.svg" alt="Colmao" className="h-16 md:h-20 mb-6 object-contain drop-shadow-md" />
          <p className="text-xl md:text-2xl text-white/90 leading-relaxed font-medium">
            El sistema de ventas inteligente diseñado exclusivamente para colmados.
          </p>
        </div>
      </div>

      {/* Lado Derecho: Formulario */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-sm space-y-8">
          
          <div className="text-center lg:text-left">
            <img src="/brand/colmao-logo.svg" alt="Colmao" className="h-12 mx-auto lg:hidden mb-6 object-contain" />
            <h2 className="text-3xl font-bold text-ink">Bienvenido de vuelta</h2>
            <p className="text-muted mt-2">Ingresa tus credenciales para continuar</p>
          </div>
          
          {error && (
            <div className="bg-error/10 border-l-4 border-error text-error p-4 rounded-r-lg text-sm font-bold flex items-center shadow-sm animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-ink">Correo Electrónico</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border-2 border-border rounded-xl p-3.5 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all bg-surface text-ink font-medium"
                placeholder="ejemplo@colmado.do"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-ink">Contraseña</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border-2 border-border rounded-xl p-3.5 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all bg-surface text-ink font-medium"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="space-y-3 pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-white font-bold text-lg p-4 rounded-xl hover:bg-primary-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? 'Iniciando sesión...' : 'Entrar al Sistema'}
              </button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-bg text-muted font-medium">O si lo prefieres</span>
                </div>
              </div>

              <button 
                type="button" 
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full bg-surface-2 text-ink border border-border font-bold text-lg p-4 rounded-xl hover:bg-border transition-all flex justify-center items-center gap-2"
              >
                Entrar como Demo
              </button>
            </div>
          </form>
          
        </div>
      </div>
    </div>
  );
}
