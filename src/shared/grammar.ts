export type GrammarMatch = {
  id: string;
  type: string;
  text: string;
  start: number;
  end: number;
  explanation: string;
  consumed?: boolean; 
};

export interface GrammarRule {
  id: string;
  name: string;
  description: string;
  detect(text: string): GrammarMatch[];
}

export const RULE_PRIORITIES: Record<string, number> = {
  "future-perfect-continuous": 100,
  "present-perfect-continuous": 99,
  "past-perfect-continuous": 98,
  "future-perfect": 90,
  "present-perfect": 89,
  "past-perfect": 88,
  "present-continuous": 80,
  "future-will": 70,
  "past-simple": 60,
  "present-simple": 50,
};