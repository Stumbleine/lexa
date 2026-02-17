import type { ExtensionState, Message } from "../shared/types";
import { highlightDocument, clearHighlights } from "./dom/highlighter";
import "../styles/highlight.scss";

let observer: MutationObserver | null = null;
let isProcessing = false;

let currentState: ExtensionState = {
  enabled: false,
  activeRules: [],
};

console.log("[Content] Script loaded");

chrome.storage.sync.get(
  ["enabled", "activeRules"],
  (result: { enabled?: boolean; activeRules?: string[] }) => {
    currentState = {
      enabled: result.enabled ?? false,
      activeRules: result.activeRules ?? [],
    };

    console.log("[Content] Initial state:", currentState);

    if (currentState.enabled) {
      runAnalysis();
      startObserver();
    }
  },
);

chrome.runtime.onMessage.addListener((message: Message) => {
  console.log("[Content] Message received:", message);

  if (message.type === "STATE_UPDATED") {
    currentState = message.payload;

    if (currentState.enabled) {
      console.log("[Content] Extension enabled");
      runAnalysis();
      startObserver();
    } else {
      console.log("[Content] Extension disabled");
      clear();
      stopObserver();
    }
  }

  if (message.type === "RUN_ANALYSIS" && currentState.enabled) {
    runAnalysis();
  }
  if (message.type === "CLEAR_HIGHLIGHTS") {
    clear();
  }
});

// function runAnalysssis() {
//   console.log("[Content] Running analysis...");

//   if (isProcessing) return;

//   isProcessing = true;
//   stopObserver();
//   clearHighlights();

//   if (document.readyState === "loading") {
//     document.addEventListener("DOMContentLoaded", () => {
//       highlightDocument(currentState);
//     });
//   } else {
//     highlightDocument(currentState);
//   }
//   if (currentState.enabled) {
//     startObserver();
//   }
//   isProcessing = false;
// }
// chrome.runtime.sendMessage({
//   type: "STATS_UPDATED",
//   payload: result,
// });
function runAnalysis() {
  if (isProcessing) return;

  console.log("[Content] Running analysis...");

  isProcessing = true;

  stopObserver();
  clearHighlights();
  
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      highlightDocument(currentState);
    });
  } else {
    highlightDocument(currentState);
  }

  if (currentState.enabled) {
    startObserver();
  }

  isProcessing = false;
}

function clear() {
  console.log("[Content] Clearing highlights...");

  stopObserver(); // 🔒 evitar loop
  clearHighlights();

  if (currentState.enabled) {
    startObserver(); // volver a escuchar si sigue ON
  }
}

function startObserver() {
  if (observer) return;

  observer = new MutationObserver((mutations) => {
    if (!currentState.enabled) return;
    if (isProcessing) return;

    const hasRealChanges = mutations.some((m) => {
      const target = m.target as HTMLElement;

      if (!target) return false;

      // Ignorar cambios dentro de highlights
      if (target.closest(".grmmrlns-highlight")) return false;

      // Ignorar cambios del tooltip
      if (target.closest(".grmmrlns-tooltip")) return false;

      return true;
    });

    if (!hasRealChanges) return;

    console.log("[Observer] DOM changed");
    runAnalysis();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log("[Observer] Started");
}

function stopObserver() {
  if (observer) {
    observer.disconnect();
    observer = null;
    console.log("[Observer] Stopped");
  }
}
