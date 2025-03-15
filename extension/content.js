function extractPageText() {
    return document.body.innerText;
}

function fetchAPI(path) {
    const baseURL = "http://localhost:7777/api/";
    return baseURL + path;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "debuzzAction") {
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getBuzzScore") {
        console.log("i'm tryong okt");

        return true;
    }
});

// this just sends the page content to the API
// every time the page is loaded
// function sendPageContent() {
//     fetch(fetchAPI('debuzz'), {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ text: extractPageText() })
//     })
//         .then(response => response)
//         .then(data => console.log("API response :", data))
//         .catch(error => {
//             console.error('Error :', error);
//         });
// }

// sendPageContent();

// -----------------------------------------------------------------------------

function getBuzzVolume() {
    fetch(fetchAPI('buzzvol'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: extractPageText() })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch buzz volume');
            }
            return response.json();
        })
        .then(data => {
            console.log("Get Buzz Volume response :", data);
            chrome.storage.sync.set({buzzScore: data.buzz_score});
            buzzAway(data.buzz_volume);
            return data;
        })
        .catch(error => {
            console.error('Error :', error);
            throw error;
        });
}

function buzzAway(volume) {
    const audio = new Audio(chrome.runtime.getURL('assets/buzz_sound.mp3'));
    console.log("buzzing away with volume :", volume);
    audio.volume = volume; // depending on the page score
    audio.loop = true;
    audio.play().catch(error => console.error("Playback error:", error));
}

getBuzzVolume();