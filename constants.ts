import { QuestionType, BloomLevel, DifficultyLevel } from './types';

export const SYSTEM_INSTRUCTION = `Atue como um especialista em elaboração de questões do INEP.
Restrição Linguística: Siga rigorosamente a norma culta e o Novo Acordo Ortográfico.
Seu objetivo é criar questões universitárias de alta qualidade técnica e pedagógica.

REGRAS DE VERACIDADE (CRÍTICO):
1. O texto de suporte deve ser baseado em fatos, teorias reais ou excertos de obras existentes.
2. CITAÇÕES: As referências bibliográficas devem ser REAIS e VERIFICÁVEIS. NÃO INVENTE AUTORES, TÍTULOS OU ANOS DE PUBLICAÇÃO. Se não houver um texto exato, cite o autor e a obra de referência teórica correta.

REGRAS DE FORMATAÇÃO DE SAÍDA (RIGOROSO):
1. O texto de suporte (caso/contexto) deve ser o elemento central. NÃO escreva rótulos como "Texto-Base:", "Contexto:", "Texto:" antes dele.
2. SEPARAÇÃO DE QUESTÕES: Caso seja solicitado mais de uma questão, separe-as EXCLUSIVAMENTE com uma linha horizontal markdown (---) entre o feedback de uma e o início da próxima.`;

// Definição estendida com cores para UI
export const BLOOM_INFO: Record<BloomLevel, { verbs: string; description: string; activeClass: string; textClass: string; borderClass: string }> = {
  [BloomLevel.REMEMBER]: { 
    verbs: "Citar, Definir, Listar, Identificar, Recordar", 
    description: "Recuperar conhecimento relevante da memória.",
    activeClass: "bg-sky-200 border-sky-300 text-sky-800 shadow-sm",
    textClass: "text-sky-700",
    borderClass: "border-sky-200 bg-sky-50"
  },
  [BloomLevel.UNDERSTAND]: { 
    verbs: "Explicar, Resumir, Inferir, Paráfrasear, Interpretar", 
    description: "Construir significado a partir de mensagens instrucionais.",
    activeClass: "bg-sky-200 border-sky-300 text-sky-800 shadow-sm",
    textClass: "text-sky-700",
    borderClass: "border-sky-200 bg-sky-50"
  },
  [BloomLevel.APPLY]: { 
    verbs: "Executar, Implementar, Usar, Demonstrar, Calcular", 
    description: "Usar um procedimento em uma determinada situação.",
    activeClass: "bg-blue-200 border-blue-300 text-blue-800 shadow-sm",
    textClass: "text-blue-700",
    borderClass: "border-blue-200 bg-blue-50"
  },
  [BloomLevel.ANALYZE]: { 
    verbs: "Diferenciar, Organizar, Atribuir, Comparar, Desconstruir", 
    description: "Decompor o material em partes e determinar como as partes se relacionam.",
    activeClass: "bg-blue-200 border-blue-300 text-blue-800 shadow-sm",
    textClass: "text-blue-700",
    borderClass: "border-blue-200 bg-blue-50"
  },
  [BloomLevel.EVALUATE]: { 
    verbs: "Checar, Criticar, Julgar, Hipotetizar, Concluir", 
    description: "Fazer julgamentos baseados em critérios e padrões.",
    activeClass: "bg-indigo-200 border-indigo-300 text-indigo-800 shadow-sm",
    textClass: "text-indigo-700",
    borderClass: "border-indigo-200 bg-indigo-50"
  },
  [BloomLevel.CREATE]: { 
    verbs: "Gerar, Planejar, Produzir, Desenvolver, Combinar", 
    description: "Colocar elementos juntos para formar um todo coerente ou funcional.",
    activeClass: "bg-indigo-200 border-indigo-300 text-indigo-800 shadow-sm",
    textClass: "text-indigo-700",
    borderClass: "border-indigo-200 bg-indigo-50"
  }
};

