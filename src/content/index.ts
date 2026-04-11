import type { ExtensionState, Message } from "../shared/types";
import { highlightDocument, clearHighlights } from "./dom/highlighter";
import "../styles/highlight.scss";

let isProcessing = false;

let currentState: ExtensionState = {
  enabled: false,
  activeRules: [],
};

chrome.storage.sync.get(
  ["enabled", "activeRules"],
  (result: { enabled?: boolean; activeRules?: string[] }) => {
    currentState = {
      enabled: result.enabled ?? false,
      activeRules: result.activeRules ?? [],
    };

    if (currentState.enabled) {
      safeRunAnalysis();
    }
  }
);

chrome.runtime.onMessage.addListener((message: Message) => {
  if (message.type === "STATE_UPDATED") {
    currentState = message.payload;

    if (currentState.enabled) {
      safeRunAnalysis();
    } else {
      clearHighlights();
    }
  }

  if (message.type === "RUN_ANALYSIS" && currentState.enabled) {
    safeRunAnalysis();
  }

  if (message.type === "CLEAR_HIGHLIGHTS") {
    clearHighlights();
  }
});

function safeRunAnalysis() {
  if (isProcessing) return;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runAnalysis, { once: true });
  } else {
    runAnalysis();
  }
}

function runAnalysis() {
  if (isProcessing) return;

  isProcessing = true;

  clearHighlights();

  const stats = highlightDocument(currentState);

  // send stats to popup
  chrome.runtime.sendMessage({
    type: "STATS_UPDATED",
    payload: stats,
  });

  isProcessing = false;
}