
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

// --- SERVIÇO GEMINI ---
const generateDietPlan = async (userData: UserData, macros: CalculatedMacros, preferences: UserPreferences): Promise<DietPlan> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const prompt = `Aja como um nutricionista esportivo sênior do Team Ferres. Gere um plano de bulking: ${macros.totalCalories}kcal, ${macros.protein}g P, ${macros.fat}g G, ${macros.carbs}g C. Refeições: ${preferences.numMeals}. Intolerâncias: Lactose(${preferences.lactoseIntolerant}), Glúten(${preferences.glutenIntolerant}). Doces: ${preferences.likesChocolate}.`;
  
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

// --- COMPONENTES DE UI ---

const SubstitutionModal = ({ substitution, onClose }: { substitution: Substitution | null; onClose: () => void }) => {
  if (!substitution) return null;
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-stone-100">
        <div className="p-6 bg-slate-950 text-[#C5A059] flex justify-between items-center border-b-2 border-[#C5A059]">
          <h4 className="font-black text-sm uppercase tracking-widest">{substitution.item}</h4>
          <button onClick={onClose} className="p-2">✕</button>
        </div>
        <div className="p-8">
          <ul className="space-y-3">
            {substitution.alternatives.map((alt, i) => (
              <li key={i} className="flex items-center space-x-3 text-slate-800 bg-stone-50 p-4 rounded-2xl border border-stone-100 font-bold text-sm">{alt}</li>
            ))}
          </ul>
        </div>
        <button onClick={onClose} className="w-full py-4 bg-stone-50 text-slate-600 font-black uppercase text-xs">Fechar</button>
      </div>
    </div>
  );
};

const MealCard = ({ meal }: { meal: Meal }) => {
  const [selectedSub, setSelectedSub] = useState<Substitution | null>(null);
  const isExtra = meal.title.toLowerCase().includes('extra');
  return (
    <div className={`bg-white rounded-3xl shadow-2xl border ${isExtra ? 'border-[#C5A059]' : 'border-stone-100'} overflow-hidden mb-8 break-inside-avoid`}>
      <div className={`${isExtra ? 'bg-[#C5A059]' : 'bg-slate-950'} p-6 flex justify-between items-center`}>
        <h3 className={`${isExtra ? 'text-slate-950' : 'text-white'} text-2xl font-black uppercase`}>{meal.title}</h3>
      </div>
      <div className={`grid ${isExtra ? 'grid-cols-1' : 'md:grid-cols-2'} divide-stone-100 divide-y md:divide-y-0 md:divide-x`}>
        <div className="p-8 space-y-4 bg-stone-50/30">
          <span className="bg-slate-950 text-[#C5A059] text-[9px] font-black px-3 py-1 rounded-full uppercase">Opção 1</span>
          <p className="text-slate-700 text-sm font-semibold leading-relaxed whitespace-pre-line">{meal.practical.description}</p>
          <div className="flex flex-wrap gap-2">
            {meal.practical.substitutions.map((sub, i) => (
              <button key={i} onClick={() => setSelectedSub(sub)} className="px-3 py-1 bg-white border border-stone-200 rounded-lg text-[10px] font-black uppercase no-print">Trocando {sub.item}</button>
            ))}
          </div>
        </div>
        {!isExtra && (
          <div className="p-8 space-y-4">
            <span className="bg-[#C5A059] text-white text-[9px] font-black px-3 py-1 rounded-full uppercase">Opção 2</span>
            <p className="text-slate-800 text-sm leading-relaxed font-bold whitespace-pre-line">{meal.elaborate.description}</p>
          </div>
        )}
      </div>
      <SubstitutionModal substitution={selectedSub} onClose={() => setSelectedSub(null)} />
    </div>
  );
};

const ProgressionGuide = ({ macros, userData }: { macros: CalculatedMacros, userData: UserData }) => {
  const kcalPerKg = Number((macros.totalCalories / userData.weight).toFixed(1));
  const increaseAmount = Math.min(300, Math.round(macros.totalCalories * 0.10));
  return (
    <div className="mt-16 bg-white border-2 border-slate-950 rounded-[3rem] overflow-hidden shadow-2xl break-inside-avoid">
      <div className="bg-slate-950 p-8 text-center border-b-4 border-[#C5A059]">
        <h3 className="text-[#C5A059] font-black uppercase tracking-[0.4em] text-xs mb-2">Protocolo de Evolução</h3>
        <h4 className="text-white text-3xl font-black uppercase">Guia Team Ferres</h4>
      </div>
      <div className="p-10 space-y-8">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100"><p className="text-2xl font-black">{macros.totalCalories}</p><p className="text-[9px] uppercase font-black opacity-40 tracking-widest">Kcal Base</p></div>
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100"><p className="text-2xl font-black">{kcalPerKg}</p><p className="text-[9px] uppercase font-black opacity-40 tracking-widest">Kcal/Kg</p></div>
          <div className="p-4 bg-slate-950 text-[#C5A059] rounded-2xl flex items-center justify-center"><p className="text-xs font-black uppercase tracking-widest">Bulking</p></div>
        </div>
        <div className="p-6 bg-slate-950 text-white rounded-3xl">
          <h5 className="font-black text-[#C5A059] uppercase mb-2 text-sm tracking-widest">Estratégia de Aumento</h5>
          <p className="text-xs text-slate-300">Se o peso estagnar por 2 semanas, adicione <span className="text-white font-bold">{increaseAmount} kcal</span> via carboidratos ({Math.round(increaseAmount/4)}g).</p>
        </div>
      </div>
    </div>
  );
};