// Informações detalhadas sobre os tipos de questões para a UI
export const QUESTION_TYPE_INFO: Record<QuestionType, { description: string; example: string; tip: string }> = {
  [QuestionType.SINGLE_ANSWER]: {
    description: "Formato clássico com enunciado fechado. Exige que o aluno identifique a única alternativa correta entre distractores plausíveis.",
    example: "Enunciado: Qual estrutura celular é responsável pela respiração aeróbica?\n\na) Ribossomo.\nb) Lisossomo.\nc) Mitocôndria.\nd) Complexo de Golgi.\ne) Retículo Endoplasmático.",
    tip: "Ideal para avaliar retenção de fatos, compreensão de conceitos e aplicação direta de fórmulas."
  },
  [QuestionType.INCOMPLETE_STATEMENT]: {
    description: "O enunciado é uma frase que termina abruptamente sem pontuação final. As alternativas completam a frase gramatical e semanticamente.",
    example: "Enunciado: No contexto da física newtoniana, a inércia pode ser definida como a tendência de um corpo em\n\na) aumentar sua velocidade constantemente.\nb) permanecer em seu estado de repouso ou movimento retilíneo uniforme.\nc) alterar sua massa independentemente da força.\nd) desacelerar na ausência de atrito.\ne) reagir instantaneamente a forças internas.",
    tip: "Excelente para testar definições precisas e relações de causa e efeito."
  },
  [QuestionType.MULTIPLE_COMPLEMENTATION]: {
    description: "Apresenta uma lista de asserções (I, II, III...) seguida de alternativas que agrupam as corretas. Exige análise combinatória de conhecimentos.",
    example: "I. A água ferve a 100ºC ao nível do mar.\nII. O gelo é menos denso que a água líquida.\nIII. A molécula de água é apolar.\n\nÉ correto o que se afirma em:\n\na) I, apenas.\nb) II, apenas.\nc) I e II, apenas.\nd) II e III, apenas.\ne) I, II e III.",
    tip: "Use para avaliar tópicos multifacetados onde o aluno precisa distinguir múltiplas verdades parciais."
  },
  [QuestionType.ASSERTION_REASON]: {
    description: "Duas afirmações conectadas pela palavra PORQUE. O aluno deve julgar a veracidade de cada uma e a relação de causalidade entre elas.",
    example: "Asserção I: O céu é azul durante o dia.\n\nPORQUE\n\nAsserção II: A atmosfera dispersa preferencialmente a luz solar de menor comprimento de onda.\n\na) As asserções I e II são verdadeiras, e a II é uma justificativa correta da I.\nb) As asserções I e II são verdadeiras, mas a II não é uma justificativa correta da I.\nc) A asserção I é uma proposição verdadeira, e a II é uma proposição falsa.\nd) A asserção I é uma proposição falsa, e a II é uma proposição verdadeira.\ne) As asserções I e II são proposições falsas.",
    tip: "O padrão ouro para avaliar raciocínio crítico profundo e entendimento de causalidade complexa."
  },
  [QuestionType.DISCURSIVE]: {
    description: "Questão aberta que exige a produção de um texto. Inclui comando base e tópicos obrigatórios (scaffolding) para guiar a resposta.",
    example: "Comando: Redija um texto dissertativo sobre os impactos da Inteligência Artificial na educação superior, abordando necessariamente:\n\na) Os benefícios para a personalização do ensino.\nb) Os riscos éticos relacionados ao plágio.\nc) O novo papel do docente como mediador.",
    tip: "Fundamental para avaliar capacidade de síntese, argumentação e estruturação de pensamento."
  }
};

// Interface para opções extras passadas ao prompt
interface PromptOptions {
  multipleRange?: 3 | 4 | 5;
  bloomLevel?: BloomLevel;
  difficulty?: DifficultyLevel;
  correctAlternative?: string;
  quantity?: number;
  learningObjective?: string;
}

// Helper para injetar instrução de Bloom
const getBloomInstruction = (level: BloomLevel | undefined) => {
  if (!level) return "";
  const info = BLOOM_INFO[level];
  return `\nNível Cognitivo (Taxonomia de Bloom): ${level}
Instrução Pedagógica: A questão deve exigir que o aluno utilize processos cognitivos de nível "${level}".
Verbos de Comando Sugeridos: ${info.verbs}.
Foco: ${info.description}\n`;
};

