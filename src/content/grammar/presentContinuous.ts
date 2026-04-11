import type { GrammarMatch, GrammarRule } from "../../shared/grammar";
import { regularVerbs } from "../../shared/verbUtils";

export const PresentContinuousRule: GrammarRule = {
  id: "present-continuous",
  name: "Present Continuous",
  description: "Detects present continuous tense.",

  detect(text: string): GrammarMatch[] {
    const matches: GrammarMatch[] = [];

    const patterns = [
      // Complete forms
      /\b(I am|You are|We are|They are|He is|She is|It is)\s+([a-z]+ing)\b/gi,
      
      // Contracted forms
      /\b(I'm|You're|We're|They're|He's|She's|It's)\s+([a-z]+ing)\b/gi,
      
      // Negative
      /\b(I am not|You are not|We are not|They are not|He is not|She is not|It is not)\s+([a-z]+ing)\b/gi,
      /\b(I'm not|You aren't|We aren't|They aren't|He isn't|She isn't|It isn't)\s+([a-z]+ing)\b/gi,
      
      // Questions
      /\bAm I|Are you|Are we|Are they|Is he|Is she|Is it\s+([a-z]+ing)\b/gi
    ];

    let idCounter = 0;

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const fullMatch = match[0];
        const verb = match[2]?.toLowerCase() || match[1]?.toLowerCase();
        
        if (!verb || !verb.endsWith('ing')) continue;

        if (!isValidIngForm(verb)) continue;

        // Verify that it is not part of another tense (e.g., "have been going")
        if (isPartOfPerfectContinuous(text, match.index)) continue;

        matches.push({
          id: `pc-${idCounter++}`,
          type: "present-continuous",
          text: fullMatch,
          start: match.index,
          end: match.index + fullMatch.length,
          explanation: getPresentContinuousExplanation(fullMatch),
        });
      }
    }

    return matches;
  },
};

function isValidIngForm(verb: string): boolean {
  if (!verb.endsWith('ing')) return false;
  
  const baseForm = verb.slice(0, -3);

  if (baseForm.endsWith('e') && !baseForm.endsWith('ee')) {
    const withoutE = baseForm.slice(0, -1);
    if (regularVerbs.has(withoutE) ) return true;
  }
  
  if (baseForm.match(/([bcdfghjklmnpqrstvwxz])\1$/)) {
    const withoutLast = baseForm.slice(0, -1);
    if (regularVerbs.has(withoutLast) ) return true;
  }
  
  if (regularVerbs.has(baseForm) ) return true;
  
  const commonIngForms = new Set([
    "going", "doing", "having", "being", "seeing", "coming",
    "getting", "making", "taking", "eating", "drinking"
  ]);
  
  return commonIngForms.has(verb);
}

function isPartOfPerfectContinuous(text: string, position: number): boolean {
  const beforeText = text.slice(Math.max(0, position - 20), position);
  
  if (/\b(have|has|had)\s+been\s+\w+ing$/.test(beforeText)) {
    return true;
  }
  
  return false;
}

function getPresentContinuousExplanation(fullMatch: string): string {
  if (fullMatch.includes("not") || fullMatch.includes("n't")) {
    return `Present Continuous Negative: "${fullMatch}" expresses an action not happening now.`;
  } else if (/^(Am|Are|Is)/i.test(fullMatch)) {
    return `Present Continuous Question: "${fullMatch}" asks about an action happening now.`;
  } else {
    return `Present Continuous: "${fullMatch}" expresses an action happening now or around now.`;
  }
}