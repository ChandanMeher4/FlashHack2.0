import { useState, useRef, useEffect, useCallback } from 'react';

const MAX_SEATS = 30;
const TOTAL_STUDENTS = 50;

/* ---------- Simulation helpers ---------- */

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function randomDelay() {
  return Math.floor(Math.random() * 60) + 15;
}

function timestamp() {
  return new Date().toISOString().slice(11, 23);
}

export default function LiveRegistration() {
  const [seats, setSeats] = useState(MAX_SEATS);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ success: 0, failed: 0, oversold: 0 });
  const [mode, setMode] = useState(null); // 'safe' | 'unsafe'
  const logRef = useRef(null);
  const cancelRef = useRef(false);
  const autoScrollEnabled = useRef(true);

  // Auto-scroll terminal
  useEffect(() => {
    if (logRef.current && autoScrollEnabled.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const handleScroll = useCallback(() => {
    if (!logRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = logRef.current;
    const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 50;
    autoScrollEnabled.current = isAtBottom;
  }, []);

  const addLog = useCallback((text, type = 'info') => {
    setLogs((prev) => [...prev, { text, type, ts: timestamp() }]);
  }, []);

  /* ---------- UNSAFE registration ---------- */
  const runUnsafe = useCallback(async () => {
    cancelRef.current = false;
    setRunning(true);
    setMode('unsafe');
    setLogs([]);
    setStats({ success: 0, failed: 0, oversold: 0 });
    let currentSeats = MAX_SEATS;
    setSeats(MAX_SEATS);

    addLog(`╔══════════════════════════════════════════════════╗`, 'header');
    addLog(`║   ⚠️  UNSAFE REGISTRATION — NO LOCK             ║`, 'header');
    addLog(`║   ${TOTAL_STUDENTS} students • ${MAX_SEATS} seats • Race condition demo    ║`, 'header');
    addLog(`╚══════════════════════════════════════════════════╝`, 'header');
    addLog('', 'info');

    const results = [];
    const readSeats = currentSeats; 

    addLog(`[INIT] All ${TOTAL_STUDENTS} threads reading seat count simultaneously...`, 'info');
    await sleep(400);
    addLog(`[READ] All threads see: ${readSeats} seats available`, 'warn');
    await sleep(300);
    addLog(`[RACE] All threads proceeding to register without locks...`, 'warn');
    addLog('', 'info');

    for (let i = 1; i <= TOTAL_STUDENTS; i++) {
      if (cancelRef.current) break;

      await sleep(randomDelay());

      if (readSeats > 0) {
        currentSeats = Math.max(0, currentSeats - 1);
        setSeats(currentSeats);

        if (currentSeats >= 0 && i <= MAX_SEATS) {
          addLog(
            `[T-${String(i).padStart(2, '0')}] Student #${String(i).padStart(2, '0')} → READ ${readSeats} seats → REGISTER ✓  (actual: ${currentSeats})`,
            'success'
          );
          results.push('success');
        } else {
          addLog(
            `[T-${String(i).padStart(2, '0')}] Student #${String(i).padStart(2, '0')} → READ ${readSeats} seats → REGISTER ✓  (actual: ${currentSeats}) ⚡ OVERSOLD!`,
            'error'
          );
          results.push('oversold');
        }
      } else {
        addLog(
          `[T-${String(i).padStart(2, '0')}] Student #${String(i).padStart(2, '0')} → REGISTER ✗  (no seats)`,
          'fail'
        );
        results.push('failed');
      }

      setStats({
        success: results.filter((r) => r === 'success').length,
        failed: results.filter((r) => r === 'failed').length,
        oversold: results.filter((r) => r === 'oversold').length,
      });
    }

    setSeats(Math.max(0, MAX_SEATS - results.filter(r => r === 'success' || r === 'oversold').length));

    addLog('', 'info');
    addLog(`╔══════════════════════════════════════════════════╗`, 'header');
    addLog(`║   RESULTS                                        ║`, 'header');
    addLog(`╚══════════════════════════════════════════════════╝`, 'header');

    const successCount = results.filter((r) => r === 'success').length;
    const oversoldCount = results.filter((r) => r === 'oversold').length;
    const failedCount = results.filter((r) => r === 'failed').length;

    addLog(`   ✅ Registered:  ${successCount}`, 'success');
    addLog(`   ⚡ OVERSOLD:    ${oversoldCount}`, 'error');
    addLog(`   ❌ Failed:      ${failedCount}`, 'fail');
    addLog('', 'info');
    addLog(`   🐛 BUG: ${oversoldCount} students registered for seats that don't exist!`, 'error');

    setRunning(false);
  }, [addLog]);

  /* ---------- SAFE registration ---------- */
  const runSafe = useCallback(async () => {
    cancelRef.current = false;
    setRunning(true);
    setMode('safe');
    setLogs([]);
    setStats({ success: 0, failed: 0, oversold: 0 });
    let currentSeats = MAX_SEATS;
    setSeats(MAX_SEATS);

    addLog(`╔══════════════════════════════════════════════════╗`, 'header');
    addLog(`║   🔒  SAFE REGISTRATION — WITH MUTEX LOCK        ║`, 'header');
    addLog(`║   ${TOTAL_STUDENTS} students • ${MAX_SEATS} seats • Serialized access     ║`, 'header');
    addLog(`╚══════════════════════════════════════════════════╝`, 'header');
    addLog('', 'info');

    addLog(`[INIT] Mutex lock initialized. Processing queue sequentially...`, 'info');
    await sleep(400);
    addLog('', 'info');

    const results = [];

    for (let i = 1; i <= TOTAL_STUDENTS; i++) {
      if (cancelRef.current) break;

      await sleep(randomDelay());

      addLog(
        `[T-${String(i).padStart(2, '0')}] 🔒 Acquiring lock...`,
        'info'
      );

      await sleep(20);

      if (currentSeats > 0) {
        currentSeats--;
        setSeats(currentSeats);
        addLog(
          `[T-${String(i).padStart(2, '0')}] Student #${String(i).padStart(2, '0')} → CHECK ${currentSeats + 1} seats → REGISTER ✓  (remaining: ${currentSeats}) 🔓`,
          'success'
        );
        results.push('success');
      } else {
        addLog(
          `[T-${String(i).padStart(2, '0')}] Student #${String(i).padStart(2, '0')} → CHECK 0 seats → REJECTED ✗  🔓`,
          'fail'
        );
        results.push('failed');
      }

      setStats({
        success: results.filter((r) => r === 'success').length,
        failed: results.filter((r) => r === 'failed').length,
        oversold: 0,
      });
    }

    addLog('', 'info');
    addLog(`╔══════════════════════════════════════════════════╗`, 'header');
    addLog(`║   RESULTS                                        ║`, 'header');
    addLog(`╚══════════════════════════════════════════════════╝`, 'header');

    const successCount = results.filter((r) => r === 'success').length;
    const failedCount = results.filter((r) => r === 'failed').length;

    addLog(`   ✅ Registered:  ${successCount}`, 'success');
    addLog(`   ❌ Rejected:    ${failedCount}`, 'fail');
    addLog(`   ⚡ Oversold:    0`, 'success');
    addLog('', 'info');
    addLog(`   ✅ All registrations handled correctly. No race conditions.`, 'success');

    setRunning(false);
  }, [addLog]);

  const reset = useCallback(() => {
    cancelRef.current = true;
    setRunning(false);
    setSeats(MAX_SEATS);
    setLogs([]);
    setStats({ success: 0, failed: 0, oversold: 0 });
    setMode(null);
  }, []);

  /* ---------- Log line color ---------- */
  function logColor(type) {
    switch (type) {
      case 'success': return '#10b981';
      case 'error':   return '#ef4444';
      case 'fail':    return '#64748b';
      case 'warn':    return '#f59e0b';
      case 'header':  return '#8b5cf6';
      default:        return '#94a3b8';
    }
  }

  /* ---------- Seat counter color ---------- */
  function seatColor() {
    const pct = seats / MAX_SEATS;
    if (pct > 0.5) return '#10b981';
    if (pct > 0.2) return '#f59e0b';
    return '#ef4444';
  }

  return (
    <div className="flex flex-col h-full bg-[#1b1b22] rounded-2xl overflow-hidden shadow-[inset_0_1px_3px_rgba(255,255,255,0.1),inset_0_-2px_10px_rgba(0,0,0,0.8)] border-[3px] border-[#2c2c36] relative">
      
      {/* Hardware Chassis Texture/Screws */}
      <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-gradient-to-br from-[#444] to-[#222] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center">
        <div className="w-[1px] h-2 bg-black/40 rotate-45"></div>
        <div className="w-2 h-[1px] bg-black/40 absolute rotate-45"></div>
      </div>
      <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-gradient-to-br from-[#444] to-[#222] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center">
        <div className="w-[1px] h-2 bg-black/40 rotate-[15deg]"></div>
        <div className="w-2 h-[1px] bg-black/40 absolute rotate-[15deg]"></div>
      </div>
      <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-gradient-to-br from-[#444] to-[#222] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center">
        <div className="w-[1px] h-2 bg-black/40 rotate-[80deg]"></div>
        <div className="w-2 h-[1px] bg-black/40 absolute rotate-[80deg]"></div>
      </div>
      <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-gradient-to-br from-[#444] to-[#222] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center">
        <div className="w-[1px] h-2 bg-black/40 rotate-[120deg]"></div>
        <div className="w-2 h-[1px] bg-black/40 absolute rotate-[120deg]"></div>
      </div>

      {/* Top Panel - Hardware Logo & Status */}
      <div className="flex items-center justify-between px-8 pt-6 pb-4 bg-gradient-to-b from-[#22222a] to-[#1b1b22] border-b-[2px] border-[#111116] shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-b from-[#111118] to-[#1e1e24] flex items-center justify-center border-t border-[#333340] border-b border-black shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] text-2xl drop-shadow-md">
            🎫
          </div>
          <div>
            <h2 className="text-xl font-black text-[#d1d5db] tracking-wider uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">Registration Interface</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-[#8b8b99] font-mono font-bold tracking-[0.2em] bg-[#111116] px-2 py-0.5 rounded-sm border border-[#22222a] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">MODEL: CR-301X</span>
            </div>
          </div>
        </div>

        {/* Hardware Status LEDs */}
        <div className="flex flex-col items-end gap-2 bg-[#111116] p-2.5 rounded-lg border-t border-black border-b border-[#333340] shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-3.5 h-3.5 rounded-full ${running ? 'bg-accent-red shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-[#4a1c1c] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]'} border border-[#111]`}></div>
              <span className="text-[8px] font-mono text-[#8b8b99] tracking-widest">BUSY</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-3.5 h-3.5 rounded-full ${!running && mode === 'unsafe' ? 'bg-accent-amber shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'bg-[#4d330c] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]'} border border-[#111]`}></div>
              <span className="text-[8px] font-mono text-[#8b8b99] tracking-widest">WARN</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-3.5 h-3.5 rounded-full ${!running && mode === 'safe' ? 'bg-accent-green shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-[#0f3d2b] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]'} border border-[#111]`}></div>
              <span className="text-[8px] font-mono text-[#8b8b99] tracking-widest">SAFE</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-3.5 h-3.5 rounded-full bg-accent-blue shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse border border-[#111]`}></div>
              <span className="text-[8px] font-mono text-[#8b8b99] tracking-widest">PWR</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 p-6 gap-6 relative bg-[radial-gradient(ellipse_at_center,_#25252e,_#1a1a21)] min-h-0">
        
        {/* Left Column - Display & Controls */}
        <div className="w-[30%] flex flex-col gap-6">
          
          {/* Main LCD Display */}
          <div className="bg-[#05110a] rounded-xl p-6 border-[3px] border-[#111] shadow-[0_2px_0_rgba(255,255,255,0.1),inset_0_5px_15px_rgba(0,0,0,1)] relative overflow-hidden flex-1 flex flex-col justify-center items-center">
            {/* LCD Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none z-10 opacity-60 mix-blend-multiply"></div>
            
            <div className="text-[10px] uppercase tracking-widest text-[#10b981] opacity-70 mb-2 font-mono z-20 text-shadow-sm">
              CS 301 — Algorithms
            </div>
            
            <div
              key={seats}
              className="animate-counter-pop z-20 text-center"
              style={{
                fontSize: 90,
                fontWeight: 900,
                lineHeight: 1,
                color: seatColor(),
                fontFamily: "'JetBrains Mono', monospace",
                fontVariantNumeric: 'tabular-nums',
                textShadow: `0 0 20px ${seatColor()}66, 0 0 40px ${seatColor()}33`,
                transition: 'color 0.3s ease',
              }}
            >
              {seats.toString().padStart(2, '0')}
            </div>
            
            <div className="flex flex-col items-center mt-2 z-20">
              <span className="text-xl font-bold text-[#10b981] opacity-60 font-mono">/ {MAX_SEATS}</span>
              <span className="text-[10px] text-[#10b981] opacity-50 mt-1 uppercase tracking-widest">seats remaining</span>
            </div>

            {/* LCD Progress bar */}
            <div className="mt-6 w-full h-3 bg-[#020805] rounded-[2px] overflow-hidden border border-[#0a2215] shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] z-20 relative">
              <div
                className="h-full transition-all duration-300 ease-out relative"
                style={{
                  width: `${(seats / MAX_SEATS) * 100}%`,
                  background: seatColor(),
                  boxShadow: `0 0 10px ${seatColor()}88`,
                }}
              >
                {/* Segments effect */}
                <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,rgba(0,0,0,0.6)_4px,rgba(0,0,0,0.6)_6px)]"></div>
              </div>
            </div>
          </div>

          {/* Hardware Buttons */}
          <div className="bg-[#1e1e26] p-4 rounded-xl border border-[#2c2c36] shadow-[inset_0_2px_5px_rgba(255,255,255,0.05),0_5px_15px_rgba(0,0,0,0.5)] flex flex-col gap-3 relative">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] text-[#666] font-mono tracking-widest font-bold">EXECUTION MODULE</div>
            
            <div className="mt-4 flex flex-col gap-3">
              {/* Unsafe Button */}
              <button
                onClick={runUnsafe}
                disabled={running}
                className="relative group w-full py-4 rounded bg-gradient-to-b from-[#d93838] to-[#b81d1d] border-t-2 border-[#ff6b6b] border-l border-[#cc2929] border-r border-[#991a1a] border-b-4 border-[#7a1515] text-white font-black tracking-wider text-sm shadow-[0_6px_0_#5c1010,0_10px_10px_rgba(0,0,0,0.5)] active:translate-y-[4px] active:border-b-0 active:shadow-[0_2px_0_#5c1010,0_2px_5px_rgba(0,0,0,0.5),inset_0_4px_8px_rgba(0,0,0,0.4)] active:mt-[4px] active:mb-[-4px] transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                UNSAFE RACE
                <div className="absolute top-1 left-2 w-2 h-2 rounded-full bg-white/30 shadow-[0_0_5px_rgba(255,255,255,0.5)]"></div>
              </button>

              {/* Safe Button */}
              <button
                onClick={runSafe}
                disabled={running}
                className="relative group w-full py-4 rounded bg-gradient-to-b from-[#10b981] to-[#059669] border-t-2 border-[#34d399] border-l border-[#0d9468] border-r border-[#087a55] border-b-4 border-[#065f42] text-white font-black tracking-wider text-sm shadow-[0_6px_0_#044732,0_10px_10px_rgba(0,0,0,0.5)] active:translate-y-[4px] active:border-b-0 active:shadow-[0_2px_0_#044732,0_2px_5px_rgba(0,0,0,0.5),inset_0_4px_8px_rgba(0,0,0,0.4)] active:mt-[4px] active:mb-[-4px] transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                SAFE MUTEX
                <div className="absolute top-1 left-2 w-2 h-2 rounded-full bg-white/30 shadow-[0_0_5px_rgba(255,255,255,0.5)]"></div>
              </button>
            </div>
            
            {/* Reset Button */}
            <div className="mt-2 pt-3 border-t border-[#111] flex justify-between items-center px-1">
              <span className="text-[9px] text-[#8b8b99] font-mono tracking-widest font-bold">SYS_RST</span>
              <button
                onClick={reset}
                className="relative group w-14 py-1.5 rounded bg-gradient-to-b from-[#f59e0b] to-[#b45309] border-t border-[#fbbf24] border-l border-[#d97706] border-r border-[#92400e] border-b-2 border-[#78350f] text-white font-black tracking-wider text-[9px] shadow-[0_3px_0_#451a03,0_4px_6px_rgba(0,0,0,0.5)] active:translate-y-[2px] active:border-b-0 active:shadow-[0_1px_0_#451a03,0_1px_3px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(0,0,0,0.4)] active:mt-[2px] active:mb-[-2px] transition-all cursor-pointer"
              >
                RESET
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Terminal CRT */}
        <div className="w-[70%] bg-[#08080c] rounded-xl border-[4px] border-[#181820] shadow-[0_2px_0_rgba(255,255,255,0.05),inset_0_10px_20px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col min-h-0">
          
          {/* CRT Screen Effects */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none z-10 opacity-30 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)] pointer-events-none z-10"></div>
          
          {/* CRT Header */}
          <div className="bg-[#111] border-b border-[#222] px-4 py-2 flex items-center justify-between z-20 shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
            <span className="text-[10px] text-[#4ade80] font-mono tracking-widest uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#4ade80] rounded-full animate-pulse shadow-[0_0_5px_#4ade80]"></span>
              tty1 - registration_daemon
            </span>
            <span className="text-[10px] text-[#666] font-mono">v2.4.1_x86_64</span>
          </div>

          {/* Terminal Output */}
          <div
            ref={logRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-6 py-4 bg-transparent font-mono text-[13px] leading-[1.6] z-20 relative scroll-smooth crt-scrollbar pr-2"
            style={{ 
              textShadow: '0 0 5px currentColor',
            }}
          >
            {logs.length === 0 && !running && (
              <div className="flex flex-col items-center justify-center h-full opacity-60">
                <div className="text-4xl mb-4 text-[#4ade80] opacity-50 drop-shadow-[0_0_10px_#4ade80]">_</div>
                <p className="text-[#4ade80] text-sm tracking-widest uppercase">System Ready</p>
                <p className="text-[#2a7a46] text-[10px] mt-2 font-bold tracking-widest uppercase">Awaiting execution command</p>
              </div>
            )}
            {logs.map((log, i) => (
              <div key={i} style={{ color: logColor(log.type) }} className="mb-[2px] break-all">
                {log.text}
              </div>
            ))}
            {running && <span className="terminal-cursor inline-block w-[8px] h-[15px] bg-[#10b981] ml-1 align-middle animate-pulse shadow-[0_0_8px_#10b981]" />}
          </div>
          
          {/* CRT Screen Glare */}
          <div className="absolute top-0 left-0 right-0 h-[150px] bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-30 transform -skew-y-3 origin-top-left"></div>
        </div>

      </div>
    </div>
  );
}
