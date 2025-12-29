
import React, { useState } from 'react';
import { UserData, CalculatedMacros, UserPreferences, DietPlan } from '../types.ts';
import { generateDietPlan } from '../services/geminiService.ts';

interface Props {
  userData: UserData;
  macros: CalculatedMacros;
  onSubmit: (prefs: UserPreferences, plan: DietPlan) => void;
}

const Preferences: React.FC<Props> = ({ userData, macros, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState<UserPreferences>({
    numMeals: 5,
    likesEggs: true,
    legumes: [],
    dairy: [],
    nuts: [],
    fruits: [],
    lactoseIntolerant: false,
    glutenIntolerant: false,
    likesWhey: true,
    likesChocolate: true
  });

  const legumeOptions = ['Feijão carioca', 'Feijão preto', 'Grão-de-bico', 'Lentilha'];
  const dairyOptions = ['Leite desnatado', 'Iogurte', 'Queijo branco', 'Muçarela', 'Prato', 'Requeijão light', 'Creme de ricota light'];
  const nutOptions = ['Castanha de caju', 'Castanha-do-pará', 'Nozes', 'Amendoim', 'Pasta de amendoim'];
  const fruitOptions = ['Banana', 'Maçã', 'Mamão', 'Laranja', 'Melancia', 'Manga', 'Abacaxi', 'Morango', 'Pera', 'Uva'];

  const toggleItem = (list: keyof UserPreferences, item: string) => {
    setPrefs(prev => {
      const currentList = prev[list] as string[];
      if (currentList.includes(item)) {
        return { ...prev, [list]: currentList.filter(i => i !== item) };
      } else {
        return { ...prev, [list]: [...currentList, item] };
      }
    });
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const plan = await generateDietPlan(userData, macros, prefs);
      onSubmit(prefs, plan);
    } catch (error) {
      alert("Houve um erro ao gerar sua dieta. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-slate-950 text-white rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 border-b-4 border-[#C5A059]">
        <div>
          <h3 className="text-[#C5A059] font-black uppercase text-xs tracking-[0.3em] mb-2">Plano de Atleta</h3>
          <p className="text-4xl font-black">{macros.totalCalories} <span className="text-slate-400 text-xl font-medium tracking-normal italic">kcal / dia</span></p>
        </div>
        <div className="flex space-x-8 text-center bg-stone-900/50 p-4 rounded-2xl border border-stone-800">
          <div>
            <p className="text-[#C5A059] font-black text-xl">{macros.protein}g</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Proteína</p>
          </div>
          <div>
            <p className="text-white font-black text-xl">{macros.carbs}g</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Carbos</p>
          </div>
          <div>
            <p className="text-white font-black text-xl">{macros.fat}g</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gordura</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-stone-100">
        <h3 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tight border-b border-stone-100 pb-4">Anamnese básica</h3>
        
        <div className="space-y-8">
          <div className="grid md:grid-cols-2 gap-4">
            <ToggleSection 
              title="Intolerância a Lactose?" 
              value={prefs.lactoseIntolerant} 
              onToggle={(val) => setPrefs({ ...prefs, lactoseIntolerant: val })} 
            />
            <ToggleSection 
              title="Intolerância a Glúten?" 
              value={prefs.glutenIntolerant} 
              onToggle={(val) => setPrefs({ ...prefs, glutenIntolerant: val })} 
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Frequência de Refeições</label>
            <div className="flex space-x-3">
              {[4, 5, 6].map(num => (
                <button
                  key={num}
                  onClick={() => setPrefs({ ...prefs, numMeals: num as 4 | 5 | 6 })}
                  className={`flex-1 py-4 px-4 rounded-2xl border-2 transition-all font-black ${
                    prefs.numMeals === num 
                      ? 'bg-slate-950 border-slate-950 text-[#C5A059]' 
                      : 'border-stone-100 bg-stone-50 text-slate-500 hover:border-stone-200'
                  }`}
                >
                  {num}X
                </button>
              ))}
            </div>
          </div>

          <ToggleSection 
            title="Gosta de Ovos?" 
            value={prefs.likesEggs} 
            onToggle={(val) => setPrefs({ ...prefs, likesEggs: val })} 
          />

          <SelectionSection 
            title="Seleção de Frutas" 
            options={fruitOptions} 
            selected={prefs.fruits} 
            onToggle={(item) => toggleItem('fruits', item)}
          />

          <SelectionSection 
            title="Leguminosas Favoritas" 
            options={legumeOptions} 
            selected={prefs.legumes} 
            onToggle={(item) => toggleItem('legumes', item)}
          />

          {!prefs.lactoseIntolerant && (
            <SelectionSection 
              title="Laticínios Permitidos" 
              options={dairyOptions} 
              selected={prefs.dairy} 
              onToggle={(item) => toggleItem('dairy', item)}
            />
          )}

          <SelectionSection 
            title="Oleaginosas & Gorduras" 
            options={nutOptions} 
            selected={prefs.nuts} 
            onToggle={(item) => toggleItem('nuts', item)}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <ToggleSection 
              title="Gosta de whey protein?" 
              value={prefs.likesWhey} 
              onToggle={(val) => setPrefs({ ...prefs, likesWhey: val })} 
            />
            <ToggleSection 
              title="Incluir Sobremesa (Doce)?" 
              value={prefs.likesChocolate} 
              onToggle={(val) => setPrefs({ ...prefs, likesChocolate: val })} 
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-5 bg-slate-950 hover:bg-[#C5A059] text-[#C5A059] hover:text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl transition-all flex items-center justify-center space-x-3 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}
          >
            {loading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-[#C5A059] border-t-transparent rounded-full"></div>
                <span>criando seu cardápio inicial</span>
              </>
            ) : (
              <span>Gerar Plano Team Ferres</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const ToggleSection: React.FC<{ 
  title: string; 
  value: boolean; 
  onToggle: (val: boolean) => void 
}> = ({ title, value, onToggle }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">{title}</label>
    <div className="flex space-x-2">
      <button
        onClick={() => onToggle(true)}
        className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all font-bold text-xs uppercase tracking-wider ${
          value === true 
            ? 'bg-slate-950 border-slate-950 text-[#C5A059] shadow-lg' 
            : 'border-stone-100 bg-stone-50 text-slate-500 hover:border-stone-200'
        }`}
      >
        Sim
      </button>
      <button
        onClick={() => onToggle(false)}
        className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all font-bold text-xs uppercase tracking-wider ${
          value === false 
            ? 'bg-slate-950 border-slate-950 text-[#C5A059] shadow-lg' 
            : 'border-stone-100 bg-stone-50 text-slate-500 hover:border-stone-200'
        }`}
      >
        Não
      </button>
    </div>
  </div>
);

const SelectionSection: React.FC<{ 
  title: string; 
  options: string[]; 
  selected: string[]; 
  onToggle: (item: string) => void 
}> = ({ title, options, selected, onToggle }) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</label>
    <div className="flex flex-wrap gap-2">
      {options.map(option => (
        <button
          key={option}
          onClick={() => onToggle(option)}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-2 ${
            selected.includes(option)
              ? 'bg-[#C5A059] border-[#C5A059] text-white shadow-md'
              : 'bg-stone-50 border-stone-100 text-slate-500 hover:border-stone-300'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  </div>
);

export default Preferences;
