
import { GoogleGenAI, Type } from "@google/genai";
import { UserData, CalculatedMacros, UserPreferences } from "../types";

export const generateDietPlan = async (
  userData: UserData,
  macros: CalculatedMacros,
  preferences: UserPreferences
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Aja como um nutricionista esportivo sênior do Team Ferres.
    Gere um plano alimentar de bulking personalizado rigoroso.
    
    Dados do Usuário:
    - Sexo: ${userData.sex === 'male' ? 'Masculino' : 'Feminino'}, Idade: ${userData.age}, Peso: ${userData.weight}kg, Altura: ${userData.height}cm.
    - Metas: ${macros.totalCalories} kcal, ${macros.protein}g Proteína, ${macros.fat}g Gordura, ${macros.carbs}g Carbo.
    
    Restrições e Preferências:
    - Intolerância à Lactose: ${preferences.lactoseIntolerant ? 'SIM (Não use nenhum derivado de leite com lactose)' : 'Não'}.
    - Intolerância ao Glúten: ${preferences.glutenIntolerant ? 'SIM (Não use trigo, cevada, centeio)' : 'Não'}.
    - Refeições principais: ${preferences.numMeals}.
    - Ovos: ${preferences.likesEggs ? 'Sim' : 'Não'}.
    - Gosta de Whey Protein: ${preferences.likesWhey ? 'Sim' : 'Não'}.
    - Gosta de Chocolate/Doces: ${preferences.likesChocolate ? 'Sim' : 'Não'}.
    - Leguminosas: ${preferences.legumes.join(', ') || 'Nenhuma preferência'}.
    - Laticínios: ${preferences.dairy.join(', ') || 'Nenhum preferência'}.
    - Oleaginosas: ${preferences.nuts.join(', ') || 'Nenhuma preferência'}.
    - Frutas: ${preferences.fruits.join(', ') || 'Nenhuma preferência'}.
    
    REGRAS DE SUBSTITUIÇÃO:
    1. Pão: 1 fatia de pão de forma = 0,5 pão francês = 6 torradas magic toast = 20g de tapioca.
    2. Arroz: 25g de arroz cozido = 25g de macarrão cozido = 60g de batata inglesa cozida = 25g de mandioca cozida.
    3. Frango/Carne: 100g de frango grelhado = 100g de frango desfiado = 100g de patinho moído = 100g de filé mignon grelhado = 125g de tilápia grelhada = 80g de salmão grelhado.
    4. Frutas: Ofereça opções equivalentes.
    
    REGRAS CRÍTICAS DE ESTRUTURA:
    1. Gere as ${preferences.numMeals} refeições principais solicitadas.
    2. NÃO inclua horários (time) para as refeições. Pode deixar o campo "time" vazio.
    3. Para cada refeição principal, forneça 'practical' (Opção 1) e 'elaborate' (Opção 2).
    4. NÃO inclua chocolate ou doces dentro das opções das refeições principais.
    5. SE o usuário gosta de chocolate (${preferences.likesChocolate}), ADICIONE uma refeição extra ao final da lista chamada "Refeição extra".
    6. Na "Refeição extra", tanto na Opção 1 quanto na Opção 2, coloque APENAS o texto: "Consumir até 150 calorias de doce ao dia, quando sentir vontade". Deixe as substituições vazias para esta refeição específica.
    7. Foco em alimentos refinados (Arroz branco, pão branco) para facilitar a digestão no bulking. Alimentos integrais apenas nos substitutos.
  `;

  try {
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
                  practical: {
                    type: Type.OBJECT,
                    properties: {
                      description: { type: Type.STRING },
                      substitutions: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            item: { type: Type.STRING },
                            alternatives: { type: Type.ARRAY, items: { type: Type.STRING } }
                          },
                          required: ["item", "alternatives"]
                        }
                      }
                    },
                    required: ["description", "substitutions"]
                  },
                  elaborate: {
                    type: Type.OBJECT,
                    properties: {
                      description: { type: Type.STRING },
                      substitutions: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            item: { type: Type.STRING },
                            alternatives: { type: Type.ARRAY, items: { type: Type.STRING } }
                          },
                          required: ["item", "alternatives"]
                        }
                      }
                    },
                    required: ["description", "substitutions"]
                  }
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
  } catch (error) {
    console.error("Error generating diet:", error);
    throw error;
  }
};
