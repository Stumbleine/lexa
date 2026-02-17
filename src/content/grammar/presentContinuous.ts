import type { GrammarMatch, GrammarRule } from "../../shared/grammar";

export const PresentContinuousRule: GrammarRule = {
  id: "present-continuous",
  name: "Present Continuous",
  description: "Detects present continuous tense.",

  detect(text: string): GrammarMatch[] {
    const matches: GrammarMatch[] = [];

    const regex =
      /\b(I am|You are|We are|They are|He is|She is|It is)\s+([a-z]+ing)\b/g;

    let match;
    let idCounter = 0;

    while ((match = regex.exec(text)) !== null) {
      matches.push({
        id: `pc-${idCounter++}`,
        type: "present-continuous",
        text: match[0],
        start: match.index,
        end: match.index + match[0].length,
        explanation:
          "Present Continuous: Subject + am/is/are + verb-ing.",
      });
    }

    return matches;
  },
};
