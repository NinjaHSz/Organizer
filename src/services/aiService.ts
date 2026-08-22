export interface AIParsedTask {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  subject_suggestion?: string;
}

export const aiService = {
  async processImage(base64Image: string): Promise<AIParsedTask> {
    const apiKey =
      (import.meta.env.VITE_OPENROUTER_API_KEY as string) ||
      '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';
    const primaryModel =
      (import.meta.env.VITE_OPENROUTER_MODEL as string) || 'google/gemini-2.5-flash';
    const fallbackModel = 'google/gemini-2.5-flash-lite';

    const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

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
      - "due_date": SÓ preencha se houver uma data de entrega EXPLICITAMENTE escrita na imagem no formato YYYY-MM-DD. Caso contrário, retorne null. NUNCA tente adivinhar a data.
      - "subject_suggestion": Sugira o nome da matéria com base no contexto do texto (ex: Matemática, Física, Biologia, Química, História, Geografia, Português, Inglês, etc).

      Estrutura JSON esperada:
      {
        "title": "Título curto e claro da tarefa",
        "description": "Detalhes e questões encontradas (formatadas com quebras de linha)",
        "priority": "low" | "medium" | "high",
        "due_date": "YYYY-MM-DD" | null,
        "subject_suggestion": "Nome da matéria"
      }
    `;

    const makeRequest = async (modelName: string) => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + apiKey,
          'HTTP-Referer': window.location.origin || 'https://organizer.local',
        },
        body: JSON.stringify({
          model: modelName,
          max_tokens: 2000,
          messages: [
            {
              role: 'system',
              content: 'Responda apenas com JSON puro, sem formatação markdown ou blocos de código.',
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: systemPrompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: base64Image,
                  },
                },
              ],
            },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const msg = errJson.error?.message || `Status: ${response.status}`;
        throw new Error(msg);
      }

      const result = await response.json();
      const textResponse = result.choices?.[0]?.message?.content || '';

      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('A IA não retornou um formato de dados válido.');
      }

      return JSON.parse(jsonMatch[0]) as AIParsedTask;
    };

    try {
      return await makeRequest(primaryModel);
    } catch (err: any) {
      console.warn(`[AI Service] Falha com ${primaryModel}, tentando fallback com ${fallbackModel}:`, err);
      try {
        return await makeRequest(fallbackModel);
      } catch (fallbackErr: any) {
        console.error('[AI Service Error]:', fallbackErr);
        throw new Error(`Falha no scanner de IA: ${fallbackErr.message || err.message}`);
      }
    }
  },

  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  },
};
