import { useState, useEffect } from 'react';
import { DollarSign, CreditCard, ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DashboardPage() {
  const [resumen, setResumen] = useState<any>(null);
  const [masVendidos, setMasVendidos] = useState<any[]>([]);
  const [ingresos, setIngresos] = useState<any[]>([]);
  const [alertas, setAlertas] = useState<any[]>([]);
  const [recomendaciones, setRecomendaciones] = useState<any[]>([]);
  const [fiadoAntiguo, setFiadoAntiguo] = useState<any[]>([]);
  const [inmovilizado, setInmovilizado] = useState<any[]>([]);
  const [patron, setPatron] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      const [resResumen, resVendidos, resIngresos, resAlertas, resRec, resFiado, resInmovilizado, resPatron] = await Promise.all([
        api.get('/dashboard/resumen'),
        api.get('/dashboard/mas-vendidos'),
        api.get('/dashboard/ingresos-semana'),
        api.get('/inventario/alertas'),
        api.get('/dashboard/recomendaciones'),
        api.get('/dashboard/fiado-atencion'),
        api.get('/dashboard/inmovilizado'),
        api.get('/dashboard/patron-horas')
      ]);

      setResumen(resResumen.data.data);
      setMasVendidos(resVendidos.data.data);
      setRecomendaciones(resRec.data.data);
      setFiadoAntiguo(resFiado.data.data);
      setInmovilizado(resInmovilizado.data.data);
      setPatron(resPatron.data.data);
      
      // Formatear fechas para el gráfico
      const ingresosFormateados = resIngresos.data.data.map((d: any) => {
        // Asumiendo d.fecha viene como "YYYY-MM-DD"
        const [year, month, day] = d.fecha.split('-');
        const dateObj = new Date(year, month - 1, day);
        return {
          ...d,
          dia: format(dateObj, 'EEE', { locale: es }).toUpperCase(), // Lun, Mar...
          total: Number(d.total)
        };
      });
      setIngresos(ingresosFormateados);
      
      setAlertas(resAlertas.data.data.slice(0, 5)); // Solo mostrar top 5 en dashboard

    } catch (err) {
      setError('Error al cargar los datos del dashboard.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-bg p-8 items-center justify-center">
        <div className="animate-pulse-dot text-primary font-bold text-2xl">Cargando métricas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-bg p-8 items-center justify-center">
        <div className="text-error bg-error/10 p-8 rounded-2xl border border-error/20 max-w-lg text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Algo salió mal</h2>
          <p className="text-sm font-medium">{error}</p>
          <button onClick={cargarDatos} className="mt-6 px-6 py-2 bg-error text-white rounded-lg font-bold">Reintentar</button>
        </div>
      </div>
    );
  }

  const kpis = [
    { 
      label: 'Ingresos Hoy', 
      value: `RD$${Math.round(resumen?.hoy?.ingresosEfectivo || 0)}`, 
      icon: DollarSign, 
      color: 'text-primary', 
      bg: 'bg-primary/10',
      var: resumen?.variaciones?.ingresosEfectivo 
    },
    { 
      label: 'Fiado Hoy', 
      value: `RD$${Math.round(resumen?.hoy?.ventasFiado || 0)}`, 
      icon: CreditCard, 
      color: 'text-accent', 
      bg: 'bg-accent/10',
      var: resumen?.variaciones?.ventasFiado
    },
    { 
      label: 'Tickets Hoy', 
      value: resumen?.hoy?.totalVentas || '0', 
      icon: ShoppingCart, 
      color: 'text-ink', 
      bg: 'bg-surface-2',
      var: resumen?.variaciones?.ventasTotales
    },
    { 
      label: 'Ticket Promedio', 
      value: `RD$${Math.round(resumen?.hoy?.ticketPromedio || 0)}`, 
      icon: TrendingUp, 
      color: 'text-secondary', 
      bg: 'bg-secondary/10',
      var: resumen?.variaciones?.ticketPromedio
    },
  ];

  const renderVariacion = (valor?: number) => {
    if (valor === undefined || valor === null) return null;
    if (valor === 0) return <span className="text-[11px] font-bold text-muted ml-2 px-1.5 py-0.5 bg-surface-2 rounded-md">Igual vs ayer</span>;
    const isPositive = valor > 0;
    return (
      <span className={`text-[11px] font-bold ml-2 px-1.5 py-0.5 rounded-md ${isPositive ? 'text-success bg-success/10' : 'text-error bg-error/10'}`}>
        {isPositive ? '▲' : '▼'} {Math.abs(valor).toFixed(1)}% vs ayer
      </span>
    );
  };

  const sinVentas = ingresos.every(i => i.total === 0);

  return (
    <div className="flex flex-col h-full bg-bg p-4 md:p-8 overflow-y-auto">
      
      <div className="mb-8 shrink-0">
        <h1 className="text-3xl font-extrabold text-ink tracking-tight font-display">Dashboard</h1>
        <p className="text-muted font-medium mt-1">Resumen del negocio y métricas clave</p>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-surface p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all cursor-default">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${kpi.bg} ${kpi.color}`}>
              <kpi.icon className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-muted uppercase tracking-wider mb-1 truncate">{kpi.label}</p>
              <div className="flex items-end gap-2 flex-wrap">
                <p className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight truncate font-tabular">{kpi.value}</p>
                {renderVariacion(kpi.var)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Acciones Prioritarias */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        
        {/* Recomendaciones (Qué comprar) */}
        <div className="bg-surface p-7 rounded-2xl border border-border shadow-sm flex flex-col h-full">
          <h2 className="text-lg font-bold text-ink mb-5 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-accent" />
            Qué Comprar (Urgente)
          </h2>
          {recomendaciones.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center text-muted p-6 text-sm bg-surface-2/50 border border-dashed border-border rounded-xl">
              Inventario saludable. No hay urgencias de compra por ahora.
            </div>
          ) : (
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[350px] pr-2">
              {recomendaciones.map(r => (
                <div key={r.id} className="p-4 bg-surface hover:bg-surface-2 rounded-xl border border-border transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-ink text-base line-clamp-1 flex-1 pr-2">{r.nombre}</span>
                      {r.urgente && <span className="bg-error/10 text-error text-[10px] uppercase font-bold px-2 py-0.5 rounded-md shrink-0">Urgente</span>}
                    </div>
                    <p className="text-sm text-muted">
                      Quedan <strong className="text-ink">{r.stock}</strong>, vendes <strong className="text-ink">~{Math.ceil(r.ventasDiarias)}/día</strong>
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border/50 text-xs font-medium">
                    {r.diasRestantes < 1 ? (
                      <span className="text-error font-bold">Agotado o se agota hoy</span>
                    ) : (
                      <span className="text-warning-600 font-bold">Comprar en {Math.floor(r.diasRestantes)} {Math.floor(r.diasRestantes) === 1 ? 'día' : 'días'}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fiado por Cobrar */}
        <div className="bg-surface p-7 rounded-2xl border border-border shadow-sm flex flex-col h-full">
          <h2 className="text-lg font-bold text-ink mb-5 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-error" />
            A Quién Cobrar (Fiado Antiguo)
          </h2>
          {fiadoAntiguo.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center text-muted p-6 text-sm bg-surface-2/50 border border-dashed border-border rounded-xl">
              No hay deudas pendientes antiguas. Todo al día.
            </div>
          ) : (
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[350px] pr-2">
              {fiadoAntiguo.map(c => (
                <div key={c.id} className="p-4 bg-surface hover:bg-surface-2 rounded-xl border border-border transition-colors flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-ink text-base line-clamp-1 flex-1 pr-2">{c.nombre}</span>
                    <span className="font-extrabold text-error">RD${Math.round(c.pendiente)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/50">
                    <p className="text-xs text-muted">
                      Tel: {c.telefono || 'N/A'}
                    </p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${c.diasAtraso > 15 ? 'bg-error/10 text-error' : 'bg-warning-500/10 text-warning-700'}`}>
                      {c.diasAtraso} días de atraso
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>

      {/* Gráficos Principales */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        
        {/* Gráfico de Ingresos */}
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-ink mb-6">Ingresos (Últimos 7 días)</h2>
          
          <div className="w-full h-[260px] relative">
            {sinVentas ? (
              <div className="absolute inset-0 flex items-center justify-center text-muted flex-col">
                <TrendingUp className="w-12 h-12 mb-2 opacity-20" />
                <p className="font-medium">No hay ventas registradas en los últimos 7 días</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ingresos} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="dia" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 700 }}
                    tickFormatter={(value) => `RD$${value}`}
                    width={80}
                  />
                  <Tooltip 
                    cursor={{ stroke: '#F3F4F6', strokeWidth: 32 }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontWeight: 700 }}
                    formatter={(value: number) => [`RD$${Math.round(value)}`, 'Ingresos']}
                    labelStyle={{ color: '#6B7280', marginBottom: '4px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#0E7C57" 
                    strokeWidth={4} 
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                    activeDot={{ r: 6, stroke: '#0E7C57', strokeWidth: 3, fill: '#fff' }}
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Patrón de Ventas por Hora */}
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-ink mb-6">Patrón de Ventas por Hora</h2>
          <div className="w-full h-[260px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={patron} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="hora" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 700 }} width={40} />
                <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontWeight: 700 }} formatter={(value: number) => [value, 'Ventas']} />
                <Bar dataKey="cantidad" fill="#0E7C57" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Tablas y Resúmenes (Tercera Fila) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Top 5 */}
        <div className="bg-surface p-7 rounded-2xl border border-border shadow-sm flex flex-col h-[400px]">
          <h2 className="text-lg font-bold text-ink mb-5">Top 5 Más Vendidos (Hoy)</h2>
          {masVendidos.length === 0 ? (
            <div className="text-center text-muted p-6 text-sm bg-surface-2/50 border border-dashed border-border rounded-xl flex-1 flex items-center justify-center">Sin ventas registradas hoy</div>
          ) : (
            <div className="space-y-4 overflow-y-auto pr-2 flex-1 min-h-0">
              {masVendidos.map((prod, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-surface hover:bg-surface-2 rounded-xl border border-border transition-colors">
                  <span className="font-bold text-ink line-clamp-1 flex-1 pr-4">{prod.nombre}</span>
                  <span className="font-extrabold text-primary shrink-0 bg-primary/10 px-3 py-1.5 rounded-lg text-sm">{prod.cantidad} ud</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inventario Inmovilizado (Plata Muerta) */}
        <div className="bg-surface p-7 rounded-2xl border border-border shadow-sm flex flex-col h-[400px]">
          <h2 className="text-lg font-bold text-ink mb-5 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-muted" />
            Plata Muerta (30+ días)
          </h2>
          {inmovilizado.length === 0 ? (
            <div className="text-center text-success p-6 text-sm bg-success/5 font-bold rounded-xl border border-success/20 flex-1 flex items-center justify-center">
              Todo tu inventario está rotando bien.
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto pr-2 flex-1 min-h-0">
              {inmovilizado.map(p => (
                <div key={p.id} className="p-4 bg-surface hover:bg-surface-2 rounded-xl border border-border transition-colors flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-ink line-clamp-1">{p.nombre}</span>
                    <span className="font-extrabold text-muted text-sm">{p.stock} ud</span>
                  </div>
                  <div className="text-xs text-muted">
                    Retenido: <strong className="text-ink">RD${Math.round(p.dineroRetenido)}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumen del Día (Cierre de Caja) */}
        <div className="bg-surface p-7 rounded-2xl border border-border shadow-sm flex flex-col h-[400px]">
          <h2 className="text-lg font-bold text-ink mb-5">Cierre de Caja (Hoy)</h2>
          <div className="flex-1 flex flex-col space-y-6">
            <div>
              <p className="text-sm text-muted font-bold mb-1">Total Ingresos</p>
              <p className="text-4xl font-extrabold text-ink tracking-tight">RD${Math.round(resumen?.hoy?.ingresosTotales || 0)}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center text-sm mb-1.5">
                  <span className="font-bold text-muted">Efectivo</span>
                  <span className="font-extrabold text-primary">RD${Math.round(resumen?.hoy?.ingresosEfectivo || 0)}</span>
                </div>
                <div className="w-full bg-surface-2 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: `${resumen?.hoy?.ingresosTotales ? (resumen.hoy.ingresosEfectivo / resumen.hoy.ingresosTotales) * 100 : 0}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center text-sm mb-1.5 pt-2">
                  <span className="font-bold text-muted">Fiado</span>
                  <span className="font-extrabold text-accent">RD${Math.round(resumen?.hoy?.ventasFiado || 0)}</span>
                </div>
                <div className="w-full bg-surface-2 rounded-full h-2">
                  <div className="bg-accent h-2 rounded-full" style={{ width: `${resumen?.hoy?.ingresosTotales ? (resumen.hoy.ventasFiado / resumen.hoy.ingresosTotales) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
              <div>
                 <p className="text-xs text-muted font-bold mb-1">Tickets de Venta</p>
                 <p className="text-xl font-extrabold text-ink">{resumen?.hoy?.totalVentas || 0}</p>
              </div>
              <div>
                 <p className="text-xs text-muted font-bold mb-1">Ticket Promedio</p>
                 <p className="text-xl font-extrabold text-ink">RD${Math.round(resumen?.hoy?.ticketPromedio || 0)}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
