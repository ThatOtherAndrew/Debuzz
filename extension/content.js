function extractPageText() {
    return document.body.innerText;
}

function fetchAPI(path) {
    const baseURL = "http://localhost:7777/api/";
    return baseURL + path;
}

async function debuzzText(originalText) {
    try {
        const response = await fetch(fetchAPI('debuzz'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: originalText })
        });

        if (!response.ok) {
            throw new Error(`fUcIng HTTP error ! status : ${response.status}`);
        }

        const data = await response.json();
        return data.text;
    } catch (error) {
        console.error("eeeerrror debuzzing text :", error);
        return originalText;
    }
}

async function debuzzPage() {
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: (node) =>
                node.parentElement &&
                    !["STYLE", "SCRIPT", "IFRAME", "NOSCRIPT"].includes(node.parentElement.tagName) &&
                    node.textContent.trim()
                    ? NodeFilter.FILTER_ACCEPT
                    : NodeFilter.FILTER_REJECT,
        },
        false
    );

    let node;
    const promises = [];

    while ((node = walker.nextNode())) {
        const currentNode = node; // save da node

        const promise = debuzzText(node.textContent).then((newText) => {
            if (currentNode.parentElement) { // node, you still in there ?
                currentNode.textContent = newText;
            }
        }).catch(error => console.error("Error processing node:", error));

        promises.push(promise);
    }

    await Promise.all(promises);
    stopBuzzing();
    console.log("this page has been debuzzled");
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "debuzzAction") {
        console.log("debuzzing from content");

        debuzzPage().then(() => {
            sendResponse({ success: true });
        }).catch(error => {
            console.error("Error debuzzing page:", error);
            sendResponse({ error: "Failed to debuzz the page" });
        });

        return true;
    }
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "turnOn") {
        console.log("i'm tryong ok");

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
//                         BUZZ AUDIO HANDLING
// -----------------------------------------------------------------------------

let audioInstance = null;

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
            chrome.storage.sync.set({ buzzScore: data.buzz_score });
            chrome.storage.sync.set({ buzzVolume: data.buzz_volume });
            buzzAway(data.buzz_volume);
            return data;
        })
        .catch(error => {
            console.error('error :', error);
            throw error;
        });
}

function buzzAway(volume) {
    if (!audioInstance) {
        const audio = new Audio(chrome.runtime.getURL('assets/buzz_sound.mp3'));
        console.log("buzzing away at volume :", volume);
        audio.volume = volume; // depending on the page score
        audio.loop = true;
        audio.play().catch(error => console.error("got a error:", error));
    }
}

function stopBuzzing() {
    if (audioInstance) {
        audioInstance.pause();
        audioInstance.currentTime = 0;
        audioInstance = null;
    }
}

chrome.storage.sync.get(["buzzVolume"], (result) => {
    if (result) {
        console.log("buzzVolume :", result);
        buzzAway(result);
    }
});

getBuzzVolume();