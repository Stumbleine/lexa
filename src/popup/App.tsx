import { useEffect, useState } from "preact/hooks";
import "../styles/popup.scss"
import type { ExtensionState } from "../shared/types";

const ALL_RULES = [
  { id: "present-simple", label: "Present Simple" },
  { id: "past-simple", label: "Past Simple" },
  { id: "present-continuous", label: "Present Continuous" },
  { id: "future-will", label: "Future (Will)" },
];

export default function App() {
  const [state, setState] = useState<ExtensionState>({
    enabled: false,
    activeRules: ALL_RULES.map((r) => r.id),
  });
  const [stats, setStats] = useState({
    total: 0,
    stats: {} as Record<string, number>,
  });

  useEffect(() => {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === "STATS_UPDATED") {
        setStats(message.payload);
      }
    });
  }, []);

  useEffect(() => {
    chrome.storage.sync.get(
      ["enabled", "activeRules"],
      (result: { enabled?: boolean; activeRules?: string[] }) => {
        setState({
          enabled: result.enabled ?? false,
          activeRules:
            result.activeRules ?? ALL_RULES.map((r) => r.id),
        });
      }
    );
  }, []);

  const updateStorageAndNotify = (newState: ExtensionState) => {
    chrome.storage.sync.set(newState);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) return;

      chrome.tabs.sendMessage(tabId, {
        type: "STATE_UPDATED",
        payload: newState,
      });
    });
  };

  const toggleEnabled = () => {
    const newState = { ...state, enabled: !state.enabled };
    setState(newState);
    updateStorageAndNotify(newState);
  };

  const toggleRule = (ruleId: string) => {
    const activeRules = state.activeRules.includes(ruleId)
      ? state.activeRules.filter((r) => r !== ruleId)
      : [...state.activeRules, ruleId];

    const newState = { ...state, activeRules };
    setState(newState);
    updateStorageAndNotify(newState);
  };

  const reanalyze = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) return;

      chrome.tabs.sendMessage(tabId, {
        type: "RUN_ANALYSIS",
      });
    });
  };

  const clearHighlights = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) return;

      chrome.tabs.sendMessage(tabId, {
        type: "CLEAR_HIGHLIGHTS",
      });
    });
  };

return (
  <div class="popup">
    <header class="header">
      <h2 class="logo">LEXA</h2>
      <p class="tagline">Text, clarified.</p>
    </header>

    <div class="section toggle-section">
      <button
        class={`toggle ${state.enabled ? "active" : ""}`}
        onClick={toggleEnabled}
      >
        {state.enabled ? "ON" : "OFF"}
      </button>
    </div>

    <div class="section rules">
      <h3 class="section-title">Active Rules</h3>
      {ALL_RULES.map((rule) => (
        <label class="rule-item">
          <input
            type="checkbox"
            checked={state.activeRules.includes(rule.id)}
            onChange={() => toggleRule(rule.id)}
          />
          <span>{rule.label}</span>
        </label>
      ))}
    </div>

    <div class="section actions">
      <button class="secondary" onClick={reanalyze}>
        Re-analyze
      </button>
      <button class="secondary" onClick={clearHighlights}>
        Clear
      </button>
    </div>

    <div class="section stats">
      <h3 class="section-title">Analysis</h3>
      <div class="stat-total">
        {stats.total === 0
          ? "No patterns detected."
          : `Total: ${stats.total}`}
      </div>

      {Object.entries(stats.stats).map(([rule, count]) => (
        <div class="stat-item">
          <span>{rule}</span>
          <span>{count}</span>
        </div>
      ))}
    </div>

    <footer class="footer">
      <span>v0.1</span>
      <span>Local processing</span>
    </footer>
  </div>
);

}
