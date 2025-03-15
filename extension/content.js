function extractPageText() {
    return document.body.innerText;
}

function fetchAPI(path) {
    const baseURL = "http://localhost:5000/api/";
    return baseURL + path;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "debuzz") {
        console.log("debuzzing from content");

        // fetch(fetchAPI('debuzz'), {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ text: request.text })
        // })
        // .then(response => response.json())
        // .then(data => sendResponse(data))
        // .catch(error => {
        //     console.error('Error:', error);
        //     sendResponse({ error: 'Failed to fetch data' });
        // });

        return true;
    }
});

function sendPageContent() {
        fetch(fetchAPI('debuzz'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: extractPageText() })
        })
        .then(response => response.json())
        .then(data => console.log("API response :", data))
        .catch(error => {
            console.error('Error :', error);
        });

}

sendPageContent();

// -----------------------------------------------------------------------------


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "buzzVolume") {
	    // localhost for testing
        fetch(fetchAPI('buzzvol'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: request.text })
        }).then(response => response.json()).then(data => sendResponse(data)).catch(error => console.error('Error:', error));
    }
    return true;
})


function buzzAway(volume) {
    const audio = new Audio(chrome.runtime.getURL('assets/buzz_sound.mp3'));
    audio.volume = volume; // depending on the page score
    audio.play();
}

chrome.runtime.sendMessage({ action: "buzzVolume", text: extractPageText() }, (response) => {
	System.out.println("buzz volume");
    if (response.buzz_volume != undefined) {

        // save the buzz score in the chrome storage
        chrome.storage.sync.set({ buzzScore: response.buzz_score }, () => {
            console.log("buuzz score saved :", response.buzz_score);
        });

        buzzAway(response.buzz_volume);
    }
});