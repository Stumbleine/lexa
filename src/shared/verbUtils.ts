export const irregularParticiples = new Set([
  "been", "gone", "done", "seen", "eaten", "written", "taken", 
  "made", "known", "given", "spoken", "broken", "chosen", "forgotten",
  "driven", "flown", "frozen", "stolen", "woken", "worn", "thrown",
  "drawn", "shown", "grown", "blown", "known"
]);


export const irregularPast = new Set([
  "went", "saw", "did", "took", "made", "knew", "gave", "spoke", 
  "broke", "chose", "wrote", "ate", "ran", "came", "got", "felt",
  "found", "thought", "bought", "brought", "taught", "caught",
  "left", "lost", "met", "read", "said", "sold", "sent", "slept",
  "spent", "stood", "told", "understood", "won", "became", "began",
  "bit", "blew", "drank", "drove", "fell", "flew", "forgot", "froze",
  "gave", "grew", "hid", "knew", "lay", "led", "rang", "rose", "sang",
  "sank", "sat", "shook", "shone", "shot", "shut", "sang", "sank",
  "sat", "slept", "spoke", "stole", "struck", "swam", "took", "threw",
  "woke", "wore", "won", "wrote"
]);

export const regularVerbs = new Set([
  "need", "want", "ask", "help", "work", "play", "call", "talk", 
  "walk", "jump", "like", "love", "watch", "clean", "study", "try",
  "stop", "plan", "prefer", "occur", "admit", "refer", "control",
  "travel", "cancel", "label", "signal", "dial", "debug", "email",
  "eat", "drink", "run", "swim", "write", "read", "speak", "take",
  "give", "make", "do", "see", "know", "think", "feel", "find"
]);

export const pastSimpleFalsePositives = new Set([
  "red", "bed", "fed" , "led" , 
  "hundred", "thousand", "naked", "wicked", "crooked", "ragged", 
  "beloved", "sacred", "learned" , "aged" ,
  "blessed" , "cursed" , "dogged", "rugged",
  "wretched", "jagged", "crabbed", "supposed", "need"
]);


export function isPastParticiple(word: string): boolean {
  const lower = word.toLowerCase();
  
  if (lower.endsWith("ed")) {
    const baseForm = getBaseForm(lower);
    return regularVerbs.has(baseForm);
  }
  
  return irregularParticiples.has(lower);
}

export function isValidBaseVerb(word: string): boolean {
  return regularVerbs.has(word);
}

function getBaseForm(pastVerb: string): string {
  if (pastVerb.endsWith("ied")) {
    return pastVerb.slice(0, -3) + "y";
  }
  if (pastVerb.match(/([bcdfghjklmnpqrstvwxz])\1ed$/)) {
    return pastVerb.slice(0, -3);
  }
  if (pastVerb.endsWith("ed")) {
    return pastVerb.slice(0, -2);
  }
  return pastVerb;
}