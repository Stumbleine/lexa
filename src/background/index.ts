// import type { ExtensionState, Message } from "../shared/types";

// let state: ExtensionState = {
//   enabled: false,
//   activeRules: []
// };

chrome.runtime.onInstalled.addListener(() => {
  console.log("[Background] Installed");
});

// chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
//   console.log("[Background] Message received:", message);

//   if (message.type === "TOGGLE_EXTENSION") {
//     state.enabled = message.payload;

//     chrome.storage.local.set({ extensionState: state });

//     chrome.tabs.query({}, (tabs) => {
//       tabs.forEach((tab) => {
//         if (tab.id) {
//           chrome.tabs.sendMessage(tab.id, {
//             type: "STATE_UPDATED",
//             payload: state,
//           });
//         }
//       });
//     });
//   }

//   if (message.type === "RUN_ANALYSIS") {
//     if (sender.tab?.id) {
//       chrome.tabs.sendMessage(sender.tab.id, message);
//     }
//   }

//   sendResponse();
// });
