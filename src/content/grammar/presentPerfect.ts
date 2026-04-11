import type { GrammarMatch, GrammarRule } from "../../shared/grammar";
import { irregularParticiples, isPastParticiple, regularVerbs } from "../../shared/verbUtils";

export const PresentPerfectRule: GrammarRule = {
  id: "present-perfect",
  name: "Present Perfect",
  description: "Detects present perfect tense (have/has + past participle).",

  detect(text: string): GrammarMatch[] {
    const matches: GrammarMatch[] = [];

    const patterns = [
      // I/You/We/They + have/'ve + past participle
      /\b(I|You|We|They)\s+(have|'ve)\s+([a-z]+)\b/gi,
      
      // He/She/It + has/'s + past participle
      /\b(He|She|It)\s+(has|'s)\s+([a-z]+)\b/gi,
      
      // Negatives
      /\b(I|You|We|They|He|She|It)\s+(haven't|hasn't)\s+([a-z]+)\b/gi,
      
      // Questions
      /\b(Have|Has)\s+(I|you|we|they|he|she|it)\s+([a-z]+)\b/gi,
    ];

    let idCounter = 0;

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const fullMatch = match[0];
        
        let verb = (match[3] || match[5] || match[2])?.toLowerCase();
        if (!verb) continue;

        if (!isPastParticiple(verb)) continue;

        // Verify that it is not part of a perfect continuous
        const beforeText = text.slice(Math.max(0, match.index - 20), match.index);
        if (/\bbeen\s+\w+ing$/.test(beforeText)) continue;

        // IMPORTANT: Verify that it is not a regular verb in its base form.
        // Example: "have need" - "need" is in the regular verbs category but is NOT a past participle.
        if (regularVerbs.has(verb) && !verb.endsWith("ed") && !irregularParticiples.has(verb)) {
          continue;
        }

        matches.push({
          id: `pp-${idCounter++}`,
          type: "present-perfect",
          text: fullMatch,
          start: match.index,
          end: match.index + fullMatch.length,
          explanation: getPresentPerfectExplanation(fullMatch),
        });
      }
    }

    return matches;
  },
};

function getPresentPerfectExplanation(fullMatch: string): string {
  if (fullMatch.includes("not") || fullMatch.includes("n't")) {
    return "Present Perfect Negative: have/has + not + past participle. Expresses an action that hasn't happened.";
  } else if (/^(Have|Has)/i.test(fullMatch)) {
    return "Present Perfect Question: Have/Has + subject + past participle. Asks about past actions connected to present.";
  } else {
    return "Present Perfect: have/has + past participle. Used for past actions with present relevance.";
  }
}