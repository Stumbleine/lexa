export type GrammarMatch = {
  id: string;
  type: string;
  text: string;
  start: number;
  end: number;
  explanation: string;
};

export interface GrammarRule {
  id: string;
  name: string;
  description: string;
  detect(text: string): GrammarMatch[];
}
