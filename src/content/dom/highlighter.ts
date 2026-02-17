import type { ExtensionState } from "../../shared/types";
import { analyzeText } from "../grammar";

const HIGHLIGHT_CLASS = "grmmrlns-highlight";
let tooltipEl: HTMLDivElement | null = null;

export function highlightDocument(state: ExtensionState) {
  // const stats: Record<string, number> = {};
  // let total = 0;
  console.log("[Highlighter] Starting document walk");
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node: Node): number {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        
        if (parent.closest("[data-lexa-processed='true']")) {
          return NodeFilter.FILTER_REJECT;
        }
        // Evitar nodos dentro de nuestros highlights
        if (parent.closest(".grmmrlns-highlight")) {
          return NodeFilter.FILTER_REJECT;
        }

        const tag = parent.tagName;

        // Evitar tags problemáticos
        if (
          ["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT"].includes(tag)
        ) {
          return NodeFilter.FILTER_REJECT;
        }

        // Evitar nodos vacíos
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
  console.log("[Highlighter] TextNodes collected:", textNodes.length);

  textNodes.forEach((node) => processTextNode(node, state));
  
  // return { total, stats };
}

function processTextNode(
  textNode: Text,
  state: ExtensionState,
  // stats: Record<string, number>,
  // incrementTotal: () => void,
) {
  const text = textNode.nodeValue;
  if (!text) return;

  const matches = analyzeText(text, state.activeRules);

  if (matches.length) {
    console.log("[Highlighter] TextNode:", text);
    console.log("[Highlighter] Matches:", matches);
  }
  if (!matches.length) return;

  const fragment = document.createDocumentFragment();
  let lastIndex = 0;

  matches.forEach((match) => {
    // stats[match.type] = (stats[match.type] || 0) + 1;
    // incrementTotal();
    const before = text.slice(lastIndex, match.start);
    const matchedText = text.slice(match.start, match.end);

    if (before) {
      fragment.appendChild(document.createTextNode(before));
    }

    const span = document.createElement("span");
    span.classList.add(HIGHLIGHT_CLASS);
    span.classList.add(`grmmrlns-${match.type}`);
    span.textContent = matchedText;
    // span.title = match.explanation;
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

    lastIndex = match.end;
  });

  const after = text.slice(lastIndex);
  if (after) {
    fragment.appendChild(document.createTextNode(after));
  }

  const parent = textNode.parentElement;
  if (parent) {
    parent.setAttribute("data-lexa-processed", "true");
  }

  textNode.parentNode?.replaceChild(fragment, textNode);
  console.log("[Highlighter] Node replaced");
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
  tooltipEl.className = "grmmrlns-tooltip";
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
    <div class="grmmrlns-tooltip-title">${title}</div>
    <div class="grmmrlns-tooltip-desc">${description}</div>
  `;

  tooltip.className = "grmmrlns-tooltip visible";
  tooltip.classList.add(`grmmrlns-tooltip-${type}`);

  const rect = target.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();

  let top = rect.bottom + window.scrollY + 8;
  let left = rect.left + window.scrollX;

  // Smart flip si no cabe abajo
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