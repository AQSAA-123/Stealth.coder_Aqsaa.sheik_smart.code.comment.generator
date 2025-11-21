export interface CommentResult {
  comment: string;
  plausibilityScore: number; // Model's self-assessed confidence/plausibility (0-100)
  reasoning: string; // Why the model chose this comment
}

export interface MetricsData {
  tokenOverlap: number; // Proxy for ROUGE/BLEU (0-100)
  lengthRatio: number;
}

export enum Language {
  TypeScript = 'TypeScript',
  JavaScript = 'JavaScript',
  Python = 'Python',
  Java = 'Java',
  Go = 'Go',
  Rust = 'Rust'
}

export enum CommentStyle {
  Concise = 'Concise',
  Detailed = 'Detailed',
  Docstring = 'Docstring',
  Inline = 'Inline'
}

export interface HistoryItem {
    id: string;
    timestamp: number;
    codeSnippet: string;
    generatedComment: string;
    plausibility: number;
    style: CommentStyle;
}