
import React, { useState, useMemo } from 'react';
import { UserData, CalculatedMacros, UserPreferences, DietPlan } from './types.ts';
import Calculator from './components/Calculator.tsx';
import Preferences from './components/Preferences.tsx';
import DietDisplay from './components/DietDisplay.tsx';

enum Step {
  Calculator,
  Preferences,
  Result
}

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.Calculator);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);

  const calculatedMacros = useMemo<CalculatedMacros | null>(() => {
    if (!userData) return null;
    const calories = userData.weight * 35;
    const protein = userData.weight * 2;
    const fat = userData.weight * 1;
    const remainingKcal = calories - (protein * 4) - (fat * 9);
    const carbs = Math.max(0, remainingKcal / 4);

    return {
      totalCalories: Math.round(calories),
      protein: Math.round(protein),
      fat: Math.round(fat),
      carbs: Math.round(carbs)
    };
  }, [userData]);

  const handleCalculatorSubmit = (data: UserData) => {
    setUserData(data);
    setCurrentStep(Step.Preferences);
  };

  const handlePreferencesSubmit = (prefs: UserPreferences, plan: DietPlan) => {
    setPreferences(prefs);
    setDietPlan(plan);
    setCurrentStep(Step.Result);
  };

  const reset = () => {
    setUserData(null);
    setPreferences(null);
    setDietPlan(null);
    setCurrentStep(Step.Calculator);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-900 relative">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/90 to-slate-950 z-10" />
        <img 
          src="hero.png" 
          alt="Coach Hero" 
          className="w-full h-full object-cover object-top opacity-40 grayscale"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="bg-slate-950/80 backdrop-blur-md py-4 shadow-2xl border-b-2 border-[#C5A059]">
          <div className="max-w-4xl mx-auto px-4 flex justify-center items-center relative min-h-[80px]">
            <div className="flex flex-col md:flex-row items-center md:space-x-6">
              <div className="w-16 h-16 flex items-center justify-center">
                 <img 
                  src="logo.png" 
                  alt="Team Ferres" 
                  className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(197,160,89,0.3)]" 
                 />
              </div>
              <div className="text-center md:text-left mt-2 md:mt-0">
                <h1 className="text-2xl font-black text-white tracking-tighter uppercase leading-tight">Team Ferres</h1>
                <p className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em]">High Performance</p>
              </div>
            </div>
            {currentStep !== Step.Calculator && (
              <button 
                onClick={reset}
                className="absolute right-4 md:right-0 text-slate-300 hover:text-[#C5A059] text-[10px] md:text-xs font-black uppercase tracking-widest transition-all border border-stone-700 hover:border-[#C5A059] px-3 py-1.5 md:px-5 md:py-2.5 rounded-xl bg-slate-900/50"
              >
                Reiniciar
              </button>
            )}
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 pt-12 pb-24 flex-grow w-full">
          {currentStep === Step.Calculator && (
            <div className="flex flex-col items-center">
              <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
                <h2 className="text-6xl font-black text-white uppercase tracking-tighter mb-4 leading-none">Bulking Calculator</h2>
                <p className="text-[#C5A059] font-bold uppercase tracking-[0.3em] text-sm">A ciência do Bulking pelo Team Ferres</p>
              </div>
              <Calculator onSubmit={handleCalculatorSubmit} />
            </div>
          )}

          {currentStep === Step.Preferences && userData && calculatedMacros && (
            <Preferences 
              userData={userData} 
              macros={calculatedMacros} 
              onSubmit={handlePreferencesSubmit} 
            />
          )}

          {currentStep === Step.Result && dietPlan && calculatedMacros && userData && (
            <DietDisplay 
              dietPlan={dietPlan} 
              macros={calculatedMacros}
              userData={userData}
            />
          )}
        </main>

        <footer className="mt-auto text-center py-10 border-t border-stone-800 bg-slate-950/60 backdrop-blur-sm">
          <div className="flex justify-center mb-6">
            <img src="logo.png" alt="Logo Footer" className="h-12 w-auto opacity-50 grayscale hover:grayscale-0 transition-all" />
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.5em]">
            © 2024 Team Ferres - Transformação & Disciplina
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
