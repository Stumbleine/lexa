import type { GrammarMatch, GrammarRule } from "../../shared/grammar";
import { isPastParticiple, regularVerbs, irregularParticiples } from "../../shared/verbUtils";

export const PastPerfectRule: GrammarRule = {
  id: "past-perfect",
  name: "Past Perfect",
  description: "Detects past perfect tense (had + past participle).",

  detect(text: string): GrammarMatch[] {
    const matches: GrammarMatch[] = [];

    const patterns = [
      // Affirmative: subject + had/'d + past participle
      /\b(I|You|We|They|He|She|It)\s+(had|'d)\s+([a-z]+)\b/gi,
      
      // Negative: subject + hadn't + past participle
      /\b(I|You|We|They|He|She|It)\s+(hadn't|had not)\s+([a-z]+)\b/gi,
      
      //Question: Had + subject + past participle?
      /\bHad\s+(I|you|we|they|he|she|it)\s+([a-z]+)\b/gi,
      
      // Without explicit subject (sentence continuation)
      /\band\s+(had|'d)\s+([a-z]+)\b/gi,
      /\bthen\s+(had|'d)\s+([a-z]+)\b/gi,
    ];

    let idCounter = 0;

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const fullMatch = match[0];
        
        let verb: string;
        if (pattern.source.includes('Had\\s+')) {
          // Question: the verb is in match[2]
          verb = match[2]?.toLowerCase();
        } else if (pattern.source.includes('\\band\\s+') || pattern.source.includes('\\bthen\\s+')) {
          // Without a subject: the verb is in match[3]
          verb = match[3]?.toLowerCase();
        } else {
          // Affirmative/Negative: the verb is in match[3]
          verb = match[3]?.toLowerCase();
        }

        if (!verb) continue;

        if (!isPastParticiple(verb)) continue;

        // Verify that it is not part of the past perfect continuous
        const beforeText = text.slice(Math.max(0, match.index - 15), match.index);
        if (/\bhad\s+been\s+\w+ing$/.test(beforeText)) continue;

        if (regularVerbs.has(verb) && !verb.endsWith("ed") && !irregularParticiples.has(verb)) {
          continue;
        }

        matches.push({
          id: `pastp-${idCounter++}`,
          type: "past-perfect",
          text: fullMatch,
          start: match.index,
          end: match.index + fullMatch.length,
          explanation: getPastPerfectExplanation(fullMatch),
        });
      }
    }

    return matches;
  },
};

function getPastPerfectExplanation(fullMatch: string): string {
  if (fullMatch.includes("hadn't") || fullMatch.includes("had not")) {
    return "Past Perfect Negative: hadn't + past participle. Expresses an action that hadn't happened before another past action.";
  } else if (fullMatch.trim().startsWith("Had")) {
    return "Past Perfect Question: Had + subject + past participle. Asks about actions completed before another past action.";
  } else {
    return "Past Perfect: had + past participle. Used for an action completed before another past action.";
  }
}
