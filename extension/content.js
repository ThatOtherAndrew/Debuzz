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
            throw new Error(`fUcIng HTTP error w status : ${response.status}`);
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
    chrome.storage.sync.set({ debuzzed: true });
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

        chrome.storage.sync.set({ debuzzed: false });

        chrome.storage.sync.get(["buzzVolume"], (result) => {
            if (result.buzzVolume) {
                buzzAway(result.buzzVolume);
                console.log("Buzz volume found:", result.buzzVolume);
            }
        });

        return true;
    }
});

// -----------------------------------------------------------------------------
//                            BUZZ AUDIO HANDLING
// -----------------------------------------------------------------------------

if (!window.audioInstance) {
    window.audioInstance = null;
}

function getBuzzVolume() {
    chrome.storage.sync.get(["debuzzed"], (result) => {
        if (result.debuzzed) {
            console.log("page debuzzed, no buzz :((((");
            return;
        }
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
                //buzzAway(data.buzz_volume);
                return data;
            })
            .catch(error => {
                console.error('error :', error);
                throw error;
            });

    });
}

function buzzAway(volume) {
    console.log(audioInstance);
    if (!window.audioInstance) {
        console.log("no audio instance, creating one");
        window.audioInstance = new Audio(chrome.runtime.getURL('assets/buzz_sound.mp3'));
        console.log("buzzing away at volume :", volume);
        window.audioInstance.volume = volume;
        window.audioInstance.loop = true;
        window.audioInstance.play().catch(error => console.error("got a error:", error));
    }
}

function stopBuzzing() {
    if (audioInstance) {
        console.log("stopping the buzz", window.audioInstance);
        window.audioInstance.pause();
        window.audioInstance.loop = false;
        window.audioInstance.muted = true;
        window.audioInstance.volume = 0;
        window.audioInstance.currentTime = 0;
        window.audioInstance = null;
        console.log(window.audioInstance);
    }
}



getBuzzVolume();