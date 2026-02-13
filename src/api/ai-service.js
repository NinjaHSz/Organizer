/**
 * AI Service for Image-to-Task Conversion
 * Using Google Gemini 1.5 Flash (Free Tier)
 */

export const AIService = {
  async processImage(base64Image) {
    const apiKey =
      localStorage.getItem("openrouter_api_key") ||
      "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"; // User will provide this

    if (!apiKey) {
      throw new Error(
        "API Key do OpenRouter não encontrada. Configure-a no menu de Ajustes.",
      );
    }

    const API_URL = "https://openrouter.ai/api/v1/chat/completions";

    const systemPrompt = `
      Você é um assistente especializado em organizar tarefas de estudantes.
      Analise a imagem de um caderno ou quadro branco e extraia as seguintes informações em JSON puro.
      
      REGRAS DE FORMATAÇÃO DA DESCRIÇÃO:
      - Use quebras de linha reais (\\n) para separar parágrafos e itens.
      - Use pontos (•) no início de cada linha para criar listas de subtópicos.
      - Se houver datas ou horários extras na imagem, coloque-os na descrição em uma linha separada.
      - Mantenha o texto bem estruturado e legível.

      Estrutura esperada:
      {
        "title": "Título curto da tarefa",
        "description": "Detalhes extras encontrados (formatados com quebras de linha)",
        "priority": "low | medium | high",
        "due_date": "YYYY-MM-DD" | null,
        "subject_suggestion": "Nome da matéria"
      }
    `;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Organizer PWA",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001", // Alta precisão e visão
          messages: [
            {
              role: "system",
              content: "Responda apenas com JSON puro, sem markdown.",
            },
            {
              role: "user",
              content: [
                { type: "text", text: systemPrompt },
                {
                  type: "image_url",
                  image_url: {
                    url: base64Image, // Inclui o prefixo data:image/jpeg;base64,...
                  },
                },
              ],
            },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Erro na API do OpenRouter");
      }

      const result = await response.json();
      const textResponse = result.choices[0].message.content;

      // Parser Robusto
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch)
        throw new Error("A IA não retornou um formato de dados válido.");

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("AI Processing Error:", error);
      throw error;
    }
  },

  async imageToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  },
};
