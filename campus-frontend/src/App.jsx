import { useState } from 'react';
import CurriculumGraph from './components/CurriculumGraph';
import LiveRegistration from './components/LiveRegistration';

export default function App() {
  const [activeFeature, setActiveFeature] = useState('mapper'); // 'mapper' or 'console'

  return (
    <div className="flex h-screen overflow-hidden bg-surface-900 text-text-primary">
      {/* Sidebar */}
      <aside className="w-72 flex-none border-r border-border bg-surface-800/90 backdrop-blur-md flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.4)] relative">
        {/* Header / Logo */}
        <div className="h-20 border-b border-border flex items-center px-6 gap-4 bg-surface-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-white/10 shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div className="overflow-hidden">
            <h1 className="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-text-secondary tracking-tight truncate">
              CampusFlow
            </h1>
            <p className="text-[10px] text-accent-cyan/90 font-mono tracking-widest uppercase mt-0.5 truncate">
              System Admin
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
          <div className="text-[10px] font-mono text-text-muted uppercase tracking-widest px-2 mb-2">Features</div>
          
          <button 
            onClick={() => setActiveFeature('mapper')}
            className={`w-full group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeFeature === 'mapper' ? 'bg-surface-700/80 border border-border shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.2)] text-white' : 'text-text-secondary hover:bg-surface-700/40 hover:text-text-primary border border-transparent'}`}
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${activeFeature === 'mapper' ? 'bg-accent-blue/20 text-accent-blue' : 'bg-surface-600/50 group-hover:bg-surface-600 group-hover:text-white'}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-bold tracking-wide">Curriculum Mapper</span>
              {activeFeature === 'mapper' && <span className="text-[10px] text-accent-blue/80 font-mono tracking-wider mt-0.5">Active</span>}
            </div>
          </button>
          
          <button 
            onClick={() => setActiveFeature('console')}
            className={`w-full group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeFeature === 'console' ? 'bg-surface-700/80 border border-border shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.2)] text-white' : 'text-text-secondary hover:bg-surface-700/40 hover:text-text-primary border border-transparent'}`}
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${activeFeature === 'console' ? 'bg-accent-red/20 text-accent-red' : 'bg-surface-600/50 group-hover:bg-surface-600 group-hover:text-white'}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-bold tracking-wide">Server Control</span>
              {activeFeature === 'console' && <span className="text-[10px] text-accent-red/80 font-mono tracking-wider mt-0.5">Active</span>}
            </div>
            {activeFeature !== 'console' && (
              <span className="ml-auto flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-red opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-red shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
              </span>
            )}
          </button>
        </nav>

        {/* System Status Footer */}
        <div className="p-4 border-t border-border bg-surface-900/80">
          <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-800 border border-border shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)]">
            <span className="w-2 h-2 rounded-full bg-accent-green shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            <span className="text-xs font-mono font-semibold text-text-secondary tracking-wide">System Online</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative bg-[#0a0a0f]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent-blue/5 via-surface-900 to-surface-900 pointer-events-none z-0" />
        
        <div className="w-full h-full relative z-10">
          {activeFeature === 'mapper' ? (
            <div key="mapper" className="w-full h-full animate-fade-in-up">
              <CurriculumGraph />
            </div>
          ) : (
            <div key="console" className="w-full h-full p-8 animate-fade-in-up flex items-center justify-center">
              <div className="w-full max-w-7xl h-[90%] rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden">
                <LiveRegistration />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
