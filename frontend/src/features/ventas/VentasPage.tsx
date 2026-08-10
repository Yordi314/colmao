import { useState, useEffect } from 'react';
import { Search, Printer, X, Receipt } from 'lucide-react';
import api from '../../lib/api';
import FacturaPrintable from './FacturaPrintable';

export default function VentasPage() {
  const [ventas, setVentas] = useState<any[]>([]);
  const [buscar, setBuscar] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedVenta, setSelectedVenta] = useState<any>(null);

  const cargarVentas = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ventas');
      setVentas(res.data.data);
    } catch (err) {
      setError('Error al cargar historial de ventas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVentas();
  }, []);

  const ventasFiltradas = ventas.filter(v => 
    v.numeroFactura?.toLowerCase().includes(buscar.toLowerCase()) ||
    v.usuario?.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
    v.cliente?.nombre.toLowerCase().includes(buscar.toLowerCase())
  );

  const verFactura = async (id: number) => {
    try {
      // Necesitamos los items, así que podemos hacer una llamada o usar los datos si ya vienen.
      // Actualmente getVentas no trae items por optimización, así que haremos una llamada al backend.
      // Oh, getVentas no tiene getVentaById en el backend, así que lo ideal es traer los items o agregarlos.
      // Por simplicidad, agreguemos la lógica rápida: 
      const res = await api.get(`/ventas`); // En un sistema real sería /ventas/:id
      // Asumiremos que el historial trae los items o si no, mostraremos un estado simplificado si no se tiene.
      // Revisando ventas.controller.ts, `getVentas` NO trae items. 
      // Para prototipo, requeriríamos modificar el backend para traer items. 
      // Haremos una modificación al controlador para incluir los items en getVentas.
    } catch (error) {
      
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-bg p-4 md:p-8 overflow-hidden">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold text-ink tracking-tight font-display">Ventas / Facturas</h1>
          <p className="text-muted font-medium mt-1">Historial de ventas y reimpresión de facturas</p>
        </div>
        <div className="relative flex-1 md:w-80 md:flex-none">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por factura, cajero o cliente..."
            value={buscar}
            onChange={e => setBuscar(e.target.value)}
            className="w-full bg-surface border-2 border-border rounded-2xl pl-12 pr-4 py-3 text-ink focus:border-primary outline-none font-medium transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-surface rounded-2xl border border-border shadow-sm flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center h-full">Cargando ventas...</div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-error">{error}</div>
        ) : (
          <div className="overflow-x-auto flex-1 pb-20 md:pb-0">
            <table className="w-full text-left border-collapse min-w-full md:min-w-[800px]">
              <thead className="bg-surface-2 sticky top-0 z-10 shadow-sm hidden md:table-header-group">
                <tr>
                  <th className="py-5 px-6 font-bold text-xs text-muted uppercase tracking-wider border-b border-border/50">Factura</th>
                  <th className="py-5 px-6 font-bold text-xs text-muted uppercase tracking-wider border-b border-border/50">Fecha</th>
                  <th className="py-5 px-6 font-bold text-xs text-muted uppercase tracking-wider border-b border-border/50">Cliente / Pago</th>
                  <th className="py-5 px-6 font-bold text-xs text-muted uppercase tracking-wider border-b border-border/50">Total</th>
                  <th className="py-5 px-6 font-bold text-xs text-muted uppercase tracking-wider border-b border-border/50 text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {ventasFiltradas.map(v => (
                  <tr key={v.id} className="block md:table-row border-b border-border hover:bg-surface-2/50 transition-colors p-4 md:p-0 mb-4 md:mb-0 bg-surface rounded-2xl md:rounded-none shadow-sm md:shadow-none mx-4 md:mx-0">
                    <td className="block md:table-cell py-2 md:py-5 px-0 md:px-6">
                      <div className="flex justify-between md:block">
                        <div className="font-bold text-ink text-[15px]">{v.numeroFactura || `INV-${String(v.id).padStart(6, '0')}`}</div>
                        <span className={`md:hidden text-[10px] uppercase px-2.5 py-1 rounded-md font-bold tracking-wider ${v.tipoPago === 'efectivo' ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent'}`}>
                          {v.tipoPago}
                        </span>
                      </div>
                      <div className="text-xs text-muted font-medium mt-1">NCF: {v.ncf}</div>
                    </td>
                    <td className="block md:table-cell py-2 md:py-5 px-0 md:px-6 text-[15px] font-medium text-ink">
                      <div className="flex justify-between md:block">
                        <span className="text-sm font-bold text-muted md:hidden">Fecha:</span>
                        <span>{new Date(v.fecha).toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-muted mt-1 text-right md:text-left">Cajero: {v.usuario?.nombre}</div>
                    </td>
                    <td className="block md:table-cell py-2 md:py-5 px-0 md:px-6">
                      <div className="flex items-center justify-between md:block">
                        <span className="text-sm font-bold text-muted md:hidden">Cliente:</span>
                        <div className="font-bold text-ink text-[15px] flex items-center gap-2 mb-1">
                          {v.cliente?.nombre || 'Consumidor Final'}
                        </div>
                      </div>
                      <span className={`hidden md:inline-block text-[10px] uppercase px-2.5 py-1 rounded-md font-bold tracking-wider ${v.tipoPago === 'efectivo' ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent'}`}>
                        {v.tipoPago}
                      </span>
                    </td>
                    <td className="block md:table-cell py-2 md:py-5 px-0 md:px-6 mt-2 md:mt-0 pt-4 md:pt-5 border-t border-border/50 md:border-t-0">
                      <div className="flex justify-between items-center md:block">
                        <span className="font-extrabold text-primary text-xl md:text-xl tracking-tight">
                          RD${Number(v.total).toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="block md:table-cell py-4 md:py-5 px-0 md:px-6 text-right mt-2 md:mt-0">
                      <button 
                        onClick={() => setSelectedVenta(v)}
                        className="w-full md:w-auto px-4 py-2 bg-surface-2 border border-border text-ink hover:text-primary hover:border-primary/50 hover:bg-primary/5 rounded-xl font-bold text-sm transition-colors inline-flex items-center justify-center gap-2"
                      >
                        <Receipt className="w-4 h-4" /> Ver Factura
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedVenta && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 print-hide-backdrop">
          <div className="bg-surface rounded-xl shadow-elevated w-full max-w-sm flex flex-col overflow-hidden max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-border bg-surface-2/50 shrink-0 no-print">
              <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                Detalle Factura
              </h2>
              <button onClick={() => setSelectedVenta(null)} className="p-2 text-muted hover:text-ink hover:bg-border/50 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-gray-100 flex justify-center no-print">
              <div className="shadow-md">
                <FacturaPrintable venta={selectedVenta} />
              </div>
            </div>

            {/* This renders invisibly on screen but is the only thing shown in print */}
            <div className="hidden print-block">
               <FacturaPrintable venta={selectedVenta} />
            </div>

            <div className="p-4 border-t border-border bg-surface shrink-0 no-print">
              <button 
                onClick={handlePrint}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-700 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" /> Imprimir Recibo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
