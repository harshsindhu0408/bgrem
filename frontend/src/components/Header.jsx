import { Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <Sparkles size={20} fill="currentColor" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Remover<span className="text-indigo-600">.ai</span>
          </span>
        </div>
        
       
      </div>
    </header>
  );
}
