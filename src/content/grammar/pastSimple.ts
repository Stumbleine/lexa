import type { GrammarMatch, GrammarRule } from "../../shared/grammar";
import { pastSimpleFalsePositives, irregularPast, regularVerbs } from "../../shared/verbUtils";

export const PastSimpleRule: GrammarRule = {
  id: "past-simple",
  name: "Past Simple",
  description: "Detects simple past tense sentences.",

  detect(text: string): GrammarMatch[] {
    const matches: GrammarMatch[] = [];
    const perfectTensesRanges = findPerfectTensesRanges(text);

    const patterns = [
      // Affirmative with subject + verb in past tense
      /\b(I|You|We|They|He|She|It)\s+([a-z]+(?:ed|ew|ought|aught|elt|ept|ound|ost|id|ame|oke|ote|ang|ank|ung|uck|ash|ide|ove|ay|ell|rew|new|ote|ang|ank|ung))\b/gi,
      
      // Negative with didn't
      /\b(I|You|We|They|He|She|It)\s+(didn't|did not)\s+([a-z]+)\b/gi,
      
      // Ask with Did
      /\bDid\s+(I|you|we|they|he|she|it)\s+([a-z]+)\b/gi,
    ];

    let idCounter = 0;

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (isInRanges(match.index, match.index + match[0].length, perfectTensesRanges)) {
          continue;
        }

        const fullMatch = match[0];
        let verb: string;
        
        if (pattern.source.includes("didn't") || pattern.source.includes("Did")) {
          // For negatives and questions, the verb is in a form base
          verb = match[3]?.toLowerCase() || match[2]?.toLowerCase();
          if (!regularVerbs.has(verb)) continue;
        } else {
          // For affirmative sentences, the verb is in the past tense.
          verb = match[2]?.toLowerCase();
          if (!isValidPastVerb(verb)) continue;
        }

        matches.push({
          id: `past-${idCounter++}`,
          type: "past-simple",
          text: fullMatch,
          start: match.index,
          end: match.index + fullMatch.length,
          explanation: getExplanation(verb),
        });
      }
    }

    return matches;
  },
};

function isValidPastVerb(verb: string): boolean {
  // 1. If it is a known irregular
  if (irregularPast.has(verb)) return true;
  
  // 2. If it ends in "ed", validate that it is a regular verb
  if (verb.endsWith("ed")) {
    if (pastSimpleFalsePositives.has(verb)) return false;
    
    const baseForm = getBaseForm(verb);

    return regularVerbs.has(baseForm) || hasRegularVerbPattern(verb);
  }
  
  return false;
}

function getBaseForm(pastVerb: string): string {
  if (pastVerb.endsWith("ied")) {
    return pastVerb.slice(0, -3) + "y";
  }
  if (pastVerb.match(/([bcdfghjklmnpqrstvwxz])\1ed$/)) {
    return pastVerb.slice(0, -3);
  }
  if (pastVerb.endsWith("ed") && !pastVerb.endsWith("eed")) {
    return pastVerb.slice(0, -2);
  }
  return pastVerb;
}

function hasRegularVerbPattern(verb: string): boolean {
  
  // -ed ending after a consonant (walked)
  if (verb.match(/[bcdfghjklmnpqrstvwxz]ed$/i)) return true;
  
  // Ending -ied (studied)
  if (verb.match(/[aeiou]?[bcdfghjklmnpqrstvwxz]ied$/i)) return true;
  
  // Double consonant + ed (stopped)
  if (verb.match(/([bcdfghjklmnpqrstvwxz])\1ed$/i)) return true;
  
  // Verbs that already end in e (liked)
  if (verb.match(/[aeiou]?[bcdfghjklmnpqrstvwxz]d$/i) && 
      !verb.endsWith("ed") && 
      verb.length > 2) {
    const baseForm = verb.slice(0, -1);
    if (baseForm.endsWith("e")) return true;
  }
  
  return false;
}

function findPerfectTensesRanges(text: string): {start: number, end: number}[] {
  const ranges: {start: number, end: number}[] = [];
  
  const perfectPatterns = [
    // Past Perfect: had + past participle
    /\bhad\s+([a-z]+(?:ed|en|ew|ought|aught|elt|ept|ound|ost))\b/gi,
    
    // Present Perfect: have/has + past participle
    /\b(have|has)\s+([a-z]+(?:ed|en|ew|ought|aught|elt|ept|ound|ost))\b/gi,
    
    // Future Perfect: will have + past participle
    /\bwill\s+have\s+([a-z]+(?:ed|en|ew|ought|aught|elt|ept|ound|ost))\b/gi,
    
    // Perfect Continuous: have/has/had been + -ing
    /\b(?:have|has|had)\s+been\s+([a-z]+ing)\b/gi
  ];

  for (const pattern of perfectPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      ranges.push({
        start: match.index,
        end: match.index + match[0].length
      });
    }
  }

  return ranges;
}

function isInRanges(start: number, end: number, ranges: {start: number, end: number}[]): boolean {
  return ranges.some(range => 
    (start >= range.start && start < range.end) ||
    (end > range.start && end <= range.end) ||
    (start <= range.start && end >= range.end)
  );
}


function getExplanation(verb: string): string {
  if (irregularPast.has(verb)) {
    return `Past Simple (irregular): "${verb}" is the past form of an irregular verb.`;
  } else {
    return `Past Simple (regular): "${verb}" is formed by adding -ed to the base form.`;
  }
}