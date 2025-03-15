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

// when the debuzz button is clicked in the popup, send a message to
// the background script to debuzz the page
document.getElementById('debuzz-button').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs.length) return;

        const tabId = tabs[0].id;

        // inject content script before sending message
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["content.js"]
        }, () => {
            if (chrome.runtime.lastError) {
                console.error("Script injection failed :", chrome.runtime.lastError);
                return;
            }
            console.log("Script injected successfully");
            // nooooow send the message after the script is injected
            chrome.tabs.sendMessage(tabId, { action: "debuzzAction" });
        });
    });
});