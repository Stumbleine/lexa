export type ExtensionState = {
  enabled: boolean;
  activeRules: string[]
};

export type Message =
  | { type: "TOGGLE_EXTENSION"; payload: boolean }
  | { type: "STATE_UPDATED"; payload: ExtensionState }
  | { type: "RUN_ANALYSIS" }
  | { type: "CLEAR_HIGHLIGHTS" }
