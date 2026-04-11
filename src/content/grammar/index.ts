import type { GrammarMatch, GrammarRule } from "../../shared/grammar";
import { PresentSimpleRule } from "./presentSimple";
import { PastSimpleRule } from "./pastSimple";
import { PresentContinuousRule } from "./presentContinuous";
import { FutureWillRule } from "./futureWill";
import { FuturePerfectContinuousRule } from "./futurePerfectContinuous";
import { PresentPerfectContinuousRule } from "./presentPerfectContinuous";
import { PastPerfectContinuousRule } from "./pastPerfectContinuous";
import { FuturePerfectRule } from "./futurePerfect";
import { PresentPerfectRule } from "./presentPerfect";
import { PastPerfectRule } from "./pastPerfect";

const rules: GrammarRule[] = [
  FuturePerfectContinuousRule,
  PresentPerfectContinuousRule,
  PastPerfectContinuousRule,

  FuturePerfectRule,
  PresentPerfectRule,
  PastPerfectRule,

  PresentContinuousRule,
  FutureWillRule,
  PastSimpleRule,
  PresentSimpleRule,
];

export function analyzeText(
  text: string,
  activeRules: string[]
): GrammarMatch[] {
  return rules
    .filter((rule) => activeRules.includes(rule.id))
    .flatMap((rule) => rule.detect(text));
}

