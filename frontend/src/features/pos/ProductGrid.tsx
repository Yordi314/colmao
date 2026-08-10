import { useState, useEffect } from 'react';
import { Search, PackageOpen } from 'lucide-react';
import api from '../../lib/api';
import { useCartStore } from '../../store/cartStore';

export default function ProductGrid() {
  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [buscar, setBuscar] = useState('');
  const [categoriaSel, setCategoriaSel] = useState<number | 'frecuentes' | null>('frecuentes');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    cargarCategorias();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      cargarProductos();
    }, 300);
    return () => clearTimeout(delay);
  }, [buscar, categoriaSel]);

  const cargarCategorias = async () => {
    try {
      const res = await api.get('/categorias');
      setCategorias(res.data.data);
    } catch (err) {
      console.error('Error cargando categorías');
    }
  };

  const cargarProductos = async () => {
    setLoading(true);
    setError('');
    try {
      let url = '/productos?';
      if (buscar) url += `buscar=${encodeURIComponent(buscar)}&`;
      if (categoriaSel === 'frecuentes') url += `frecuentes=true&`;
      else if (categoriaSel !== null) url += `categoria=${categoriaSel}&`;

      const res = await api.get(url);
      setProductos(res.data.data);
    } catch (err) {
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (prod: any) => {
    if (prod.stock <= 0) return; // No agregar si no hay stock
    addItem({
      id: prod.id,
      nombre: prod.nombre,
      precio: parseFloat(prod.precio),
      cantidad: 1, // Se ajusta en el carrito si permite detalle
      unidad: prod.unidad,
      permiteDetalle: prod.permiteDetalle,
      stock: prod.stock
    });
  };

  return (
    <div className="flex flex-col h-full bg-surface-2 p-6 overflow-hidden">
      
      {/* Header / Buscador */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-ink tracking-tight font-display mb-6">Punto de Venta</h2>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-6 h-6" />
          <input
            type="text"
            placeholder="Buscar productos (ej. Arroz, Refresco)..."
            value={buscar}
            onChange={e => setBuscar(e.target.value)}
            className="w-full bg-surface border-2 border-border rounded-2xl pl-12 pr-4 py-4 text-lg font-medium text-ink focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm"
            autoFocus
          />
        </div>
      </div>

      {/* Chips Categorías */}
      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar mb-4 items-center snap-x snap-mandatory">
        <button
          onClick={() => setCategoriaSel('frecuentes')}
          className={`shrink-0 snap-start px-6 py-2.5 rounded-full font-bold text-[15px] transition-all ${
            categoriaSel === 'frecuentes' 
              ? 'bg-accent text-white shadow-md shadow-accent/20 border border-accent' 
              : 'bg-surface border border-border text-ink hover:border-accent hover:text-accent hover:bg-accent/5'
          }`}
        >
          ⭐ Frecuentes
        </button>
        <button
          onClick={() => setCategoriaSel(null)}
          className={`shrink-0 snap-start px-6 py-2.5 rounded-full font-bold text-[15px] transition-all ${
            categoriaSel === null 
              ? 'bg-ink text-white shadow-md border border-ink' 
              : 'bg-surface border border-border text-ink hover:border-ink hover:bg-ink/5'
          }`}
        >
          Todos
        </button>
        {categorias.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoriaSel(cat.id)}
            className={`shrink-0 snap-start flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-[15px] transition-all ${
              categoriaSel === cat.id 
                ? 'bg-primary text-white shadow-md shadow-primary/20 border border-primary' 
                : 'bg-surface border border-border text-ink hover:border-primary hover:text-primary hover:bg-primary/5'
            }`}
          >
            <span className="text-lg">{cat.emoji}</span>
            {cat.nombre}
          </button>
        ))}
      </div>

      {/* Grilla Productos */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse-dot text-primary font-bold text-xl">Cargando productos...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-error font-medium bg-error/5 rounded-xl border border-error/20 p-8">
            {error}
          </div>
        ) : productos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted">
            <PackageOpen className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">No se encontraron productos.</p>
            <p className="text-sm">Intenta con otra búsqueda o categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3 md:gap-5 pb-24 md:pb-8">
            {productos.map(p => {
              const agotado = p.stock <= 0;
              const critico = !agotado && p.stock <= p.stockMinimo;
              
              return (
                <button
                  key={p.id}
                  onClick={() => handleProductClick(p)}
                  disabled={agotado}
                  className={`group relative flex flex-col rounded-2xl text-left transition-all bg-surface h-full shadow-sm overflow-hidden
                    ${agotado ? 'border border-border opacity-60 cursor-not-allowed' : 'border border-border hover:border-primary hover:shadow-lg hover:-translate-y-1 cursor-pointer'}
                  `}
                >
                  <div className="w-full h-32 md:h-44 bg-surface-2 flex items-center justify-center p-4 md:p-6 border-b border-border/40 relative">
                    {p.imagenUrl ? (
                      <>
                        <img 
                          src={p.imagenUrl} 
                          alt={p.nombre} 
                          className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105" 
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="text-6xl md:text-7xl hidden absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">{p.emoji || '📦'}</div>
                      </>
                    ) : (
                      <div className="text-6xl md:text-7xl absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">{p.emoji || '📦'}</div>
                    )}
                  </div>
                  
                  <div className="p-3 md:p-5 flex flex-col flex-1 w-full bg-surface relative">
                    <div className="font-semibold text-ink leading-tight mb-2 md:mb-3 line-clamp-2 text-[13px] md:text-[17px] min-h-[2.5rem] md:min-h-[3rem] w-full pr-1 md:pr-2">
                      {p.nombre}
                    </div>
                    
                    <div className="flex items-end justify-between mt-auto w-full pt-1">
                      <div className="text-primary font-extrabold text-lg md:text-2xl tracking-tight">RD${parseFloat(p.precio).toFixed(2)}</div>
                    </div>
                    
                    <div className={`absolute top-2 right-2 md:top-4 md:right-4 text-[9px] md:text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 md:px-2.5 md:py-1 rounded-full
                        ${agotado ? 'bg-error text-white' : critico ? 'bg-warning-500 text-white' : 'text-muted bg-surface-2 border border-border/50'}
                      `}>
                        {agotado ? 'AGOTADO' : `${p.stock} ${p.unidad === 'unidad' ? 'U' : 'LB'}`}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
