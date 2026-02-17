import type { GrammarMatch, GrammarRule } from "../../shared/grammar";

export const FutureWillRule: GrammarRule = {
  id: "future-will",
  name: "Future (Will)",
  description: "Detects future tense with 'will'.",

  detect(text: string): GrammarMatch[] {
    const matches: GrammarMatch[] = [];

    const regex =
      /\b(I|You|We|They|He|She|It)\s+will\s+([a-z]+)\b/g;

    let match;
    let idCounter = 0;

    while ((match = regex.exec(text)) !== null) {
      matches.push({
        id: `fw-${idCounter++}`,
        type: "future-will",
        text: match[0],
        start: match.index,
        end: match.index + match[0].length,
        explanation:
          "Future: Subject + will + base verb.",
      });
    }

    return matches;
  },
};
