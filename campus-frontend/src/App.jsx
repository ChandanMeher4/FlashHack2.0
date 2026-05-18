import { useState } from 'react';
import CurriculumGraph from './components/CurriculumGraph';
import LiveRegistration from './components/LiveRegistration';

export default function App() {
  const [showConsole, setShowConsole] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface-900 text-text-primary relative">
      {/* Top Navbar */}
      <header className="flex-none h-16 border-b border-border bg-surface-800/80 backdrop-blur-md px-6 flex items-center justify-between z-10 shadow-[0_4px_24px_rgba(0,0,0,0.4)] relative">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-white/10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-text-secondary tracking-tight">
              CampusFlow System
            </h1>
            <p className="text-[11px] text-accent-cyan/90 font-mono tracking-widest uppercase mt-0.5">
              Admin Control Center
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setShowConsole(true)}
            className="group relative flex items-center gap-3 px-5 py-2.5 rounded-lg bg-gradient-to-b from-[#2a2a35] to-[#1a1a24] border border-[#3f3f4e] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_6px_rgba(0,0,0,0.5)] hover:from-[#353542] hover:to-[#22222e] active:shadow-[inset_0_3px_5px_rgba(0,0,0,0.5)] active:translate-y-[1px] transition-all"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-accent-red animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
            <span className="text-sm font-bold text-white tracking-wide shadow-black drop-shadow-md">Access Server Console</span>
          </button>
          
          <div className="w-px h-8 bg-border"></div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-700/50 border border-border shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)]">
            <span className="w-2 h-2 rounded-full bg-accent-green shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            <span className="text-[11px] font-mono text-text-secondary">System Online</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        <section className="w-full h-full flex flex-col relative bg-[#0a0a0f]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent-blue/5 via-surface-900 to-surface-900 pointer-events-none" />
          <CurriculumGraph />
        </section>
      </main>

      {/* Skeuomorphic Modal Overlay */}
      {showConsole && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-8 animate-fade-in-up">
          <div className="absolute inset-0" onClick={() => setShowConsole(false)}></div>
          
          <div className="relative w-full max-w-5xl h-[85vh] flex flex-col shadow-[0_30px_60px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)] rounded-2xl animate-counter-pop">
            {/* Close Button */}
            <button 
              onClick={() => setShowConsole(false)}
              className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-gradient-to-b from-[#3a3a45] to-[#1f1f2a] border border-[#4f4f5e] shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_10px_rgba(0,0,0,0.5)] flex items-center justify-center text-white hover:text-accent-red hover:brightness-110 active:shadow-[inset_0_3px_5px_rgba(0,0,0,0.5)] active:translate-y-[1px] transition-all z-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            <LiveRegistration />
          </div>
        </div>
      )}
    </div>
  );
}
