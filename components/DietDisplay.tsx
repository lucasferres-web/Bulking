
import React, { useState } from 'react';
import { DietPlan, CalculatedMacros, Meal, Substitution, UserData } from '../types';

interface Props {
  dietPlan: DietPlan;
  macros: CalculatedMacros;
  userData: UserData;
}

const SubstitutionModal: React.FC<{ substitution: Substitution | null; onClose: () => void }> = ({ substitution, onClose }) => {
  if (!substitution) return null;
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-300 border border-stone-100">
        <div className="p-6 bg-slate-950 text-[#C5A059] flex justify-between items-center border-b-2 border-[#C5A059]">
          <h4 className="font-black text-sm uppercase tracking-widest">Opções: {substitution.item}</h4>
          <button onClick={onClose} className="p-2 hover:bg-slate-900 rounded-xl transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-8">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">Trocas Equivalentes:</p>
          <ul className="space-y-3">
            {substitution.alternatives.map((alt, i) => (
              <li key={i} className="flex items-center space-x-3 text-slate-800 bg-stone-50 p-4 rounded-2xl border border-stone-100 group hover:border-[#C5A059] transition-all">
                <div className="w-2 h-2 rounded-full bg-[#C5A059] group-hover:scale-150 transition-transform" />
                <span className="text-sm font-bold tracking-tight">{alt}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 bg-stone-50 border-t border-stone-100">
          <button onClick={onClose} className="w-full py-4 bg-white border border-stone-200 text-slate-600 font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-stone-100 transition-colors">Fechar Painel</button>
        </div>
      </div>
    </div>
  );
};

const MealCard: React.FC<{ meal: Meal }> = ({ meal }) => {
  const [selectedSub, setSelectedSub] = useState<Substitution | null>(null);
  const isExtra = meal.title.toLowerCase().includes('extra');

  return (
    <div className={`bg-white rounded-3xl shadow-2xl border ${isExtra ? 'border-[#C5A059] ring-2 ring-[#C5A059]/10' : 'border-stone-100'} overflow-hidden mb-8 group transition-all hover:shadow-stone-200`}>
      <div className={`${isExtra ? 'bg-[#C5A059]' : 'bg-slate-950'} p-6 flex justify-between items-center border-b ${isExtra ? 'border-[#C5A059]' : 'border-stone-800'}`}>
        <div>
          <h3 className={`${isExtra ? 'text-slate-950' : 'text-white'} text-2xl font-black uppercase tracking-tight`}>{meal.title}</h3>
        </div>
        {isExtra && (
          <div className="bg-slate-950/10 p-2 rounded-lg">
             <svg className="w-6 h-6 text-slate-950" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
          </div>
        )}
      </div>

      <div className={`grid ${isExtra ? 'grid-cols-1' : 'md:grid-cols-2'} divide-y md:divide-y-0 md:divide-x divide-stone-100`}>
        <div className={`p-8 space-y-4 ${isExtra ? 'bg-amber-50/50' : 'bg-stone-50/30'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="bg-slate-950 text-[#C5A059] text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Opção 1</span>
            {!isExtra && <span className="text-[10px] text-slate-500 font-bold italic">Direto ao ponto</span>}
          </div>
          <p className={`text-slate-700 ${isExtra ? 'text-lg font-black' : 'text-sm font-semibold'} leading-relaxed whitespace-pre-line`}>{meal.practical.description}</p>
          
          {meal.practical.substitutions.length > 0 && (
            <div className="pt-4 border-t border-stone-100">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Substitutos Disponíveis:</p>
              <div className="flex flex-wrap gap-2">
                {meal.practical.substitutions.map((sub, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedSub(sub)}
                    className="px-4 py-2 bg-white text-slate-800 text-[10px] font-black uppercase rounded-xl hover:border-[#C5A059] border-2 border-stone-200 transition-all shadow-sm"
                  >
                    {sub.item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {!isExtra && (
          <div className="p-8 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="bg-[#C5A059] text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Opção 2</span>
              <span className="text-[10px] text-slate-500 font-bold italic">Mais elaborada</span>
            </div>
            <p className="text-slate-800 text-sm leading-relaxed font-bold whitespace-pre-line">{meal.elaborate.description}</p>
            {meal.elaborate.substitutions.length > 0 && (
              <div className="pt-4 border-t border-stone-100">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Substitutos Disponíveis:</p>
                <div className="flex flex-wrap gap-2">
                  {meal.elaborate.substitutions.map((sub, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedSub(sub)}
                      className="px-4 py-2 bg-white text-slate-800 text-[10px] font-black uppercase rounded-xl hover:border-[#C5A059] border-2 border-stone-200 transition-all shadow-sm"
                    >
                      {sub.item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <SubstitutionModal substitution={selectedSub} onClose={() => setSelectedSub(null)} />
    </div>
  );
};

const ProgressionGuide: React.FC<{ macros: CalculatedMacros, userData: UserData }> = ({ macros, userData }) => {
  const kcalPerKg = Number((macros.totalCalories / userData.weight).toFixed(1));
  let level = "Inicial";
  let levelColor = "text-slate-500";
  
  if (kcalPerKg < 40) {
    level = "Bulking Leve";
    levelColor = "text-blue-500";
  } else if (kcalPerKg >= 40 && kcalPerKg < 45) {
    level = "Bulking Moderado";
    levelColor = "text-[#C5A059]";
  } else if (kcalPerKg >= 45 && kcalPerKg <= 50) {
    level = "Bulking Agressivo";
    levelColor = "text-orange-600";
  } else {
    level = "Limite Extremo";
    levelColor = "text-red-600";
  }

  // Regra dos 10% limitada a 300kcal
  const increaseAmount = Math.min(300, Math.round(macros.totalCalories * 0.10));
  const carbIncrease = Math.round(increaseAmount / 4);

  return (
    <div className="mt-16 bg-white border-2 border-slate-950 rounded-[3rem] overflow-hidden shadow-2xl print:shadow-none print:border-slate-300">
      <div className="bg-slate-950 p-8 text-center border-b-4 border-[#C5A059]">
        <h3 className="text-[#C5A059] font-black uppercase tracking-[0.4em] text-xs mb-2">Protocolo de Evolução</h3>
        <h4 className="text-white text-3xl font-black uppercase tracking-tight">Guia de Progressão Team Ferres</h4>
      </div>

      <div className="p-10 space-y-12">
        {/* Métricas Atuais */}
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-stone-50 rounded-3xl border border-stone-100">
            <p className="text-4xl font-black text-slate-950 mb-1">{macros.totalCalories}</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kcal Base Atuais</p>
          </div>
          <div className="p-6 bg-stone-50 rounded-3xl border border-stone-100">
            <p className={`text-4xl font-black ${levelColor} mb-1`}>{kcalPerKg}</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">kcal/kg Corporal</p>
          </div>
          <div className="p-6 bg-slate-950 rounded-3xl border border-[#C5A059]">
            <p className="text-2xl font-black text-[#C5A059] mb-1 uppercase leading-none mt-2">{level}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status do Plano</p>
          </div>
        </div>

        {/* Metas de Ganho */}
        <div className="p-8 bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200">
           <div className="flex items-center space-x-4 mb-4">
              <div className="bg-[#C5A059] p-2 rounded-lg">
                <svg className="w-6 h-6 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <h5 className="font-black text-xl text-slate-950 uppercase tracking-tight">Meta de Ganho de Peso</h5>
           </div>
           <p className="text-slate-600 font-semibold leading-relaxed">
             Sua meta é manter uma <span className="text-slate-950 font-black underline decoration-[#C5A059] decoration-2">média semanal</span> de ganho entre <span className="text-slate-950 font-black">250g a 500g</span>. 
           </p>
           <p className="text-[11px] mt-4 text-slate-500 font-bold italic leading-tight">
             * Atenção: Isso não significa que o peso subirá exatamente todas as semanas de forma linear. O corpo oscila; foque na média acumulada ao longo do tempo.
           </p>
        </div>

        {/* Regra de Ouro */}
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="bg-slate-950 text-[#C5A059] w-10 h-10 rounded-full flex items-center justify-center font-black flex-shrink-0 border-2 border-[#C5A059]">!</div>
            <h5 className="font-black text-xl text-slate-950 uppercase tracking-tight">Quando Ajustar o Plano?</h5>
          </div>
          <p className="text-slate-600 font-semibold leading-relaxed pl-14">
            Se a sua <span className="font-bold text-slate-950">média semanal</span> de peso estagnar por <span className="text-slate-950 font-black border-b-2 border-[#C5A059]">2 semanas consecutivas</span>, é hora de realizar um ajuste.
          </p>
        </div>

        {/* Como Ajustar */}
        <div className="bg-slate-950 text-white p-8 rounded-3xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
           </div>
           <h5 className="font-black text-xl uppercase tracking-tight mb-4 text-[#C5A059]">Estratégia de Aumento</h5>
           <div className="space-y-4 relative z-10">
              <p className="text-slate-300 font-medium">Aumente aproximadamente <span className="text-white font-black">10% das calorias totais</span> (máximo de 300 kcal).</p>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-sm font-bold leading-relaxed text-[#C5A059]">
                   COMO FAZER: Adicione cerca de <span className="text-white text-lg underline">{carbIncrease}g de Carboidratos</span> extras ao seu total diário.
                </p>
                <p className="text-[10px] mt-2 text-slate-400 font-black uppercase italic">Dica: Priorize carboidratos de fácil digestão (arroz, batata, frutas) para bater a meta.</p>
              </div>
           </div>
        </div>

        {/* Níveis de Bulking */}
        <div className="grid md:grid-cols-2 gap-6">
           <div className="border-l-4 border-[#C5A059] pl-6 py-2">
              <h6 className="font-black text-slate-950 uppercase text-sm mb-1">Nível Moderado</h6>
              <p className="text-xs text-slate-500 font-bold tracking-tight">40 a 45 kcal/kg de peso corporal.</p>
           </div>
           <div className="border-l-4 border-orange-500 pl-6 py-2">
              <h6 className="font-black text-slate-950 uppercase text-sm mb-1">Nível Agressivo</h6>
              <p className="text-xs text-slate-500 font-bold tracking-tight">45 a 50 kcal/kg de peso corporal.</p>
           </div>
        </div>

        {/* Alerta Final */}
        <div className="p-6 bg-red-50 border-2 border-red-100 rounded-3xl">
           <p className="text-red-900 text-xs font-bold leading-relaxed text-center">
             <span className="font-black uppercase">⚠️ AVISO:</span> Não é aconselhado ultrapassar 50 kcal/kg, a menos que os pilares do bulking (treino, some e digestão) estejam intactos. Consulte o e-book para entender a fundo esses pilares.
           </p>
        </div>
      </div>
    </div>
  );
};

const DietDisplay: React.FC<Props> = ({ dietPlan, macros, userData }) => {
  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-12">
        <span className="bg-[#C5A059] text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-6 inline-block shadow-lg shadow-amber-200/50">
          Prescrição Team Ferres
        </span>
        <h2 className="text-5xl font-black text-white mb-4 uppercase tracking-tighter leading-none">{dietPlan.title}</h2>
        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest max-w-lg mx-auto leading-relaxed">
          Siga rigorosamente as quantidades para máxima performance estética e funcional.
        </p>
      </div>

      <div className="mb-12 p-8 bg-slate-950 rounded-3xl shadow-2xl flex flex-wrap justify-center gap-10 text-center border-b-8 border-[#C5A059]">
        <div className="min-w-[120px]">
          <p className="text-[#C5A059] font-black text-3xl mb-1">{macros.totalCalories}</p>
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Kcal Totais</p>
        </div>
        <div className="min-w-[120px]">
          <p className="text-white font-black text-3xl mb-1">{macros.protein}g</p>
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Proteínas</p>
        </div>
        <div className="min-w-[120px]">
          <p className="text-white font-black text-3xl mb-1">{macros.carbs}g</p>
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Carboidratos</p>
        </div>
        <div className="min-w-[120px]">
          <p className="text-white font-black text-3xl mb-1">{macros.fat}g</p>
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Gorduras</p>
        </div>
      </div>

      <div className="space-y-6">
        {dietPlan.meals.map((meal, idx) => (
          <MealCard key={idx} meal={meal} />
        ))}
      </div>

      <div className="mt-16 bg-white p-10 rounded-[3rem] shadow-2xl border border-stone-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/5 rounded-bl-full -mr-8 -mt-8" />
        <div className="flex items-center space-x-5 mb-8">
          <div className="w-16 h-16 flex items-center justify-center">
             <img src="logo.png" alt="Logo Mindset" className="w-full h-full object-contain" />
          </div>
          <h4 className="font-black text-2xl text-slate-950 uppercase tracking-tighter leading-none">Mindset de Atleta</h4>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-6 bg-stone-50 rounded-3xl border border-stone-100">
            <h5 className="font-black text-slate-950 mb-3 uppercase text-sm tracking-widest">Flexibilidade Nutricional</h5>
            <p className="text-sm text-slate-600 font-semibold leading-relaxed">Você pode alternar entre as opções 1 e 2 livremente. O que importa é a batida final de macros ao fim das 24h.</p>
          </div>
          <div className="p-6 bg-stone-50 rounded-3xl border border-stone-100">
            <h5 className="font-black text-slate-950 mb-3 uppercase text-sm tracking-widest">Substitutos Inteligentes</h5>
            <p className="text-sm text-slate-600 font-semibold leading-relaxed">Utilize o painel de substituições para manter o prazer na dieta sem comprometer o resultado estético planejado.</p>
          </div>
        </div>
      </div>

      <ProgressionGuide macros={macros} userData={userData} />

      <div className="mt-16 text-center flex flex-col items-center gap-6">
        <button 
          onClick={() => window.print()}
          className="px-10 py-5 bg-slate-950 text-[#C5A059] rounded-2xl font-black uppercase tracking-[0.3em] hover:bg-[#C5A059] hover:text-white transition-all shadow-2xl flex items-center space-x-4 transform hover:-translate-y-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          <span>Gerar PDF de Planejamento</span>
        </button>
        <div className="mt-4">
           <img src="logo.png" alt="Branding Final" className="h-10 opacity-40 mx-auto" />
        </div>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest max-w-sm italic">O resultado é proporcional à sua disciplina. Team Ferres.</p>
      </div>
    </div>
  );
};

export default DietDisplay;
