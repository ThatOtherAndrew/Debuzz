chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "detectBuzzwords") {
	    // localhost for testing 
        fetch('http://localhost:5000/detect-buzz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: request.text })
        }).then(response => response.json()).then(data => sendResponse(data));
    }
    return true; 
});
