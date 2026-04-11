import type { GrammarMatch, GrammarRule } from "../../shared/grammar";
import { regularVerbs } from "../../shared/verbUtils";

export const FuturePerfectContinuousRule: GrammarRule = {
  id: "future-perfect-continuous",
  name: "Future Perfect Continuous",
  description: "Detects future perfect continuous tense.",

  detect(text: string): GrammarMatch[] {
    const matches: GrammarMatch[] = [];

    const patterns = [
      // Affirmative: subject + will have been + verb-ing
      /\b(I|You|We|They|He|She|It)\s+will\s+have\s+been\s+([a-z]+ing)\b/gi,
      
      // Contraction: subject + 'll have been + verb-ing
      /\b(I|You|We|They|He|She|It)\s+'ll\s+have\s+been\s+([a-z]+ing)\b/gi,
      
      // Negative: subject + won't have been + verb-ing
      /\b(I|You|We|They|He|She|It)\s+(won't|will not)\s+have\s+been\s+([a-z]+ing)\b/gi,
      
      // Question: Will + subject + have been + verb-ing?
      /\bWill\s+(I|you|we|they|he|she|it)\s+have\s+been\s+([a-z]+ing)\b/gi,
      
      // Without explicit subject
      /\band\s+will\s+have\s+been\s+([a-z]+ing)\b/gi,
      /\bthen\s+will\s+have\s+been\s+([a-z]+ing)\b/gi,
    ];

    let idCounter = 0;

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const fullMatch = match[0];
        
        let verb: string;
        if (pattern.source.includes('Will\\s+')) {
         // Question: the verb is in match[4]
          verb = match[4]?.toLowerCase();
        } else if (pattern.source.includes('\\band\\s+') || pattern.source.includes('\\bthen\\s+')) {
          // Without a subject: the verb is in match[2]
          verb = match[2]?.toLowerCase();
        } else {
          // Affirmative/Negative: the verb is in match[2] or match[3]
          verb = (match[2] || match[3])?.toLowerCase();
        }

        if (!verb || !verb.endsWith('ing')) continue;

        if (!isValidIngForm(verb)) continue;

        matches.push({
          id: `futurepc-${idCounter++}`,
          type: "future-perfect-continuous",
          text: fullMatch,
          start: match.index,
          end: match.index + fullMatch.length,
          explanation: getFuturePerfectContinuousExplanation(fullMatch),
        });
      }
    }

    return matches;
  },
};

function isValidIngForm(verb: string): boolean {
  if (!verb.endsWith('ing')) return false;
  
  const baseForm = verb.slice(0, -3);
  
  const commonIngForms = new Set([
    "going", "doing", "having", "being", "seeing", "coming",
    "getting", "making", "taking", "eating", "drinking", "working",
    "studying", "learning", "playing", "running", "swimming",
    "walking", "talking", "saying", "telling", "asking", "answering",
    "waiting", "living", "working", "studying", "teaching", "learning"
  ]);
  
  if (commonIngForms.has(verb)) return true;
  
  return regularVerbs.has(baseForm);
}

function getFuturePerfectContinuousExplanation(fullMatch: string): string {
  if (fullMatch.includes("won't") || fullMatch.includes("will not")) {
    return "Future Perfect Continuous Negative: won't have been + verb-ing. Expresses an action that will not have been happening for a duration by a future time.";
  } else if (fullMatch.trim().startsWith("Will")) {
    return "Future Perfect Continuous Question: Will + subject + have been + verb-ing. Asks about the duration of an action up to a future point.";
  } else {
    return "Future Perfect Continuous: will have been + verb-ing. Used to emphasize the duration of an action before a future moment.";
  }
}