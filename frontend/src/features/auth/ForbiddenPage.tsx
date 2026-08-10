import { ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-surface-2">
      <ShieldAlert className="w-16 h-16 text-warning-500 mb-4" />
      <h1 className="text-3xl font-extrabold text-ink tracking-tight font-display mb-2">
        Acceso Denegado
      </h1>
      <p className="text-muted font-medium max-w-md mb-8 text-lg">
        Tu rol actual no tiene permisos para ver esta sección. Si crees que esto es un error, contacta al dueño.
      </p>
      <button
        onClick={() => navigate('/pos')}
        className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary/20"
      >
        Volver al Punto de Venta
      </button>
    </div>
  );
}
