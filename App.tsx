
import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

// --- INTERFACES ---
interface UserData { weight: number; height: number; age: number; sex: 'male' | 'female'; }
interface CalculatedMacros { totalCalories: number; protein: number; fat: number; carbs: number; }
interface UserPreferences {
  numMeals: 4 | 5 | 6; likesEggs: boolean; legumes: string[]; dairy: string[]; nuts: string[]; fruits: string[];
  lactoseIntolerant: boolean; glutenIntolerant: boolean; likesWhey: boolean; likesChocolate: boolean;
}
interface Substitution { item: string; alternatives: string[]; }
interface Meal {
  time: string; title: string;
  practical: { description: string; substitutions: Substitution[]; };
  elaborate: { description: string; substitutions: Substitution[]; };
}
interface DietPlan { title: string; meals: Meal[]; }

// --- SERVIÇO DE IA ---
const generateDietPlan = async (userData: UserData, macros: CalculatedMacros, preferences: UserPreferences): Promise<DietPlan> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `Aja como um nutricionista sênior do Team Ferres. Gere um plano de bulking: ${macros.totalCalories} kcal, ${macros.protein}g Proteína, ${macros.fat}g Gordura, ${macros.carbs}g Carbo. Refeições: ${preferences.numMeals}. Intolerâncias: Lactose(${preferences.lactoseIntolerant}), Glúten(${preferences.glutenIntolerant}).`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          meals: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING },
                title: { type: Type.STRING },
                practical: { type: Type.OBJECT, properties: { description: { type: Type.STRING }, substitutions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { item: { type: Type.STRING }, alternatives: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["item", "alternatives"] } } }, required: ["description", "substitutions"] },
                elaborate: { type: Type.OBJECT, properties: { description: { type: Type.STRING }, substitutions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { item: { type: Type.STRING }, alternatives: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["item", "alternatives"] } } }, required: ["description", "substitutions"] }
              },
              required: ["time", "title", "practical", "elaborate"]
            }
          }
        },
        required: ["title", "meals"]
      }
    }
  });
  return JSON.parse(response.text);
};

// --- COMPONENTES ---

const SubstitutionModal = ({ substitution, onClose }) => {
  if (!substitution) return null;
  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="bg-slate-950 p-6 text-[#C5A059] flex justify-between items-center border-b-2 border-[#C5A059]">
          <span className="font-black uppercase text-xs tracking-widest">{substitution.item}</span>
          <button onClick={onClose} className="text-xl">✕</button>
        </div>
        <div className="p-8 space-y-3">
          {substitution.alternatives.map((alt, i) => (
            <div key={i} className="p-4 bg-stone-50 border border-stone-100 rounded-2xl text-slate-800 font-bold text-sm flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#C5A059]" /> {alt}
            </div>
          ))}
        </div>
        <button onClick={onClose} className="w-full py-4 bg-stone-100 text-slate-500 font-black uppercase text-[10px]">Fechar</button>
      </div>
    </div>
  );
};

const MealCard = ({ meal }: { meal: Meal }) => {
  const [selectedSub, setSelectedSub] = useState<Substitution | null>(null);
  const isExtra = meal.title.toLowerCase().includes('extra');

  return (
    <div className={`bg-white rounded-[2rem] border ${isExtra ? 'border-[#C5A059]' : 'border-stone-100'} overflow-hidden mb-8 shadow-xl break-inside-avoid`}>
      <div className={`${isExtra ? 'bg-[#C5A059]' : 'bg-slate-950'} p-6`}>
        <h3 className={`${isExtra ? 'text-slate-950' : 'text-white'} text-2xl font-black uppercase tracking-tight`}>{meal.title}</h3>
      </div>
      <div className={`grid ${isExtra ? 'grid-cols-1' : 'md:grid-cols-2'} divide-stone-100 divide-y md:divide-y-0 md:divide-x`}>
        <div className="p-8 space-y-4 bg-stone-50/30">
          <span className="bg-slate-950 text-[#C5A059] text-[9px] font-black px-3 py-1 rounded-full uppercase">Opção 1</span>
          <p className="text-slate-700 text-sm font-semibold leading-relaxed whitespace-pre-line">{meal.practical.description}</p>
          <div className="flex flex-wrap gap-2">
            {meal.practical.substitutions.map((s, i) => (
              <button key={i} onClick={() => setSelectedSub(s)} className="px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-[9px] font-black uppercase text-slate-600 no-print">Trocar {s.item}</button>
            ))}
          </div>
        </div>
        {!isExtra && (
          <div className="p-8 space-y-4">
            <span className="bg-[#C5A059] text-white text-[9px] font-black px-3 py-1 rounded-full uppercase">Opção 2</span>
            <p className="text-slate-800 text-sm font-bold leading-relaxed whitespace-pre-line">{meal.elaborate.description}</p>
          </div>
        )}
      </div>
      <SubstitutionModal substitution={selectedSub} onClose={() => setSelectedSub(null)} />
    </div>
  );
};

