import { Zap } from 'lucide-react';

interface HeaderProps {
  title?: string;
}

export function Header({ title = '火力发电小课堂' }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-primary-blue via-primary-light-blue to-primary-blue shadow-lg sticky top-0 z-40">
      <div className="px-5 py-4 md:px-6 flex items-center justify-center gap-3">
        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
          <Zap className="w-6 h-6 text-white" fill="currentColor" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">{title}</h1>
        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
          <Zap className="w-6 h-6 text-white" fill="currentColor" />
        </div>
      </div>
    </header>
  );
}
