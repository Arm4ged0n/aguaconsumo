import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Droplets, 
  Zap, 
  TrendingUp, 
  History,
  Target,
  ArrowRight,
  RefreshCw,
  Waves,
  Plus,
  Calendar
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const App = () => {
  // CONFIGURAÇÕES BASE (CORSAN)
  const LEITURA_FECHAMENTO_OFICIAL = 28.282; 
  const TAXA_FIXA_SERVICO = 39.32;
  const PRECO_M3 = 8.80;
  const CAPACIDADE_CAIXA_LITROS = 100;

  // HISTÓRICO MENSAL (FATURAS ANTERIORES)
  const dadosMensais = [
    { mes: '08/25', m3: 23 },
    { mes: '09/25', m3: 21 },
    { mes: '10/25', m3: 20 },
    { mes: '11/25', m3: 33 },
    { mes: '12/25', m3: 22 },
    { mes: '01/26', m3: 27 },
    { mes: '02/26', m3: 22 },
  ];

  // HISTÓRICO DETALHADO DA SEMANA (FORNECIDO PELO USUÁRIO)
  // Nota: Calculamos os litros consumidos em relação ao fecho de 28.282
  const logsSemana = [
    { data: 'Dom', valor: 28.139, desc: 'Domingo' }, // Valor abaixo do fecho (ajuste de ciclo anterior)
    { data: 'Seg', valor: 28.208, desc: 'Segunda' },
    { data: 'Seg/T', valor: 28.219, desc: 'Segunda Tarde' },
    { data: 'Ter', valor: 28.237, desc: 'Terça 03/02' },
    { data: 'Ter/N', valor: 28.255, desc: 'Terça Noite' },
    { data: 'Qua/N', valor: 28.303, desc: 'Quarta Noite' },
    { data: 'Qui', valor: 28.314, desc: 'Quinta 05/02' },
    { data: 'Qui/T', valor: 28.346, desc: 'Quinta Tarde' },
    { data: 'Sex', valor: 28.359, desc: 'Sexta 06/02' },
    { data: 'Sex/T', valor: 28.387, desc: 'Sexta Tarde' },
    { data: 'Sáb', valor: 28.398, desc: 'Sábado 07/02' },
  ];

  // O log mais recente é o estado atual
  const [logs, setLogs] = useState([
    { id: 1, valor: 28.398, label: 'Hoje', desc: 'Leitura Sábado' },
    ...logsSemana.map((l, i) => ({ id: i + 2, valor: l.valor, label: l.data, desc: l.desc }))
  ]);

  const [novoValor, setNovoValor] = useState('');

  const stats = useMemo(() => {
    const atual = logs[0].valor;
    const diferencaM3 = Math.max(atual - LEITURA_FECHAMENTO_OFICIAL, 0);
    const litrosConsumidos = Math.round(diferencaM3 * 1000);
    const custoAgua = diferencaM3 * PRECO_M3;
    const totalPagar = TAXA_FIXA_SERVICO + custoAgua;
    
    const totalCiclos = Math.floor(litrosConsumidos / CAPACIDADE_CAIXA_LITROS);
    const progressoCicloAtual = litrosConsumidos % CAPACIDADE_CAIXA_LITROS;

    return {
      atual,
      diferencaM3,
      litrosConsumidos,
      totalPagar,
      custoAgua,
      totalCiclos,
      progressoCicloAtual
    };
  }, [logs]);

  const handleAddLeitura = () => {
    if (!novoValor || isNaN(novoValor)) return;
    const valorNum = parseFloat(novoValor);
    setLogs([{ id: Date.now(), valor: valorNum, label: 'Novo', desc: 'Manual' }, ...logs]);
    setNovoValor('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans p-3 sm:p-6 lg:p-8">
      <style>
        {`
          @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .animate-spin-slow { animation: spin-slow 12s linear infinite; }
          input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        `}
      </style>

      <div className="max-w-[1200px] mx-auto space-y-4 sm:space-y-6">
        
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/30">
              <Activity className="text-blue-500 animate-pulse" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter italic text-white">
                AUDITORIA <span className="text-blue-500">SANDRO</span>
              </h1>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                Base CORSAN: {LEITURA_FECHAMENTO_OFICIAL.toFixed(3)} m³
              </p>
            </div>
          </div>
          <div className="flex gap-2">
             <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase">
               Histórico Ativo
             </div>
          </div>
        </header>

        {/* CONTADOR DE CICLOS (CAIXA 100L) */}
        <div className="bg-blue-600/10 border border-blue-500/20 p-5 rounded-[2rem] flex flex-col gap-4 relative overflow-hidden shadow-lg">
           <div className="absolute -right-4 -top-4 opacity-5 text-blue-400">
              <Waves size={100} />
           </div>
           <div className="flex items-center gap-4 z-10">
              <div className="p-3 bg-blue-500 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                 <RefreshCw className="text-black animate-spin-slow" size={24} />
              </div>
              <div>
                 <h2 className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-0.5 italic">Ciclos de Boia (100 Litros)</h2>
                 <p className="text-4xl font-black italic tracking-tighter">
                    {stats.totalCiclos} <span className="text-sm text-blue-500/60 not-italic uppercase font-bold">Vezes</span>
                 </p>
              </div>
           </div>
           <div className="z-10 bg-black/40 p-4 rounded-2xl border border-slate-800/50">
              <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase mb-2 italic">
                 <span>Volume no Ciclo Atual</span>
                 <span className="text-blue-400">{stats.progressoCicloAtual}L de 100L</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                 <div 
                  className="h-full bg-blue-500 shadow-[0_0_15px_#3b82f6] transition-all duration-1000" 
                  style={{ width: `${(stats.progressoCicloAtual / CAPACIDADE_CAIXA_LITROS) * 100}%` }}
                 ></div>
              </div>
           </div>
        </div>

        {/* CARDS KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-[2rem] relative overflow-hidden group">
            <p className="text-[10px] font-black text-slate-500 uppercase mb-1 italic">Consumo Real (Mês)</p>
            <div className="flex items-baseline gap-1">
              <p className="text-5xl font-black italic text-white tracking-tighter">{stats.litrosConsumidos}</p>
              <p className="text-lg font-bold text-blue-500 italic uppercase">Litros</p>
            </div>
            <div className="absolute bottom-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
               <Droplets size={40} />
            </div>
          </div>

          <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-[2rem] relative overflow-hidden group">
            <p className="text-[10px] font-black text-slate-500 uppercase mb-1 italic">Projeção Fatura</p>
            <div className="flex items-baseline gap-1">
              <p className="text-5xl font-black italic text-yellow-500 tracking-tighter">R$ {stats.totalPagar.toFixed(2)}</p>
            </div>
            <div className="absolute bottom-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
               <Zap size={40} />
            </div>
          </div>

          <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-[2rem] relative overflow-hidden">
            <p className="text-[10px] font-black text-slate-500 uppercase mb-1 italic">Visor Hidrômetro</p>
            <p className="text-5xl font-black italic text-green-500 tracking-tighter">{stats.atual.toFixed(3)}</p>
          </div>
        </div>

        {/* GRÁFICO SEMANAL (DADOS FORNECIDOS) */}
        <div className="bg-black border border-slate-900 rounded-[2.5rem] p-5 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Calendar size={14} className="text-blue-500" /> Evolução da Semana (m³)
            </h2>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={logsSemana}>
                <defs>
                  <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" stroke="#111" vertical={false} />
                <XAxis dataKey="data" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#475569', fontWeight: 'bold'}} />
                <YAxis hide={true} domain={['dataMin - 0.1', 'dataMax + 0.1']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #334155', borderRadius: '12px', fontSize: '10px' }}
                  formatter={(value) => [`${value.toFixed(3)} m³`, 'Leitura']}
                />
                <Area type="monotone" dataKey="valor" stroke="#3b82f6" strokeWidth={4} fill="url(#colorWave)" dot={{ r: 4, fill: '#3b82f6' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LISTA DE LOGS E INPUT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
           {/* INPUT */}
           <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] shadow-xl">
              <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest italic text-center">Registrar Agora</p>
              <div className="flex flex-col gap-4">
                 <input 
                   type="number" 
                   step="0.001"
                   inputMode="decimal"
                   value={novoValor}
                   onChange={(e) => setNovoValor(e.target.value)}
                   className="w-full bg-black border border-slate-800 rounded-2xl p-5 text-3xl font-black text-white focus:border-blue-500 outline-none text-center"
                   placeholder="28.XXX"
                 />
                 <button 
                   onClick={handleAddLeitura}
                   className="w-full bg-blue-600 hover:bg-blue-500 text-black font-black py-5 rounded-2xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] uppercase text-xs flex items-center justify-center gap-2"
                 >
                   <Plus size={18} /> Gravar Nova Medição
                 </button>
              </div>
           </div>

           {/* LOG DE AUDITORIA */}
           <div className="bg-slate-900/10 border border-slate-800 p-6 rounded-[2rem] max-h-[400px] overflow-y-auto custom-scrollbar">
              <h3 className="text-[10px] font-black uppercase text-slate-500 mb-4 flex items-center gap-2 sticky top-0 bg-[#050505] py-2 z-10">
                <History size={16} className="text-blue-500" /> Histórico de Registros
              </h3>
              <div className="space-y-3">
                 {logs.map((log) => (
                    <div key={log.id} className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-slate-900 group hover:border-blue-500/30 transition-all">
                       <div>
                          <p className="text-[8px] font-black text-slate-600 uppercase">{log.desc}</p>
                          <p className="text-xl font-black text-slate-200 italic">{log.valor.toFixed(3)}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[8px] font-black text-slate-600 uppercase">Litros</p>
                          <p className="text-sm font-black text-blue-500">
                             {Math.round(Math.max(log.valor - LEITURA_FECHAMENTO_OFICIAL, 0) * 1000)} L
                          </p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default App;

