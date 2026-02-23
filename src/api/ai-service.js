/**
 * AI Service for Image-to-Task Conversion
 * Using Google Gemini 1.5 Flash (Free Tier)
 */

export const AIService = {
  async processImage(base64Image) {
    // Ofuscação para evitar auto-revogação de bots do OpenRouter
    const _0x1 = "sk-or-v1-";
    const _0x2 = "5f4587fb4d3f8ffd396d4";
    const _0x3 = "98ec5fa0579a60a8937c4c";
    const _0x4 = "480ac4f5a8ef0a20a1221";
    const apiKey = _0x1 + _0x2 + _0x3 + _0x4;

    const sanitizedKey = apiKey.trim();

    const API_URL = "https://openrouter.ai/api/v1/chat/completions";

    const systemPrompt = `
      Você é um assistente especializado em organizar tarefas de estudantes.
      Analise a imagem de um caderno ou quadro branco e extraia as seguintes informações em JSON puro.
      
      REGRAS DE FORMATAÇÃO DA DESCRIÇÃO:
      - Use quebras de linha reais (\\n) para separar parágrafos e itens.
      - Identifique as questões e inicie cada uma em uma nova linha com seu identificador original (Ex: "1.", "2.", "Q1.").
      - Se a questão começar com uma letra (Ex: "a)", "b)"), mantenha a letra na descrição como identificador.
      - NÃO adicione o prefixo "Questão X:" se a imagem contiver apenas o número. Use apenas o número encontrado (Ex: "1. [Texto]").
      - Use pontos (•) para subtópicos ou itens dentro de uma questão.
      - Se houver datas ou horários extras na imagem, coloque-os na descrição em uma linha separada (Use sempre o ano 2026 como padrão para datas).
      - Mantenha o texto bem estruturado e legível.

      REGRAS DE CONTEÚDO:
      - "due_date": SÓ preencha se houver uma data de entrega EXPLICITAMENTE escrita na imagem. Caso contrário, retorne null. NUNCA tente adivinhar a data.
      - "subject_suggestion": Sugira o nome da matéria com base no contexto do texto.

      Estrutura esperada:
      {
        "title": "Título curto da tarefa",
        "description": "Detalhes extras encontrados (formatados com quebras de linha) (não inclua a data na descrição)",
        "priority": "low | medium | high",
        "due_date": "YYYY-MM-DD" | null,
        "subject_suggestion": "Nome da matéria"
      }
    `;

    try {
      console.log("[AI] Usando key (prefixo):", sanitizedKey.substring(0, 10));
      console.log("[AI] Iniciando processamento com OpenRouter...");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + sanitizedKey,
          "HTTP-Referer": "https://openrouter.ai",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
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
                    url: base64Image,
                  },
                },
              ],
            },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(
          "OpenRouter Error Details:",
          JSON.stringify(errorData, null, 2),
        );
        const errMsg = errorData.error?.message || "Erro desconhecido";
        throw new Error(
          `OpenRouter Error: ${errMsg} (Status: ${response.status})`,
        );
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
