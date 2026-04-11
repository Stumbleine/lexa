import { RULE_PRIORITIES, type GrammarMatch } from "../../shared/grammar";
import type { ExtensionState } from "../../shared/types";
import { analyzeText } from "../grammar";

const HIGHLIGHT_CLASS = "lexa-highlight";
let tooltipEl: HTMLDivElement | null = null;

export function highlightDocument(state: ExtensionState) {
  const stats: Record<string, number> = {};
  let total = 0;
  //console.log("[Highlighter] Starting document walk");

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node: Node): number {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;

        if (parent.closest(`.${HIGHLIGHT_CLASS}`))
          return NodeFilter.FILTER_REJECT;

        const tag = parent.tagName;

        if (["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT"].includes(tag))
          return NodeFilter.FILTER_REJECT;

        if (!node.nodeValue?.trim()) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      },
    },
  );

  const textNodes: Text[] = [];
  let current;

  while ((current = walker.nextNode())) {
    textNodes.push(current as Text);
  }
  //console.log("[Highlighter] TextNodes collected:", textNodes.length);

  textNodes.forEach((node) => {
    const result = processTextNode(node, state);
    if (!result) return;

    result.matches.forEach((type) => {
      stats[type] = (stats[type] || 0) + 1;
      total++;
    });
  });

  return { total, stats };
}

function processTextNode(textNode: Text, state: ExtensionState) {
  const text = textNode.nodeValue;
  if (!text) return;

  const matches = analyzeText(text, state.activeRules);
  
  const resolvedMatches = resolveOverlappingMatches(matches);

  if (!resolvedMatches.length) return;

  const fragment = document.createDocumentFragment();
  let lastIndex = 0;

  const matchTypes: string[] = [];

  resolvedMatches.forEach((match) => {
    const before = text.slice(lastIndex, match.start);
    const matchedText = text.slice(match.start, match.end);

    if (before) {
      fragment.appendChild(document.createTextNode(before));
    }

    const span = document.createElement("span");
    span.className = `${HIGHLIGHT_CLASS} lexa-${match.type}`;
    span.textContent = matchedText;

    span.addEventListener("mouseenter", () => {
      showTooltip(
        span,
        match.type.replace("-", " ").toUpperCase(),
        match.explanation,
        match.type,
      );
    });

    span.addEventListener("mouseleave", hideTooltip);
    fragment.appendChild(span);
    matchTypes.push(match.type);
    lastIndex = match.end;
  });

  const after = text.slice(lastIndex);
  if (after) {
    fragment.appendChild(document.createTextNode(after));
  }

  textNode.parentNode?.replaceChild(fragment, textNode);
  //console.log("[Highlighter] Node replaced");

  return { matches: matchTypes };
}

function resolveOverlappingMatches(matches: GrammarMatch[]): GrammarMatch[] {
  const matchesWithPriority = matches.map(m => ({
    ...m,
    priority: RULE_PRIORITIES[m.type] || 0
  }));
  
  matchesWithPriority.sort((a, b) => {
    if (a.priority !== b.priority) return b.priority - a.priority;
    return a.start - b.start;
  });

  const result: GrammarMatch[] = [];
  const usedRanges: {start: number, end: number}[] = [];

  for (const match of matchesWithPriority) {
    const hasOverlap = usedRanges.some(range => 
      (match.start < range.end && match.end > range.start)
    );

    if (!hasOverlap) {
      result.push(match);
      usedRanges.push({start: match.start, end: match.end});
    }
  }

  return result;
}

export function clearHighlights() {
  const highlights = document.querySelectorAll(`.${HIGHLIGHT_CLASS}`);

  highlights.forEach((el) => {
    const parent = el.parentNode;
    if (!parent) return;

    parent.replaceChild(document.createTextNode(el.textContent || ""), el);

    parent.normalize();
  });
}

function createTooltip() {
  if (tooltipEl) return tooltipEl;

  tooltipEl = document.createElement("div");
  tooltipEl.className = "lexa-tooltip";
  document.documentElement.appendChild(tooltipEl);

  return tooltipEl;
}

function showTooltip(
  target: HTMLElement,
  title: string,
  description: string,
  type: string,
) {
  const tooltip = createTooltip();

  tooltip.innerHTML = `
    <div class="lexa-tooltip-title">${title}</div>
    <div class="lexa-tooltip-desc">${description}</div>
  `;

  tooltip.className = "lexa-tooltip visible";
  tooltip.classList.add(`lexa-tooltip-${type}`);

  const rect = target.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();

  let top = rect.bottom + window.scrollY + 8;
  let left = rect.left + window.scrollX;

  if (rect.bottom + tooltipRect.height > window.innerHeight) {
    top = rect.top + window.scrollY - tooltipRect.height - 8;
  }

  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
}

function hideTooltip() {
  if (!tooltipEl) return;

  tooltipEl.classList.remove("visible");
}
