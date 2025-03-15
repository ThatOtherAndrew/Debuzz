document.getElementById('debuzz').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        console.log("called debuzz on tab woth ID : " + tabs[0].id);
        chrome.tabs.sendMessage(tabs[0].id, { action: "debuzz" });
    });
});
