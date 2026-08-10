import { useState, useEffect } from 'react';
import { Search, Plus, Package, Edit2, Archive, AlertTriangle } from 'lucide-react';
import api from '../../lib/api';
import ProductModal from './ProductModal';
import AdjustStockModal from './AdjustStockModal';

export default function InventarioPage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [buscar, setBuscar] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'stock' | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/productos'), // Por ahora usamos este, asumiendo que trae todo lo necesario
        api.get('/categorias')
      ]);
      setProductos(prodRes.data.data);
      setCategorias(catRes.data.data);
    } catch (err) {
      setError('Error al cargar el inventario.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const openCreate = () => {
    setSelectedProduct(null);
    setModalMode('create');
  };

  const openEdit = (p: any) => {
    setSelectedProduct(p);
    setModalMode('edit');
  };

  const openStock = (p: any) => {
    setSelectedProduct(p);
    setModalMode('stock');
  };

  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(buscar.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-bg p-4 md:p-8 overflow-hidden">
      
      {/* Encabezado y Acciones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold text-ink tracking-tight font-display">Inventario</h1>
          <p className="text-muted font-medium mt-1">Gestiona tus productos y monitorea el stock</p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={buscar}
              onChange={e => setBuscar(e.target.value)}
              className="w-full bg-surface border-2 border-border rounded-2xl pl-12 pr-4 py-3 text-ink focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-medium transition-all shadow-sm"
            />
          </div>
          <button 
            onClick={openCreate}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-extrabold rounded-2xl hover:bg-primary-700 transition-all shadow-lg hover:-translate-y-0.5 shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Contenido (Tabla) */}
      <div className="flex-1 overflow-hidden bg-surface rounded-2xl border border-border shadow-sm flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse-dot text-primary font-bold text-xl">Cargando inventario...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-error font-medium bg-error/5 border-error/20 p-8">
            {error}
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted space-y-4">
            <Package className="w-16 h-16 opacity-20" />
            <p className="text-lg font-medium">No se encontraron productos.</p>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1 pb-20 md:pb-0">
            <table className="w-full text-left border-collapse min-w-full md:min-w-[800px]">
              <thead className="bg-surface-2 sticky top-0 z-10 shadow-sm hidden md:table-header-group">
                <tr>
                  <th className="py-5 px-6 font-bold text-xs text-muted uppercase tracking-wider border-b border-border/50">Producto</th>
                  <th className="py-5 px-6 font-bold text-xs text-muted uppercase tracking-wider border-b border-border/50">Categoría</th>
                  <th className="py-5 px-6 font-bold text-xs text-muted uppercase tracking-wider border-b border-border/50">Precio (RD$)</th>
                  <th className="py-5 px-6 font-bold text-xs text-muted uppercase tracking-wider border-b border-border/50">Stock</th>
                  <th className="py-5 px-6 font-bold text-xs text-muted uppercase tracking-wider border-b border-border/50 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map(p => {
                  const agotado = p.stock <= 0;
                  const critico = !agotado && p.stock <= p.stockMinimo;

                  return (
                    <tr key={p.id} className="block md:table-row border-b border-border hover:bg-surface-2/50 transition-colors p-4 md:p-0 mb-4 md:mb-0 bg-surface rounded-2xl md:rounded-none shadow-sm md:shadow-none mx-4 md:mx-0">
                      <td className="block md:table-cell py-2 md:py-5 px-0 md:px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-surface-2 rounded-xl border border-border/50 flex items-center justify-center shadow-sm shrink-0">
                            {p.imagenUrl ? (
                              <img src={p.imagenUrl} alt={p.nombre} className="w-8 h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                            ) : null}
                            <span className={`text-2xl ${p.imagenUrl ? 'hidden' : ''}`}>{p.emoji || '📦'}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start md:block">
                              <p className="font-bold text-ink text-[15px] line-clamp-1">{p.nombre}</p>
                              <span className="md:hidden px-3 py-1 bg-surface-2 border border-border rounded-full text-[10px] font-bold text-muted ml-2 shrink-0">
                                {p.categoria?.nombre || 'Sin Cat'}
                              </span>
                            </div>
                            <p className="text-xs text-muted font-medium mt-1 space-x-2">
                              {p.esFrecuente && <span className="bg-accent/10 text-accent px-1.5 py-0.5 rounded-md">⭐ Frecuente</span>}
                              {p.permiteDetalle && <span className="bg-surface-2 border border-border px-1.5 py-0.5 rounded-md">Detalle</span>}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell py-5 px-6">
                        <span className="px-4 py-1.5 bg-surface-2 border border-border rounded-full text-xs font-bold text-muted">
                          {p.categoria?.nombre || 'Sin Categoría'}
                        </span>
                      </td>
                      <td className="block md:table-cell py-2 md:py-5 px-0 md:px-6 mt-3 md:mt-0">
                        <div className="flex items-center justify-between md:block">
                          <span className="text-sm font-bold text-muted md:hidden">Precio:</span>
                          <span className="font-extrabold text-ink text-[17px]">RD${parseFloat(p.precio).toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="block md:table-cell py-2 md:py-5 px-0 md:px-6">
                        <div className="flex items-center justify-between md:flex-col md:items-start">
                          <span className="text-sm font-bold text-muted md:hidden">Stock:</span>
                          <div className="flex flex-col md:items-start items-end">
                            <span className={`font-extrabold text-lg flex items-center gap-2 tracking-tight ${agotado ? 'text-error' : critico ? 'text-warning-700' : 'text-success'}`}>
                              {p.stock} {p.unidad}
                              {(agotado || critico) && <AlertTriangle className="w-4 h-4" />}
                            </span>
                            <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Mín: {p.stockMinimo}</span>
                          </div>
                        </div>
                      </td>
                      <td className="block md:table-cell py-4 md:py-5 px-0 md:px-6 md:text-right border-t border-border/50 md:border-t-0 mt-3 md:mt-0">
                        <div className="flex gap-2 justify-end md:justify-end w-full">
                        <button
                          onClick={() => openStock(p)}
                          className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl font-bold text-sm transition-colors inline-flex items-center gap-2"
                          title="Ajustar Stock"
                        >
                          <Archive className="w-4 h-4" />
                          <span>Stock</span>
                        </button>
                        <button
                          onClick={() => openEdit(p)}
                          className="px-4 py-2 bg-surface-2 border border-border text-ink hover:text-primary hover:border-primary/50 hover:bg-primary/5 rounded-xl font-bold text-sm transition-colors inline-flex items-center gap-2"
                          title="Editar Producto"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>Editar</span>
                        </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ProductModal
        isOpen={modalMode === 'create' || modalMode === 'edit'}
        onClose={() => setModalMode(null)}
        producto={selectedProduct}
        categorias={categorias}
        onSuccess={cargarDatos}
      />

      <AdjustStockModal
        isOpen={modalMode === 'stock'}
        onClose={() => setModalMode(null)}
        producto={selectedProduct}
        onSuccess={cargarDatos}
      />
    </div>
  );
}
