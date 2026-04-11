import type { GrammarMatch, GrammarRule } from "../../shared/grammar";
import { isPastParticiple, regularVerbs, irregularParticiples } from "../../shared/verbUtils";

export const FuturePerfectRule: GrammarRule = {
  id: "future-perfect",
  name: "Future Perfect",
  description: "Detects future perfect tense (will have + past participle).",

  detect(text: string): GrammarMatch[] {
    const matches: GrammarMatch[] = [];

    const patterns = [
      // Affirmative: subject + will have + past participle
      /\b(I|You|We|They|He|She|It)\s+will\s+have\s+([a-z]+)\b/gi,
      
      // Contraction: subject + 'll have + past participle
      /\b(I|You|We|They|He|She|It)\s+'ll\s+have\s+([a-z]+)\b/gi,
      
      // Negative: subject + won't have + past participle
      /\b(I|You|We|They|He|She|It)\s+(won't|will not)\s+have\s+([a-z]+)\b/gi,
      
      // Question: Will + subject + have + past participle?
      /\bWill\s+(I|you|we|they|he|she|it)\s+have\s+([a-z]+)\b/gi,
      
      // Without explicit subject
      /\band\s+will\s+have\s+([a-z]+)\b/gi,
      /\bthen\s+will\s+have\s+([a-z]+)\b/gi,
    ];

    let idCounter = 0;

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const fullMatch = match[0];
        
        // Extract the verb (past participle)
        let verb: string;
        if (pattern.source.includes('Will\\s+')) {
          verb = match[3]?.toLowerCase();
        } else if (pattern.source.includes('\\band\\s+') || pattern.source.includes('\\bthen\\s+')) {
          // Without a subject: the verb is in match[2]
          verb = match[2]?.toLowerCase();
        } else {
          // Affirmative/Negative: the verb is in match[2] or match[3]
          verb = (match[2] || match[3])?.toLowerCase();
        }

        if (!verb) continue;

        if (!isPastParticiple(verb)) continue;

        // Verify that it is not part of the future perfect continuous
        const beforeText = text.slice(Math.max(0, match.index - 15), match.index);
        if (/\bwill\s+have\s+been\s+\w+ing$/.test(beforeText)) continue;

        // Verify that it is not a regular verb in form
        if (regularVerbs.has(verb) && !verb.endsWith("ed") && !irregularParticiples.has(verb)) {
          continue;
        }

        matches.push({
          id: `fp-${idCounter++}`,
          type: "future-perfect",
          text: fullMatch,
          start: match.index,
          end: match.index + fullMatch.length,
          explanation: getFuturePerfectExplanation(fullMatch),
        });
      }
    }

    return matches;
  },
};

function getFuturePerfectExplanation(fullMatch: string): string {
  if (fullMatch.includes("won't") || fullMatch.includes("will not")) {
    return "Future Perfect Negative: won't have + past participle. Expresses an action that will not be completed by a future time.";
  } else if (fullMatch.trim().startsWith("Will")) {
    return "Future Perfect Question: Will + subject + have + past participle. Asks about actions that will be completed before a future moment.";
  } else {
    return "Future Perfect: will have + past participle. Used for actions that will be completed before a specific future moment.";
  }
}