// --- APP PRINCIPAL ---

const App = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData>({ weight: 75, height: 180, age: 25, sex: 'male' });
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);

  const macros = useMemo(() => {
    const kcal = Math.round(userData.weight * 35);
    return {
      totalCalories: kcal,
      protein: userData.weight * 2,
      fat: userData.weight * 0.8,
      carbs: Math.round((kcal - (userData.weight * 2 * 4) - (userData.weight * 0.8 * 9)) / 4)
    };
  }, [userData]);

  useEffect(() => {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.style.display = 'none', 500);
    }
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const plan = await generateDietPlan(userData, macros, {
        numMeals: 5, likesEggs: true, legumes: [], dairy: [], nuts: [], fruits: [],
        lactoseIntolerant: false, glutenIntolerant: false, likesWhey: true, likesChocolate: true
      });
      setDietPlan(plan);
      setStep(1);
    } catch (e) {
      alert("Falha ao gerar protocolo. Verifique a internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 font-sans">
      <header className="max-w-4xl mx-auto mb-16 flex flex-col items-center no-print">
        <h1 className="text-4xl font-black uppercase tracking-tighter italic">Team Ferres</h1>
        <div className="h-1 w-12 bg-[#C5A059] mt-2"></div>
      </header>

      <main className="max-w-4xl mx-auto">
        {step === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-10 max-w-lg mx-auto shadow-2xl border border-stone-100 text-slate-950 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#C5A059]"></div>
            <h2 className="text-3xl font-black uppercase text-center mb-8 tracking-tight">Protocolo Bulking</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Peso (kg)</label>
                  <input type="number" value={userData.weight} onChange={e=>setUserData({...userData, weight: +e.target.value})} className="w-full p-4 bg-stone-50 rounded-2xl border-2 border-stone-100 outline-none font-black text-slate-800 focus:border-[#C5A059]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Altura (cm)</label>
                  <input type="number" value={userData.height} onChange={e=>setUserData({...userData, height: +e.target.value})} className="w-full p-4 bg-stone-50 rounded-2xl border-2 border-stone-100 outline-none font-black text-slate-800 focus:border-[#C5A059]" />
                </div>
              </div>

              <div className="p-6 bg-slate-950 rounded-2xl text-center border-b-4 border-[#C5A059]">
                <p className="text-[#C5A059] text-3xl font-black mb-1">{macros.totalCalories}</p>
                <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Kcal Planejadas</p>
              </div>

              <button onClick={handleGenerate} disabled={loading} className="w-full py-6 bg-slate-950 text-[#C5A059] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-[#C5A059] hover:text-white transition-all">
                {loading ? "Processando..." : "Gerar Plano de Atleta"}
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-1000">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none mb-2">{dietPlan?.title}</h2>
              <span className="text-[#C5A059] font-black uppercase text-xs tracking-[0.4em]">Protocolo Individualizado</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                {v: macros.totalCalories, l: 'Kcal'},
                {v: macros.protein+'g', l: 'Proteína'},
                {v: macros.carbs+'g', l: 'Carbo'},
                {v: macros.fat+'g', l: 'Gordura'}
              ].map((m,i)=>(
                <div key={i} className="bg-slate-950 p-6 rounded-3xl border-b-4 border-[#C5A059] text-center">
                  <p className="text-xl font-black text-[#C5A059]">{m.v}</p>
                  <p className="text-[9px] text-slate-400 uppercase font-black">{m.l}</p>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              {dietPlan?.meals.map((m, i) => <MealCard key={i} meal={m} />)}
            </div>

            <div className="mt-16 bg-white p-12 rounded-[3rem] text-slate-950 shadow-2xl text-center no-print border border-stone-100">
              <h4 className="text-3xl font-black uppercase mb-4 tracking-tighter">Foco na Missão</h4>
              <p className="text-slate-500 font-bold text-sm uppercase mb-8 tracking-widest">Salve seu protocolo e comece a evolução hoje.</p>
              <button onClick={() => window.print()} className="px-10 py-5 bg-slate-950 text-[#C5A059] font-black uppercase tracking-widest rounded-2xl shadow-2xl hover:bg-[#C5A059] hover:text-white transition-all">
                Imprimir Protocolo (PDF)
              </button>
            </div>
          </div>
        )}
      </main>
      
      <footer className="mt-20 py-10 border-t border-slate-900 text-center no-print">
        <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.5em]">Team Ferres &copy; 2024</p>
      </footer>
    </div>
  );
};

// Montagem
const root = createRoot(document.getElementById('root')!);
root.render(<App />);