// --- TELAS ---

const App = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData>({ weight: 75, height: 180, age: 25, sex: 'male' });
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);

  const macros = useMemo(() => {
    const calories = Math.round(userData.weight * 35);
    return { 
      totalCalories: calories, 
      protein: userData.weight * 2, 
      fat: userData.weight * 0.8, 
      carbs: Math.round((calories - (userData.weight * 2 * 4) - (userData.weight * 0.8 * 9)) / 4) 
    };
  }, [userData]);

  // Remove o loader do HTML assim que o React montar
  useEffect(() => {
    const loader = document.getElementById('loading-overlay');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.style.display = 'none', 500);
    }
  }, []);

  const handleStart = async () => {
    setLoading(true);
    try {
      const plan = await generateDietPlan(userData, macros, { 
        numMeals: 5, likesEggs: true, legumes: [], dairy: [], nuts: [], fruits: [], 
        lactoseIntolerant: false, glutenIntolerant: false, likesWhey: true, likesChocolate: true 
      });
      setDietPlan(plan);
      setStep(1);
    } catch (e) {
      alert("Erro na conexão. Verifique sua chave API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] p-4 md:p-8 text-white selection:bg-[#C5A059] selection:text-slate-950">
      <header className="mb-16 flex flex-col items-center no-print">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Team Ferres</h1>
        <div className="h-1.5 w-16 bg-[#C5A059] mt-2"></div>
      </header>

      <main className="max-w-4xl mx-auto">
        {step === 0 && (
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-lg mx-auto border border-stone-100 relative overflow-hidden text-slate-950">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#C5A059]"></div>
            <h2 className="text-3xl font-black uppercase text-center mb-10 tracking-tight">Protocolo Bulking</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Peso (kg)</label>
                  <input type="number" value={userData.weight} onChange={e=>setUserData({...userData, weight: +e.target.value})} className="w-full p-4 bg-stone-50 rounded-2xl border-2 border-stone-100 outline-none font-black text-slate-800 focus:border-[#C5A059] transition-colors" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Altura (cm)</label>
                  <input type="number" value={userData.height} onChange={e=>setUserData({...userData, height: +e.target.value})} className="w-full p-4 bg-stone-50 rounded-2xl border-2 border-stone-100 outline-none font-black text-slate-800 focus:border-[#C5A059] transition-colors" />
                </div>
              </div>
              <button onClick={handleStart} disabled={loading} className="w-full py-6 bg-slate-950 text-[#C5A059] font-black uppercase tracking-widest rounded-2xl hover:bg-[#C5A059] hover:text-white transition-all shadow-xl">
                {loading ? "Calculando Protocolo..." : "Gerar Cardápio de Bulking"}
              </button>
            </div>
          </div>
        )}

        {step === 1 && dietPlan && (
          <div className="animate-in fade-in duration-1000">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">{dietPlan.title}</h2>
              <p className="text-[#C5A059] font-black uppercase text-xs tracking-[0.4em] mt-3">Team Ferres</p>
            </div>

            <div className="mb-12 p-8 bg-slate-950 rounded-3xl shadow-2xl flex flex-wrap justify-center gap-10 text-center border-b-8 border-[#C5A059] break-inside-avoid">
              <div><p className="text-[#C5A059] font-black text-3xl mb-1">{macros.totalCalories}</p><p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Kcal Diárias</p></div>
              <div><p className="text-white font-black text-3xl mb-1">{macros.protein}g</p><p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Proteína</p></div>
              <div><p className="text-white font-black text-3xl mb-1">{macros.carbs}g</p><p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Carboidratos</p></div>
            </div>

            <div className="space-y-6">
              {dietPlan.meals.map((m, i) => <MealCard key={i} meal={m} />)}
            </div>

            <ProgressionGuide macros={macros} userData={userData} />

            <div className="mt-16 bg-white p-10 rounded-[3rem] shadow-2xl border border-stone-100 text-slate-950 flex flex-col items-center gap-8 no-print">
              <div className="text-center space-y-2">
                <h4 className="font-black text-2xl uppercase tracking-tighter">Mindset de Atleta</h4>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed max-w-md mx-auto">Siga o plano com disciplina. O resultado virá na constância dos macros.</p>
              </div>
              <button onClick={() => window.print()} className="px-10 py-5 bg-slate-950 text-[#C5A059] rounded-2xl font-black uppercase tracking-[0.3em] hover:bg-[#C5A059] hover:text-white transition-all shadow-2xl flex items-center space-x-4">
                <span>Imprimir Planejamento (PDF)</span>
              </button>
            </div>
          </div>
        )}
      </main>
      <footer className="mt-20 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest no-print">Team Ferres &copy; 2024 - Protocolo Bulking</footer>
    </div>
  );
};

// Montagem do App
const root = createRoot(document.getElementById('root')!);
root.render(<App />);
