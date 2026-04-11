import type { GrammarMatch, GrammarRule } from "../../shared/grammar";
import { irregularPast, pastSimpleFalsePositives, regularVerbs } from "../../shared/verbUtils";

export const FutureWillRule: GrammarRule = {
  id: "future-will",
  name: "Future (Will)",
  description: "Detects future tense with 'will'.",

  detect(text: string): GrammarMatch[] {
    const matches: GrammarMatch[] = [];

    const patterns = [
      // Affirmative with will or 'll
      /\b(I|You|We|They|He|She|It)\s+(will|'ll)\s+([a-z]+)\b/gi,
      
      // Negative with won't or will not
      /\b(I|You|We|They|He|She|It)\s+(won't|will not)\s+([a-z]+)\b/gi,
      
      // Ask Will
      /\bWill\s+(I|you|we|they|he|she|it)\s+([a-z]+)\b/gi,
      
      // Will at the beginning of the question (Without explicit subject in the match)
      /\bWill\s+there\s+be\s+([a-z]+)\b/gi,
      /\bWill\s+it\s+be\s+([a-z]+)\b/gi
    ];

    let idCounter = 0;

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const fullMatch = match[0];
        let verb: string;
        
        if (pattern.source.includes('Will\\s+there') || pattern.source.includes('Will\\s+it')) {
          verb = match[1]?.toLowerCase();
        } else if (pattern.source.includes('^Will\\b')) {
          // Question: Will + subject + verb
          verb = match[2]?.toLowerCase();
        } else {
          // Affirmative/Negative: subject + will + verb
          verb = match[3]?.toLowerCase() || match[2]?.toLowerCase();
        }

        if (!verb) continue;

        if (!isBaseFormVerb(verb)) {
          // It could be "will be going" (future continuous) - leave for another rule
          if (verb.endsWith('ing')) continue;
          if (isPastForm(verb)) continue;
        }

        matches.push({
          id: `fw-${idCounter++}`,
          type: "future-will",
          text: fullMatch,
          start: match.index,
          end: match.index + fullMatch.length,
          explanation: getFutureExplanation(fullMatch),
        });
      }
    }

    return matches;
  },
};

function isBaseFormVerb(verb: string): boolean {
  return regularVerbs.has(verb);
}

function isPastForm(verb: string): boolean {
  return irregularPast.has(verb) || 
         (verb.endsWith('ed') && !pastSimpleFalsePositives.has(verb));
}

function getFutureExplanation(fullMatch: string): string {
  if (fullMatch.includes("won't") || fullMatch.includes("will not")) {
    return `Future Negative: "${fullMatch}" expresses a future action that will not happen.`;
  } else if (fullMatch.startsWith("Will")) {
    return `Future Question: "${fullMatch}" asks about a future action.`;
  } else {
    return `Future Affirmative: "${fullMatch}" expresses a future action or prediction.`;
  }
}