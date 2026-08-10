import { useState, useEffect } from 'react';
import { Search, Plus, UserCircle2 } from 'lucide-react';
import api from '../../lib/api';
import NuevoClienteModal from './NuevoClienteModal';
import ClienteDetailModal from './ClienteDetailModal';

export default function FiadoPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [buscar, setBuscar] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isNuevoOpen, setIsNuevoOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<number | null>(null);

  const cargarClientes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/clientes');
      setClientes(res.data.data);
    } catch (err) {
      setError('Error al cargar la lista de clientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const clientesFiltrados = clientes.filter(c => 
    c.nombre.toLowerCase().includes(buscar.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-bg p-4 md:p-8 overflow-hidden">
      
      {/* Encabezado y Acciones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold text-ink tracking-tight font-display">Fiado</h1>
          <p className="text-muted font-medium mt-1">Gestiona los créditos y abonos de clientes</p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={buscar}
              onChange={e => setBuscar(e.target.value)}
              className="w-full bg-surface border-2 border-border rounded-2xl pl-12 pr-4 py-3 text-ink focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none font-medium transition-all shadow-sm"
            />
          </div>
          <button 
            onClick={() => setIsNuevoOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-white font-extrabold rounded-2xl hover:bg-accent/90 transition-all shadow-lg hover:-translate-y-0.5 shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-surface rounded-2xl border border-border shadow-sm p-2 md:p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse-dot text-accent font-bold text-xl">Cargando clientes...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-error font-medium bg-error/5 rounded-xl border border-error/20 p-8">
            {error}
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted space-y-4">
            <UserCircle2 className="w-16 h-16 opacity-20" />
            <p className="text-lg font-medium">No se encontraron clientes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {clientesFiltrados.map(cliente => (
              <div 
                key={cliente.id}
                onClick={() => setSelectedCliente(cliente.id)}
                className="group flex flex-col p-6 bg-surface hover:bg-surface-2 rounded-2xl border border-border hover:border-accent/30 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent font-extrabold text-xl shadow-inner">
                      {cliente.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-ink text-[17px]">
                        {cliente.nombre}
                        {!cliente.activo && <span className="ml-2 text-[10px] bg-error/10 text-error px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Inactivo</span>}
                      </h3>
                      {cliente.telefono && <p className="text-sm text-muted font-medium mt-0.5">{cliente.telefono}</p>}
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto flex items-end justify-between pt-5 border-t border-border/50">
                  <div>
                    <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1">Saldo Pendiente</p>
                    <p className={`text-3xl font-extrabold tracking-tight ${cliente.saldo > 0 ? 'text-error' : 'text-success'}`}>
                      RD${cliente.saldo.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-accent opacity-0 group-hover:opacity-100 transition-opacity font-bold text-sm flex items-center gap-1 bg-accent/5 px-3 py-1.5 rounded-lg">
                    Ver Detalles →
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <NuevoClienteModal 
        isOpen={isNuevoOpen} 
        onClose={() => setIsNuevoOpen(false)} 
        onSuccess={cargarClientes} 
      />

      <ClienteDetailModal 
        isOpen={!!selectedCliente} 
        onClose={() => setSelectedCliente(null)} 
        onSuccess={cargarClientes}
        clienteId={selectedCliente} 
      />
    </div>
  );
}
