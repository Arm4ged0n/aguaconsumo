<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auditoria Hídrica Sandro - Oficial</title>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #000; color: #f1f5f9; margin: 0; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .glass { background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); }
    </style>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel">
        const { useState, useMemo, useEffect } = React;

        // Ícones em SVG
        const IconActivity = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;
        const IconTrending = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>;
        const IconRefresh = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>;
        const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

        const App = () => {
            // DADOS TÉCNICOS EXTRAÍDOS DA FATURA (22 m3)
            const LEITURA_FECHAMENTO = 28.282; 
            const TAXA_FIXA = 39.32;
            const VALOR_AGUA_22M3 = 193.78; 
            const PRECO_POR_M3 = VALOR_AGUA_22M3 / 22; // Aprox R$ 8,80

            const [logs, setLogs] = useState(() => {
                const salvo = localStorage.getItem('sandro_final_v12');
                return salvo ? JSON.parse(salvo) : [
                    { id: 1, valor: 28.512, desc: 'Leitura Atual', timestamp: Date.now() },
                    { id: 0, valor: 28.387, desc: 'Leitura Anterior', timestamp: Date.now() - 86400000 }
                ];
            });

            const [input, setInput] = useState('');

            useEffect(() => {
                localStorage.setItem('sandro_final_v12', JSON.stringify(logs));
            }, [logs]);

            const stats = useMemo(() => {
                const atual = logs.length > 0 ? logs[0].valor : LEITURA_FECHAMENTO;
                const consumidoLitros = Math.round((atual - LEITURA_FECHAMENTO) * 1000);
                
                // Média Baseada na Fatura (733L/dia) ajustada pelo tempo real
                let mediaL = 733; 
                if (logs.length > 1) {
                    const diffM3 = logs[0].valor - logs[logs.length - 1].valor;
                    const diffDias = (logs[0].timestamp - logs[logs.length - 1].timestamp) / (1000 * 60 * 60 * 24);
                    if (diffDias > 0.05) {
                        mediaL = Math.round((diffM3 * 1000) / diffDias);
                    }
                }
                
                // Proteção para projeção não bugar com pouca leitura
                if (mediaL < 150) mediaL = 733;

                const projecao30DiasM3 = (mediaL * 30) / 1000;
                const faturaEstimada = TAXA_FIXA + (projecao30DiasM3 * PRECO_POR_M3);

                return {
                    atual,
                    consumidoLitros,
                    mediaL,
                    faturaEstimada,
                    totalCiclos: Math.floor(consumidoLitros / 100),
                    sobraCiclo: consumidoLitros % 100
                };
            }, [logs]);

            const salvar = () => {
                if (!input) return;
                const novo = {
                    id: Date.now(),
                    valor: parseFloat(input),
                    desc: `Registado em ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', {hour:'2d', minute:'2d'})}`,
                    timestamp: Date.now()
                };
                setLogs([novo, ...logs]);
                setInput('');
            };

            return (
                <div className="min-h-screen flex flex-col items-center p-4 space-y-4 max-w-md mx-auto">
                    
                    {/* Header */}
                    <div className="w-full flex justify-between items-center py-4 px-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/40"><IconActivity /></div>
                            <div className="text-left leading-none">
                                <h1 className="font-black italic text-xl tracking-tighter">HIDRO<span className="text-blue-500">SANDRO</span></h1>
                                <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mt-1">CORSAN • NOVA HARTZ</p>
                            </div>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    </div>

                    {/* Projeção Financeira Realista */}
                    <div className="w-full glass p-8 rounded-[2.5rem] border-l-4 border-l-blue-600 text-left relative overflow-hidden">
                        <div className="absolute right-6 top-6 opacity-10"><IconTrending /></div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Estimativa Próxima Conta</p>
                        <p className="text-5xl font-black italic text-white tracking-tighter">R$ {stats.faturaEstimada.toFixed(2)}</p>
                        <div className="mt-4 flex gap-2">
                            <span className="bg-blue-600/20 text-blue-400 text-[8px] font-black px-2 py-1 rounded-lg uppercase">Média: {stats.mediaL}L / Dia</span>
                            <span className="bg-slate-800 text-slate-500 text-[8px] font-black px-2 py-1 rounded-lg uppercase italic">Base: 22m³</span>
                        </div>
                    </div>

                    {/* Ciclos de 100 Litros */}
                    <div className="w-full glass p-6 rounded-[2.5rem] text-left">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-500 rounded-2xl shadow-lg"><IconRefresh /></div>
                            <div className="leading-none">
                                <h2 className="text-[8px] font-black uppercase text-slate-500 mb-1 tracking-widest">Enchimentos (100L)</h2>
                                <p className="text-4xl font-black italic text-white tracking-tighter">{stats.totalCiclos} <span className="text-sm opacity-30">VEZES</span></p>
                            </div>
                        </div>
                        <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                            <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase mb-2">
                                <span>Ciclo Atual</span>
                                <span className="text-blue-500">{stats.sobraCiclo} Litros / 100L</span>
                            </div>
                            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-blue-500 shadow-[0_0_15px_#3b82f6] transition-all duration-1000" style={{ width: `${stats.sobraCiclo}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Métricas Secundárias */}
                    <div className="grid grid-cols-2 gap-3 w-full">
                        <div className="glass p-5 rounded-[2rem] text-left">
                            <p className="text-[8px] font-black text-slate-500 uppercase mb-1 italic">Consumo Período</p>
                            <p className="text-3xl font-black italic text-white tracking-tighter">{stats.consumidoLitros}L</p>
                        </div>
                        <div className="glass p-5 rounded-[2rem] text-left border-l-4 border-l-green-500 shadow-xl shadow-green-950/20">
                            <p className="text-[8px] font-black text-slate-500 uppercase mb-1 text-green-500 italic">Visor Agora</p>
                            <p className="text-3xl font-black italic text-green-500 tracking-tighter">{stats.atual.toFixed(3)}</p>
                        </div>
                    </div>

                    {/* Bloco de Entrada */}
                    <div className="w-full bg-blue-600 p-1 rounded-[2.5rem] shadow-2xl">
                        <div className="bg-black rounded-[2.4rem] p-6 space-y-4">
                            <input 
                                type="number" step="0.001" value={input}
                                onChange={e => setInput(e.target.value)}
                                className="w-full bg-transparent text-center text-5xl font-black outline-none placeholder:opacity-10 text-white" 
                                placeholder="28.XXX" 
                            />
                            <button onClick={salvar} className="w-full bg-blue-600 text-black font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest active:scale-95 transition-all shadow-xl">
                                Registrar Medição
                            </button>
                        </div>
                    </div>

                    {/* Histórico */}
                    <div className="w-full space-y-3 pb-10">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] px-4 text-left italic">Auditoria de Leituras</p>
                        {logs.slice(0, 10).map(log => (
                            <div key={log.id} className="w-full glass p-4 flex justify-between items-center text-left rounded-2xl">
                                <div>
                                    <p className="text-[7px] font-bold text-slate-500 uppercase">{log.desc}</p>
                                    <p className="text-xl font-black italic text-white leading-none">{log.valor.toFixed(3)}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right leading-none">
                                        <p className="text-[7px] font-bold text-blue-500 uppercase mb-1">Total</p>
                                        <p className="text-sm font-black text-slate-400 italic">{Math.round((log.valor - LEITURA_FECHAMENTO)*1000)}L</p>
                                    </div>
                                    <button onClick={() => setLogs(logs.filter(l => l.id !== log.id))} className="text-slate-800 hover:text-red-500 transition-colors">
                                        <IconTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            );
        };

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>
