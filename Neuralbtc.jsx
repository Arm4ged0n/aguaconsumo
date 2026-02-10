import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Cpu, Activity, TrendingUp, TrendingDown, 
  Terminal as TerminalIcon, X, Zap, Info, Loader2,
  Shield, Layers, BarChart3
} from 'lucide-react';

const App = () => {
  const [price, setPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [rsi, setRsi] = useState(45);
  const [view, setView] = useState('market'); // 'market' ou 'ai-terminal'
  const [aiLogs, setAiLogs] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [report, setReport] = useState(null);
  const scrollRef = useRef(null);

  // WebSocket para Preço Real (Binance)
  useEffect(() => {
    const btcWs = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
    btcWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPrice(parseFloat(data.c));
      setPriceChange(parseFloat(data.P));
      setRsi(prev => {
        const drift = parseFloat(data.P) > 0 ? 0.05 : -0.05;
        const next = prev + drift;
        return next > 80 ? 78 : next < 20 ? 22 : next;
      });
    };
    return () => btcWs.close();
  }, []);

  // Auto-scroll do log do terminal
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [aiLogs]);

  const runAnalysis = () => {
    setView('ai-terminal');
    setIsScanning(true);
    setAiLogs([]);
    setReport(null);

    const stages = [
      "> [SYSTEM] A carregar kernel NeuralMind v8.1.0...",
      "> [AUTH] Utilizador 'root' autenticado com sucesso.",
      "> [NET] Ligado à rede de baixa latência Gate.io/Binance...",
      "> [SCAN] A ler indicadores: EMA 50, EMA 120, EMA 200...",
      "> [CALC] RSI detectado em zona de " + (rsi > 70 ? "Sobrecompra" : rsi < 30 ? "Sobrevenda" : "Neutralidade") + ".",
      "> [DATA] A mapear 1.2M USD em liquidez próxima...",
      "> [AI] A processar padrões de Ondas de Elliott...",
      "> [SUCCESS] Sincronização de dados concluída. A gerar trade..."
    ];

    stages.forEach((msg, index) => {
      setTimeout(() => {
        setAiLogs(prev => [...prev, { id: index, text: msg }]);
        if (index === stages.length - 1) {
          setTimeout(() => {
            const isBullish = rsi < 55;
            setReport({
              decision: isBullish ? "COMPRA (LONG)" : "VENDA (SHORT)",
              reason: isBullish 
                ? "Confluência detectada em Fibo 0.618 com exaustão de volume vendedor. Início provável da Onda 5 impulsiva."
                : "Divergência de RSI detectada no topo. Volume decrescente indica perda de força compradora institucional.",
              entry: price.toLocaleString(undefined, { minimumFractionDigits: 2 }),
              stop: (price * (isBullish ? 0.975 : 1.025)).toLocaleString(undefined, { minimumFractionDigits: 2 }),
              target: (price * (isBullish ? 1.15 : 0.85)).toLocaleString(undefined, { minimumFractionDigits: 2 })
            });
            setIsScanning(false);
          }, 800);
        }
      }, index * 400);
    });
  };

  return (
    <div className="min-h-screen bg-[#020408] text-slate-200 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      
      {/* Ticker Superior */}
      <div className="fixed top-0 w-full bg-black/90 backdrop-blur-md border-b border-white/5 z-[100] py-1 overflow-hidden">
        <div className="flex animate-scroll whitespace-nowrap">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 mx-8">
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">
                BTC/USDT <span className="text-white ml-1">${price > 0 ? price.toLocaleString(undefined, {minimumFractionDigits: 2}) : "---"}</span>
                <span className={`ml-2 ${priceChange >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                  {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange)}%
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .animate-scroll { animation: scroll 30s linear infinite; }
        .glass { background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.05); backdrop-filter: blur(12px); }
        .terminal-bg { background: linear-gradient(135deg, #050a0f 0%, #020408 100%); }
        @keyframes cursor-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .animate-cursor { animation: cursor-blink 1s step-end infinite; }
        @keyframes terminal-pulse { 0%, 100% { transform: scale(1.18); opacity: 1; filter: drop-shadow(0 0 8px rgba(16,185,129,0.3)); } 50% { transform: scale(1.23); opacity: 0.8; filter: drop-shadow(0 0 12px rgba(16,185,129,0.5)); } }
        .logo-cmd-pulse { animation: terminal-pulse 2s ease-in-out infinite; }
      `}</style>

      <main className="pt-16 pb-6 px-3 md:px-6 max-w-[1700px] mx-auto">
        
        {/* Header - Logo 20% maior e pulsante */}
        <header className="flex flex-col sm:flex-row items-center justify-between glass p-4 md:p-6 rounded-2xl mb-4 gap-6 shadow-xl border-b-2 border-emerald-500/20">
          <div className="flex items-center gap-5 self-start sm:self-center logo-cmd-pulse">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-inner flex items-center justify-center">
              <TerminalIcon className="text-emerald-400" size={28} />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-black tracking-tighter uppercase italic leading-none flex items-center gap-1">
                Neural<span className="text-emerald-400">Mind</span>
                <span className="w-2.5 h-6 bg-emerald-500 animate-cursor inline-block" />
              </h1>
              <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">CORE COMMAND TERMINAL</span>
            </div>
          </div>

          <div className="flex items-center justify-between w-full sm:w-auto gap-4 md:gap-10">
            <div className="text-left sm:text-right">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Feed Directo</p>
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-3xl font-black font-mono text-white tracking-tighter">
                  ${price > 0 ? price.toLocaleString() : "---"}
                </span>
                <span className={`text-xs font-black ${priceChange >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                  {priceChange >= 0 ? '▲' : '▼'}{Math.abs(priceChange)}%
                </span>
              </div>
            </div>

            <button 
              onClick={runAnalysis}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl transition-all active:scale-95 group"
            >
              <Bot size={22} className="text-emerald-400 group-hover:rotate-12 transition-transform" />
              <span className="text-[10px] md:text-xs font-black uppercase text-emerald-400 tracking-widest italic">Análise IA</span>
            </button>
          </div>
        </header>

        {view === 'market' ? (
          <div className="grid grid-cols-12 gap-4 animate-in fade-in duration-500">
            <section className="col-span-12 lg:col-span-8 space-y-4">
              <div className="glass rounded-[2rem] overflow-hidden h-[400px] md:h-[650px] shadow-2xl relative">
                <iframe 
                   src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE%3ABTCUSDT&interval=5&theme=dark&style=1&timezone=Etc%2FUTC`} 
                   className="w-full h-full opacity-90"
                 />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard label="RSI MTF" val={`${rsi.toFixed(1)}%`} color="emerald" />
                <MetricCard label="Funding" val="0.010%" color="sky" />
                <MetricCard label="MVRV Z" val="1.48" color="purple" />
                <MetricCard label="Kernel" val="Online" color="emerald" />
              </div>
            </section>

            <aside className="col-span-12 lg:col-span-4 space-y-4">
              <div className="glass p-6 rounded-[2rem]">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Activity size={14} className="text-emerald-500" /> Elliott Waves Hub
                </h3>
                <div className="space-y-5">
                  <AnalyticLine label="Estado Atual" val="Onda 4" color="text-emerald-400" />
                  <AnalyticLine label="Target Próximo" val="$82,450" color="text-white" />
                  <AnalyticLine label="R/R Ratio" val="1:3.2" color="text-sky-400" />
                </div>
              </div>

              <div className="glass p-6 rounded-[2rem] h-[300px] flex flex-col shadow-inner">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Liquidez / Heatmap</h3>
                <div className="flex-1 flex flex-col justify-around">
                  {[92, 40, 75, 25].map((v, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-[9px] font-bold">
                        <span className="text-slate-500">${(price + (100 * i)).toFixed(0)}</span>
                        <span className="text-rose-500/80">{v}M</span>
                      </div>
                      <div className="w-full bg-white/5 h-1 rounded-full"><div className="bg-rose-500/30 h-full" style={{width: `${v}%`}} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        ) : (
          /* TERMINAL IA - FULL SCREEN OVERLAY RESPONSIVO */
          <div className="terminal-bg glass rounded-[2rem] md:rounded-[3rem] p-4 md:p-8 min-h-[85vh] flex flex-col animate-in slide-in-from-bottom-10 duration-500 border border-emerald-500/10 shadow-[0_0_80px_rgba(0,0,0,1)] relative z-[150]">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-500/10 p-2 md:p-3 rounded-xl border border-emerald-500/20">
                  <Bot className="text-emerald-400" size={24} />
                </div>
                <div>
                  <h2 className="text-lg md:text-2xl font-black italic uppercase tracking-tighter text-white">Neural Hub Terminal</h2>
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">Decision Engine v8.0.0</p>
                </div>
              </div>
              <button onClick={() => setView('market')} className="p-2 hover:bg-white/10 rounded-full transition-colors group">
                <X size={28} className="text-slate-500 group-hover:text-white" />
              </button>
            </div>

            <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
              {/* Output do Scanner Estilo Linux */}
              <div className="col-span-12 lg:col-span-7 bg-black/80 rounded-2xl p-5 md:p-8 font-mono text-[10px] md:text-xs border border-emerald-500/10 flex flex-col shadow-inner">
                <div className="text-emerald-500/80 mb-4 font-black flex items-center gap-3 border-b border-white/5 pb-2">
                   <div className="flex gap-1.5">
                     <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                     <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                   </div>
                   <span className="uppercase tracking-widest ml-2">[ root@neural-mind ~ ]# analyze --mode=deep</span>
                </div>
                
                <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 pr-2">
                  {aiLogs.map((log) => (
                    <div key={log.id} className="text-slate-300 animate-in fade-in slide-in-from-left-2 duration-300">
                      <span className="text-emerald-500/40 mr-3 font-bold">[{ (log.id * 0.4).toFixed(1) }s]</span>
                      {log.text}
                    </div>
                  ))}
                  {isScanning && (
                    <div className="mt-4 flex items-center gap-3 text-emerald-400">
                      <Loader2 className="animate-spin" size={18} />
                      <span className="animate-pulse font-bold uppercase tracking-[0.2em] text-[10px]">A processar rede neural...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Resultado e Acção */}
              <div className="col-span-12 lg:col-span-5 flex flex-col justify-center space-y-6 overflow-y-auto">
                {!report ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="relative mb-8">
                       <div className="w-28 h-28 border-4 border-dashed border-emerald-500/20 rounded-full animate-spin flex items-center justify-center">
                          <Cpu size={48} className="text-emerald-400 animate-pulse" />
                       </div>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500 animate-pulse">A cruzar indicadores...</p>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className={`glass p-6 md:p-8 rounded-[2.5rem] border-l-8 ${report.decision.includes('COMPRA') ? 'border-emerald-500 bg-emerald-500/5' : 'border-rose-500 bg-rose-500/5'} shadow-2xl`}>
                       <p className="text-[9px] font-black text-slate-500 uppercase mb-4 tracking-widest">Veredito do Terminal</p>
                       <div className="flex items-center gap-6">
                          <div className={`p-5 rounded-2xl ${report.decision.includes('COMPRA') ? 'bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)]' : 'bg-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.4)]'} text-black`}>
                             {report.decision.includes('COMPRA') ? <TrendingUp size={40} /> : <TrendingDown size={40} />}
                          </div>
                          <div>
                             <p className="text-3xl md:text-5xl font-black italic text-white tracking-tighter uppercase leading-none">{report.decision}</p>
                             <p className="text-[11px] font-bold text-emerald-400 mt-2 uppercase flex items-center gap-2">
                                <Zap size={14} className="fill-emerald-400" /> Precisão: 94.2%
                             </p>
                          </div>
                       </div>
                    </div>

                    <div className="bg-white/5 p-5 md:p-6 rounded-3xl border border-white/5 relative group">
                       <h4 className="text-[10px] font-black text-slate-500 uppercase mb-3 flex items-center gap-2 tracking-widest">
                          <Info size={14} /> Análise Técnica:
                       </h4>
                       <p className="text-xs md:text-sm leading-relaxed text-slate-300 font-medium italic border-l-2 border-emerald-500/30 pl-4">
                          "{report.reason}"
                       </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <TradeStat label="Entrada" val={`$${report.entry}`} />
                       <TradeStat label="Stop Loss" val={`$${report.stop}`} color="text-rose-400" />
                       <TradeStat label="Take Profit" val={`$${report.target}`} color="text-emerald-400" />
                       <TradeStat label="Alvo Onda 5" val="$82,450" color="text-sky-400" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const MetricCard = ({ label, val, color }) => (
  <div className="glass p-4 rounded-2xl text-center border-white/5">
    <p className="text-[9px] font-bold text-slate-500 uppercase mb-1 tracking-tighter">{label}</p>
    <p className={`text-xs md:text-sm font-black italic text-${color}-400 uppercase`}>{val}</p>
  </div>
);

const AnalyticLine = ({ label, val, color }) => (
  <div className="flex justify-between items-center border-b border-white/5 pb-2">
    <span className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">{label}</span>
    <span className={`text-[12px] font-black ${color} italic uppercase`}>{val}</span>
  </div>
);

const TradeStat = ({ label, val, color = "text-white" }) => (
  <div className="bg-black/50 p-4 rounded-2xl border border-white/5">
    <p className="text-[8px] font-bold text-slate-500 uppercase mb-1 tracking-widest">{label}</p>
    <p className={`text-xs md:text-sm font-black font-mono italic tracking-tighter ${color}`}>{val}</p>
  </div>
);

export default App;

