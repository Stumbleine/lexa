import type { GrammarMatch, GrammarRule } from "../../shared/grammar";
import { regularVerbs } from "../../shared/verbUtils";
export const PresentSimpleRule: GrammarRule = {
  id: "present-simple",
  name: "Present Simple",
  description: "Detects simple present tense affirmative sentences.",

  detect(text: string): GrammarMatch[] {
    const matches: GrammarMatch[] = [];

    const patterns = [
      // I/You/We/They + base verb
      /\b(I|You|We|They)\s+([a-z]+)\b/gi,
      
      // He/She/It + verb with s/es/ies
      /\b(He|She|It)\s+([a-z]+(?:s|es|ies))\b/gi,
      
      // Proper nouns + verb with s (third person)
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+([a-z]+(?:s|es|ies))\b/g
    ];

    let idCounter = 0;

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const fullMatch = match[0];
        const subject = match[1];
        const verb = match[2].toLowerCase();
        
        if (!isValidPresentVerb(verb, subject)) continue;
        
        // Verify that it is not part of another time
        if (isPartOfOtherTense(text, match.index)) continue;

        matches.push({
          id: `ps-${idCounter++}`,
          type: "present-simple",
          text: fullMatch,
          start: match.index,
          end: match.index + fullMatch.length,
          explanation: getPresentExplanation(verb, subject),
        });
      }
    }

    return matches;
  },
};

function isValidPresentVerb(verb: string, subject: string): boolean {
  const isThirdPerson = /^(He|She|It)$/i.test(subject) || subject[0] === subject[0].toUpperCase();
  
  if (isThirdPerson) {
    if (!verb.endsWith('s')) return false;
    
    // Obtain base form by removing the s
    const baseForm = getBaseFormFromThirdPerson(verb);
    return regularVerbs.has(baseForm) || isCommonVerb(baseForm);
  } 
  else {
    return regularVerbs.has(verb) || isCommonVerb(verb);
  }
}

function getBaseFormFromThirdPerson(thirdPersonVerb: string): string {
  // "watches" -> "watch"
  if (thirdPersonVerb.endsWith('es')) {
    return thirdPersonVerb.slice(0, -2);
  }
  // "studies" -> "study"
  if (thirdPersonVerb.endsWith('ies')) {
    return thirdPersonVerb.slice(0, -3) + 'y';
  }
  // "needs" -> "need"
  return thirdPersonVerb.slice(0, -1);
}

function isCommonVerb(verb: string): boolean {
  const commonVerbs = new Set([
    "be", "have", "do", "go", "get", "make", "take", "come", "see",
    "know", "think", "want", "need", "like", "love", "hate", "eat",
    "drink", "run", "walk", "talk", "say", "tell", "ask", "answer"
  ]);
  
  return commonVerbs.has(verb);
}

function isPartOfOtherTense(text: string, position: number): boolean {
  const beforeText = text.slice(Math.max(0, position - 20), position);
  
  // Perfect times (will be captured by other rules)
  if (/\b(have|has|had)\s+\w+/.test(beforeText)) return true;
  
  // Future will
  if (/\bwill\s+\w+/.test(beforeText)) return true;
  
  // Past tense with did (negatives/questions)
  if (/\bdid(n't)?\s+\w+/.test(beforeText)) return true;
  
  return false;
}

function getPresentExplanation(verb: string, subject: string): string {
  const isThirdPerson = /^(He|She|It)$/i.test(subject);
  
  if (isThirdPerson) {
    return `Present Simple (third person): "${verb}" is the third person singular form (adds -s/-es).`;
  } else {
    return `Present Simple: "${verb}" is the base form of the verb.`;
  }
}
