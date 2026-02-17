import type { GrammarMatch, GrammarRule } from "../../shared/grammar";
import { PresentSimpleRule } from "./presentSimple";
import { PastSimpleRule } from "./pastSimple";
import { PresentContinuousRule } from "./presentContinuous";
import { FutureWillRule } from "./futureWill";

const rules: GrammarRule[] = [
  PresentSimpleRule,
  PastSimpleRule,
  PresentContinuousRule,
  FutureWillRule,
];

export function analyzeText(
  text: string,
  activeRules: string[]
): GrammarMatch[] {
  return rules
    .filter((rule) => activeRules.includes(rule.id))
    .flatMap((rule) => rule.detect(text));
}

