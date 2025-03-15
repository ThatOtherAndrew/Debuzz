function fetchAPI(path) {
    baseURL = "localhost:5000/api/";
    return baseURL + path;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "buzzVolume") {
        fetch(fetchAPI('buzzvol'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: request.text })
        }).then(response => response.json()).then(data => sendResponse(data)).catch(error => console.error('Error:', error));
    }
    return true;
})