// Helper para injetar instrução de Dificuldade
const getDifficultyInstruction = (level: DifficultyLevel | undefined) => {
  if (!level) return "";
  const instructions = {
    [DifficultyLevel.EASY]: "Complexidade Baixa: Foque em conceitos fundamentais, definições claras e relações diretas. O texto-base deve ser simples e o distrator deve ser facilmente identificável por quem estudou o básico.",
    [DifficultyLevel.MEDIUM]: "Complexidade Média: Exija relacionamento entre conceitos e aplicação em contextos padrão. Os distratores devem ser plausíveis e exigir atenção aos detalhes.",
    [DifficultyLevel.HARD]: "Complexidade Alta: Exija análise minuciosa, nuances interpretativas e aplicação em contextos atípicos ou complexos (multidisciplinares). Os distratores devem ser muito bem elaborados, funcionando como 'cascas de banana' para quem tem conhecimento superficial."
  };
  return `\nNível de Dificuldade: ${level}
Instrução de Calibragem: ${instructions[level]}\n`;
};

// Helper para injetar instrução de quantidade
const getQuantityInstruction = (qty: number | undefined) => {
  const quantity = qty || 1;
  if (quantity === 1) return "";
  return `\nQUANTIDADE: Gere EXATAMENTE ${quantity} questões distintas sobre tópicos variados dentro do tema solicitado.
IMPORTANTE: Separe cada questão (incluindo seu feedback) da próxima usando "---" (linha horizontal).\n`;
};

// Helper para montar o contexto base com objetivo de aprendizagem
const getBaseContext = (course: string, content: string, options?: PromptOptions) => {
  let ctx = `para o curso de ${course}, sobre o conteúdo "${content}".`;
  if (options?.learningObjective) {
    ctx += `\nObjetivo de Aprendizagem: "${options.learningObjective}"`;
  }
  return ctx;
};

// Helper para o Footer Padronizado (Feedback)
const getFeedbackInstruction = () => `
# Relatório Técnico da Questão (RTQ)

### 1. Metadados
| Verbo de Comando | Complexidade Estimada | Estimativa de Tempo |
| :--- | :--- | :--- |
| (Identifique o verbo principal) | (Baixa/Média/Alta) | (Ex: 3 min) |

### 2. Classificação Taxonômica
> (Explique em 1 parágrafo como o item se alinha ao nível de Bloom solicitado. Descreva o processo mental que o aluno precisa realizar para chegar à resposta).

### 3. Análise das Alternativas
**Gabarito Correto:** [Indique a Letra]
*   **Justificativa:** Explique tecnicamente por que esta opção é a correta, fundamentando na teoria.
*   **Análise dos Distratores:** Explique brevemente por que as outras opções são incorretas, mas plausíveis.

### 4. Recomendação de Ajuste
> **Autoavaliação:** (Faça uma autocrítica honesta do item gerado. Sugira melhorias no enunciado, distratores ou suporte teórico para aumentar a precisão).

### 5. Indexação
**Tags:** #Tag1 #Tag2 #Tag3
`;

