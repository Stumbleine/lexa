import type { GrammarMatch, GrammarRule } from "../../shared/grammar";
import { regularVerbs } from "../../shared/verbUtils";

export const PastPerfectContinuousRule: GrammarRule = {
  id: "past-perfect-continuous",
  name: "Past Perfect Continuous",
  description: "Detects past perfect continuous tense.",

  detect(text: string): GrammarMatch[] {
    const matches: GrammarMatch[] = [];

    const patterns = [
      // Affirmative: subject + had + been + verb-ing
      /\b(I|You|We|They|He|She|It)\s+had\s+been\s+([a-z]+ing)\b/gi,
      
      // Contraction: subject + 'd + been + verb-ing
      /\b(I|You|We|They|He|She|It)\s+'d\s+been\s+([a-z]+ing)\b/gi,
      
      // Negative: subject + hadn't + been + verb-ing
      /\b(I|You|We|They|He|She|It)\s+(hadn't|had not)\s+been\s+([a-z]+ing)\b/gi,
      
      // Question: Had + subject + been + verb-ing?
      /\bHad\s+(I|you|we|they|he|she|it)\s+been\s+([a-z]+ing)\b/gi,
      
      // Without explicit subject
      /\band\s+had\s+been\s+([a-z]+ing)\b/gi,
      /\bthen\s+had\s+been\s+([a-z]+ing)\b/gi,
    ];

    let idCounter = 0;

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const fullMatch = match[0];
        
        let verb: string;
        if (pattern.source.includes('Had\\s+')) {
          // Question: the verb is in match[3]
          verb = match[3]?.toLowerCase();
        } else if (pattern.source.includes('\\band\\s+') || pattern.source.includes('\\bthen\\s+')) {
          // Without a subject: the verb is in match[2]
          verb = match[2]?.toLowerCase();
        } else {
          // Affirmative/Negative: the verb is in match[2] or match[3]
          verb = (match[2] || match[3])?.toLowerCase();
        }

        if (!verb || !verb.endsWith('ing')) continue;

        if (!isValidIngForm(verb)) continue;

        // Verify that it is not part of the future perfect continuous
        const beforeText = text.slice(Math.max(0, match.index - 20), match.index);
        if (/\bwill\s+have\s+been\s+\w+ing$/.test(beforeText)) continue;

        matches.push({
          id: `pastpc-${idCounter++}`,
          type: "past-perfect-continuous",
          text: fullMatch,
          start: match.index,
          end: match.index + fullMatch.length,
          explanation: getPastPerfectContinuousExplanation(fullMatch),
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
    "walking", "talking", "saying", "telling", "asking", "answering"
  ]);
  
  if (commonIngForms.has(verb)) return true;
  
  return regularVerbs.has(baseForm);
}

function getPastPerfectContinuousExplanation(fullMatch: string): string {
  if (fullMatch.includes("hadn't") || fullMatch.includes("had not")) {
    return "Past Perfect Continuous Negative: hadn't been + verb-ing. Expresses an action that hadn't been happening continuously before another past action.";
  } else if (fullMatch.trim().startsWith("Had")) {
    return "Past Perfect Continuous Question: Had + subject + been + verb-ing. Asks about the duration of an action before another past action.";
  } else {
    return "Past Perfect Continuous: had been + verb-ing. Expresses an ongoing action that continued up to another past event.";
  }
}