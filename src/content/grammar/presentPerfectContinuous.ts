import type { GrammarMatch, GrammarRule } from "../../shared/grammar";
import { regularVerbs } from "../../shared/verbUtils";

export const PresentPerfectContinuousRule: GrammarRule = {
  id: "present-perfect-continuous",
  name: "Present Perfect Continuous",
  description: "Detects present perfect continuous tense.",

  detect(text: string): GrammarMatch[] {
    const matches: GrammarMatch[] = [];

    const patterns = [
      // I/You/We/They + have + been + verb-ing
      /\b(I|You|We|They)\s+have\s+been\s+([a-z]+ing)\b/gi,
      
      // He/She/It + has + been + verb-ing
      /\b(He|She|It)\s+has\s+been\s+([a-z]+ing)\b/gi,
      
      // Contractions: 've/'s + been + verb-ing
      /\b(I|You|We|They)\s+'ve\s+been\s+([a-z]+ing)\b/gi,
      /\b(He|She|It)\s+'s\s+been\s+([a-z]+ing)\b/gi,
      
      // Negatives
      /\b(I|You|We|They|He|She|It)\s+(haven't|hasn't)\s+been\s+([a-z]+ing)\b/gi,
      /\b(I|You|We|They|He|She|It)\s+(have|has)\s+not\s+been\s+([a-z]+ing)\b/gi,
      
      // Questions
      /\b(Have|Has)\s+(I|you|we|they|he|she|it)\s+been\s+([a-z]+ing)\b/gi,
    ];

    let idCounter = 0;

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const fullMatch = match[0];
        
        const verb = (match[2] || match[3])?.toLowerCase();
        
        if (!verb || !verb.endsWith('ing')) continue;

        if (!isValidIngForm(verb)) continue;

        matches.push({
          id: `ppc-${idCounter++}`,
          type: "present-perfect-continuous",
          text: fullMatch,
          start: match.index,
          end: match.index + fullMatch.length,
          explanation: getPerfectContinuousExplanation(fullMatch, "present"),
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
    "studying", "learning", "playing", "running", "swimming"
  ]);
  
  if (commonIngForms.has(verb)) return true;
  
  return regularVerbs.has(baseForm)
}

function getPerfectContinuousExplanation(fullMatch: string, tense: string): string {
  const tenseName = tense === "present" ? "Present" : 
                    tense === "past" ? "Past" : "Future";
  
  if (fullMatch.includes("not") || fullMatch.includes("n't")) {
    return `${tenseName} Perfect Continuous Negative: Expresses an action that hasn't been happening continuously.`;
  } else if (/^(Have|Has|Had|Will)/i.test(fullMatch)) {
    return `${tenseName} Perfect Continuous Question: Asks about the duration of an ongoing action.`;
  } else {
    return `${tenseName} Perfect Continuous: have/has + been + verb-ing. Action started in the past and continues to ${tense === "present" ? "present" : tense === "past" ? "another past point" : "future"}.`;
  }
}