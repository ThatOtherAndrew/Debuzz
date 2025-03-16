const buzzScoreElement = document.getElementById('buzz-score');

function updateBuzzScore() {
    chrome.storage.sync.get(['buzzScore'], (result) => {
        if (result.buzzScore != undefined) {
            buzzScoreElement.textContent = result.buzzScore;
        } else {
            buzzScoreElement.textContent = "failed";
        }
    });
}

updateBuzzScore();

// -----------------------------------------------------------------------------


// content script injection (avoids double injection which causes all sorts of shit)
function ensureContentScript(tabId, callback) {
    chrome.tabs.sendMessage(tabId, { action: "ping" }, (response) => {
        if (chrome.runtime.lastError || !response) {
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ["content.js"]
            }, () => {
                if (chrome.runtime.lastError) {
                    console.error("Script injection failed:", chrome.runtime.lastError);
                    return;
                }
                console.log("Script injected successfully");
                callback();
            });
        } else {
            callback();
        }
    });
}

// when the debuzz button is clicked in the popup, send a message to
// the background script to debuzz the page
document.getElementById('debuzz-button').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs.length) return;
        const tabId = tabs[0].id;

        ensureContentScript(tabId, () => {
            chrome.tabs.sendMessage(tabId, { action: "debuzzAction" });
        });
    });
});

// when on-button clicke send a message to buzzzz
document.getElementById('on-button').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs.length) return;
        const tabId = tabs[0].id;

        ensureContentScript(tabId, () => {
            chrome.tabs.sendMessage(tabId, { action: "turnOn" });
        });
    });
});

// chrome.runtime.onInstalled.addListener(() => {
//     chrome.storage.sync.set({ debuzzed: false }, () => {
//         console.log("debuzzed initialized to false");
//     });
// });

// document.addEventListener("DOMContentLoaded", function () {
//     const toggle = document.getElementById("soundToggle");

//     // Load saved state
//     chrome.storage.sync.get(["soundEnabled"], function (result) {
//         toggle.checked = result.soundEnabled ?? false; // Default false
//     });

//     // Handle toggle switch
//     toggle.addEventListener("change", function () {
//         const soundEnabled = toggle.checked;
//         chrome.storage.sync.set({ soundEnabled });
//         console.log("Sound enabled :", soundEnabled);

//         chrome.runtime.sendMessage({ action: "toggleSound", enabled: soundEnabled });
//     });
// });
