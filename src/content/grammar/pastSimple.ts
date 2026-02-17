import type { GrammarMatch, GrammarRule } from "../../shared/grammar";

export const PastSimpleRule: GrammarRule = {
  id: "past-simple",
  name: "Past Simple",
  description: "Detects simple past tense sentences.",

  detect(text: string): GrammarMatch[] {
    const matches: GrammarMatch[] = [];

    const regex = /\b(I|You|We|They|He|She|It)\s+([a-z]+ed)\b/g;

    let match;
    let idCounter = 0;

    while ((match = regex.exec(text)) !== null) {
      matches.push({
        id: `past-${idCounter++}`,
        type: "past-simple",
        text: match[0],
        start: match.index,
        end: match.index + match[0].length,
        explanation:
          "Past Simple: Subject + verb in past form (usually -ed).",
      });
    }

    return matches;
  },
};
