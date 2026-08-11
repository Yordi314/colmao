import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import { ShoppingCart, BarChart3, Users, ChevronRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore(state => state.setAuth);
  const navigate = useNavigate();

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const response = await api.post('/auth/demo');
      const { token, usuario } = response.data;
      setAuth(token, usuario);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error entering demo', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg font-sans selection:bg-primary/20 flex flex-col">
      {/* Header */}
      <header className="container mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <img src="/brand/colmao-logo.svg" alt="Colmao" className="h-8" />
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="text-muted hover:text-ink font-bold text-sm px-4 py-2 transition-colors"
          >
            Iniciar Sesión
          </button>
          <button 
            onClick={handleDemoLogin}
            disabled={loading}
            className="bg-primary hover:bg-primary-700 text-white font-bold text-sm px-6 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex items-center gap-2"
          >
            {loading ? 'Cargando...' : 'Probar Demo'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden flex-grow">
        {/* Background shapes */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl -z-10"></div>

        <div className="container mx-auto px-6 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
            </span>
            Sistema en Vivo
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-ink tracking-tight font-display mb-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
            El punto de venta hecho para el <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-700">colmado dominicano</span>
          </h1>
          
          <p className="text-xl text-muted font-medium mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Ventas rápidas, control de fiado exacto, gestión de inventario y analítica de tu negocio. Sin centavos, sin complicaciones.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-7 duration-700 delay-200">
            <button 
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full sm:w-auto bg-primary hover:bg-primary-700 text-white font-bold text-lg px-8 py-4 rounded-full transition-all shadow-xl shadow-primary/20 hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2"
            >
              {loading ? 'Preparando tu colmado...' : 'Entrar a la Demostración'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="container mx-auto px-6 mt-24 max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-surface p-8 rounded-3xl shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                <ShoppingCart className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-ink mb-3">Punto de Venta Rápido</h3>
              <p className="text-muted font-medium leading-relaxed">Venta al detalle, cobro con billetes rápidos y cálculo de vuelto al instante. Impuestos integrados, total en pesos cerrados.</p>
            </div>
            
            <div className="bg-surface p-8 rounded-3xl shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-6">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-ink mb-3">Control de Fiado</h3>
              <p className="text-muted font-medium leading-relaxed">Olvídate de la libreta. Lleva el límite de crédito de tus clientes, registra abonos y ten las cuentas claras en todo momento.</p>
            </div>

            <div className="bg-surface p-8 rounded-3xl shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mb-6">
                <BarChart3 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-ink mb-3">Dashboard Inteligente</h3>
              <p className="text-muted font-medium leading-relaxed">Descubre tu "Plata Muerta", productos más vendidos e ingresos diarios de un vistazo. Inteligencia real para dueños.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 opacity-50 grayscale">
            <img src="/brand/colmao-logo.svg" alt="Colmao" className="h-6" />
          </div>
          <p className="text-sm text-muted font-medium flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            Entorno de demostración seguro
          </p>
        </div>
      </footer>
    </div>
  );
}
