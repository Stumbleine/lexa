import type { GrammarMatch, GrammarRule } from "../../shared/grammar";

// const SUBJECTS = ["I", "You", "We", "They", "He", "She", "It"];

export const PresentSimpleRule: GrammarRule = {
  id: "present-simple",
  name: "Present Simple",
  description: "Detects simple present tense affirmative sentences.",

  detect(text: string): GrammarMatch[] {
    const matches: GrammarMatch[] = [];

    const regex =
      /\b(I|You|We|They)\s+([a-z]+)\b|\b(He|She|It)\s+([a-z]+s)\b/g;

    let match;
    let idCounter = 0;

    while ((match = regex.exec(text)) !== null) {
      matches.push({
        id: `ps-${idCounter++}`,
        type: "present-simple",
        text: match[0],
        start: match.index,
        end: match.index + match[0].length,
        explanation:
          "Present Simple: Subject + base verb (or verb + s for third person).",
      });
    }

    return matches;
  },
};