export const PROMPT_TEMPLATES: Record<QuestionType, (course: string, content: string, options?: PromptOptions) => string> = {
  [QuestionType.SINGLE_ANSWER]: (course, content, options) => `
Contexto: Crie ${options?.quantity || 1} questão(ões) de Resposta Única ${getBaseContext(course, content, options)}
${getQuantityInstruction(options?.quantity)}
${getBloomInstruction(options?.bloomLevel)}
${getDifficultyInstruction(options?.difficulty)}

Estrutura da Questão (Repita esta estrutura para cada questão solicitada):
1. Texto de Suporte: Gere um estudo de caso, situação-problema ou contexto teórico (máx. 10 linhas). NÃO escreva "Texto-Base:", inicie o texto diretamente.
   - OBRIGATÓRIO: Ao final do texto de suporte, pule uma linha e insira a referência no seguinte formato: "**Fonte:** [Sobrenome, Nome. Título da Obra. Editora, Ano (REAL e VERIFICÁVEL)]." Se o texto for autoral (ex: estudo de caso), indique a fonte teórica que embasa o caso.
2. Enunciado (Comando): Elabore uma pergunta direta ou uma ordem (usando verbo de comando alinhado ao nível de Bloom solicitado) que exija que o aluno resolva o problema apresentado no texto-base. Use voz ativa. Evite termos como "exceto" ou "incorreto".
3. Alternativas: Crie 5 alternativas (a, b, c, d, e).
    ◦ As alternativas devem ser simétricas em tamanho e estrutura gramatical.
    ◦ Os distratores (erradas) devem ser plausíveis, baseados em erros comuns de interpretação, e não absurdos óbvios.
    ◦ IMPORTANTE: Pule uma linha entre cada alternativa (use quebra de linha dupla) para que fiquem uma abaixo da outra.
    ◦ Exemplo de Formato:
      a) Texto...
      
      b) Texto...

${getFeedbackInstruction()}
`,

  [QuestionType.INCOMPLETE_STATEMENT]: (course, content, options) => `
Contexto: Crie ${options?.quantity || 1} questão(ões) de Afirmação Incompleta ${getBaseContext(course, content, options)}
${getQuantityInstruction(options?.quantity)}
${getBloomInstruction(options?.bloomLevel)}
${getDifficultyInstruction(options?.difficulty)}

Estrutura da Questão (Repita esta estrutura para cada questão solicitada):
1. Texto de Suporte: Um breve texto motivador ou caso prático (máx. 8 linhas). NÃO escreva "Texto-Base:", inicie o texto diretamente.
   - OBRIGATÓRIO: Ao final do texto de suporte, pule uma linha e insira a referência no seguinte formato: "**Fonte:** [Sobrenome, Nome. Título da Obra. Editora, Ano (REAL e VERIFICÁVEL)]."
2. Enunciado (Tronco): Escreva uma frase que retome o tema do texto-base e termine abruptamente, exigindo complementação.
    ◦ Regra de Ouro: A frase não deve ter ponto final. Garanta a concordância nominal e verbal perfeita entre o final do enunciado e o início de todas as alternativas (a, b, c, d, e). Não termine o enunciado com artigos (o, a) ou preposições que "entreguem" a resposta.
3. Alternativas: Crie 5 opções que completem a frase gramaticalmente e semanticamente.
    ◦ IMPORTANTE: Pule uma linha entre cada alternativa (use quebra de linha dupla) para que fiquem uma abaixo da outra.

${getFeedbackInstruction()}
`,

  [QuestionType.MULTIPLE_COMPLEMENTATION]: (course, content, options) => {
    const range = options?.multipleRange || 4;
    
    // Configurações dinâmicas baseadas no range
    let romanItemsInstruction = "";
    let alternativesInstruction = "";
    let romanList = "";
    let commandPhrase = "É correto apenas o que se afirma em";

    if (range === 3) {
      romanList = "I, II e III";
      romanItemsInstruction = "3 afirmações (numeradas em romanos: I, II e III)";
      alternativesInstruction = `
    a) I, apenas.
    
    b) II, apenas.
    
    c) I e III, apenas.
    
    d) II e III, apenas.
    
    e) I, II e III.`;
      commandPhrase = "É correto o que se afirma em";
    } else if (range === 5) {
      romanList = "I, II, III, IV e V";
      romanItemsInstruction = "5 afirmações (numeradas em romanos: I, II, III, IV e V)";
      // Lógica Balanceada para 5 itens: Cada numeral romano aparece exatamente 3 vezes.
      alternativesInstruction = `
    a) I, II e III.
    
    b) I, IV e V.
    
    c) II, III e IV.
    
    d) I, III e V.
    
    e) II, IV e V.`;
    } else {
      // Default 4 (Balanceado)
      romanList = "I, II, III e IV";
      romanItemsInstruction = "4 afirmações (numeradas em romanos: I, II, III e IV)";
      alternativesInstruction = `
    a) I e II.
    
    b) I e IV.
    
    c) II e III.
    
    d) I, III e IV.
    
    e) II, III e IV.`;
    }

    return `
Contexto: Crie ${options?.quantity || 1} questão(ões) de Complementação Múltipla ${getBaseContext(course, content, options)}
${getQuantityInstruction(options?.quantity)}
${getBloomInstruction(options?.bloomLevel)}
${getDifficultyInstruction(options?.difficulty)}

Estrutura da Questão (Repita esta estrutura para cada questão solicitada):
1. Texto de Suporte: Gere um suporte (texto, dados ou caso) necessário para a análise. NÃO escreva "Texto-Base:", inicie o texto diretamente.
   - OBRIGATÓRIO: Ao final do texto de suporte, pule uma linha e insira a referência no seguinte formato: "**Fonte:** [Sobrenome, Nome. Título da Obra. Editora, Ano (REAL e VERIFICÁVEL)]."
2. Comando de Transição: Insira exatamente a frase: "Considerando as informações apresentadas, avalie as afirmações a seguir."
3. Afirmações: Elabore ${romanItemsInstruction} sobre o texto-base.
    ◦ Misture proposições verdadeiras e falsas de forma equilibrada.
    ◦ OBRIGATÓRIO: Pule uma linha entre cada afirmação romana (${romanList}) para formar uma lista vertical clara.
4. Comando de Resposta: Insira exatamente a frase: "${commandPhrase}"
5. Alternativas: Utilize EXATAMENTE este modelo de distribuição (ajuste a verdade das afirmações para que se encaixem em um gabarito). OBRIGATÓRIO: Pule uma linha entre cada alternativa para formar uma lista vertical, usando letras minúsculas:
${alternativesInstruction}

${getFeedbackInstruction()}
`;
  },

  [QuestionType.ASSERTION_REASON]: (course, content, options) => {
    const target = options?.correctAlternative || 'A';
    
    return `
Contexto: Crie ${options?.quantity || 1} questão(ões) do tipo Asserção e Razão ${getBaseContext(course, content, options)}
${getQuantityInstruction(options?.quantity)}
${getBloomInstruction(options?.bloomLevel)}
${getDifficultyInstruction(options?.difficulty)}

Configuração do Gabarito (Engenharia Reversa) para a PRIMEIRA questão:
• Gabarito OBRIGATÓRIO da Questão 1: Alternativa ${target}

Estrutura da Questão (Siga rigorosamente a ordem visual abaixo):
1. Introdução (Opcional): Se decidir incluir uma frase inicial como "Seguem as questões...", coloque-a na PRIMEIRA LINHA do output, ANTES de qualquer outro texto.
2. Texto de Suporte (OBRIGATÓRIO): Escreva um texto-base robusto (MÍNIMO DE 10 LINHAS) com fundamentação teórica.
   - OBRIGATÓRIO: Ao final do texto de suporte, pule uma linha e insira a referência no seguinte formato: "**Fonte:** [Sobrenome, Nome. Título da Obra. Editora, Ano (REAL e VERIFICÁVEL)]."
3. Comando de Ligação (Imediato): Pule uma linha e escreva: "Considerando as informações apresentadas, avalie as asserções a seguir e a relação proposta entre elas."
4. Asserções (Bloco Central):
    I. [Escreva a Asserção I completa]
    
    PORQUE (Escrito em maiúsculas, centralizado)
    
    II. [Escreva a Asserção II completa]
5. Comando de Alternativas: Pule uma linha e escreva: "A respeito dessas asserções, assinale a opção correta."
6. Alternativas (IMPORTANTE: Cada alternativa DEVE vir em uma nova linha com um espaço em branco entre elas):

    a) As asserções I e II são proposições verdadeiras, e a II é uma justificativa correta da I.

    b) As asserções I e II são proposições verdadeiras, mas a II não é uma justificativa correta da I.

    c) A asserção I é uma proposição verdadeira, e a II é uma proposição falsa.

    d) A asserção I é uma proposição falsa, e a II é uma proposição verdadeira.

    e) As asserções I e II são proposições falsas.

${getFeedbackInstruction()}
`;
  },

  [QuestionType.DISCURSIVE]: (course, content, options) => `
Contexto: Crie ${options?.quantity || 1} questão(ões) Discursiva(s) ${getBaseContext(course, content, options)}
${getQuantityInstruction(options?.quantity)}
${getBloomInstruction(options?.bloomLevel)}
${getDifficultyInstruction(options?.difficulty)}

Estrutura da Questão (Repita esta estrutura para cada questão solicitada):
1. Texto de Suporte: Um contexto rico e complexo (caso clínico, situação gerencial, gráfico descrito ou fragmento de lei). NÃO escreva "Texto-Base:", inicie o texto diretamente.
   - OBRIGATÓRIO: Ao final do texto de suporte, pule uma linha e insira a referência no seguinte formato: "**Fonte:** [Sobrenome, Nome. Título da Obra. Editora, Ano (REAL e VERIFICÁVEL)]."
2. Comando Integrador: Insira a frase: "Com base na situação apresentada, redija um texto dissertativo abordando os seguintes aspectos:"
3. Tópicos (Scaffolding):
    ◦ a) [Solicite a identificação ou definição de um conceito chave do texto].
    ◦ b) [Solicite a análise crítica ou a proposição de uma solução prática para o caso].

${getFeedbackInstruction()}
`;
  }
};