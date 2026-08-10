import Sidebar from './Sidebar';
import { useAuthStore } from '../../store/authStore';

export default function Layout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(state => state.user);

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-background overflow-hidden font-sans">
      <main className="flex-1 flex flex-col h-full overflow-hidden order-1 md:order-2 pb-[env(safe-area-inset-bottom)] md:pb-0 relative">
        {user?.esDemo && (
          <div className="bg-amber-100 text-amber-800 text-xs font-bold text-center py-1.5 px-4 w-full shadow-sm z-50 flex items-center justify-center gap-2 border-b border-amber-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            Modo demostración — los datos son públicos y se reinician periódicamente.
          </div>
        )}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
      <Sidebar />
    </div>
  );
}
