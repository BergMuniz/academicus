export enum QuestionType {
  SINGLE_ANSWER = 'Resposta Única',
  INCOMPLETE_STATEMENT = 'Afirmação Incompleta',
  MULTIPLE_COMPLEMENTATION = 'Complementação Múltipla',
  ASSERTION_REASON = 'Asserção e Razão',
  DISCURSIVE = 'Discursiva'
}

export enum BloomLevel {
  REMEMBER = 'Lembrar',
  UNDERSTAND = 'Entender',
  APPLY = 'Aplicar',
  ANALYZE = 'Analisar',
  EVALUATE = 'Avaliar',
  CREATE = 'Criar'
}

export enum DifficultyLevel {
  EASY = 'Fácil',
  MEDIUM = 'Médio',
  HARD = 'Difícil'
}

export interface GenerationRequest {
  course: string;
  content: string;
  learningObjective?: string;
  type: QuestionType;
  bloomLevel: BloomLevel;
  difficulty: DifficultyLevel;
  quantity: number;
  multipleRange?: 3 | 4 | 5;
  correctAlternative?: string;
}

export interface QuestionResponse {
  markdown: string;
  timestamp: Date;
}