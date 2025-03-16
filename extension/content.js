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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "debuzzAction") {
        console.log("debuzzing from content");

        chrome.storage.sync.set({ debuzzed: true });
        stopBuzzing();
        console.log("this page has been debuzzled");

        debuzzSubstitute();


        return true;
    }
    if (request.action === "turnOn") {
        console.log("i'm tryong ok");

        chrome.storage.sync.set({ debuzzed: false }, () => {
            console.log("Reset debuzzed state");
            getBuzzVolume();  // Recalculate buzz volume based on updated page text
        });

        chrome.storage.sync.get(["buzzVolume"], (result) => {
            if (result.buzzVolume) {
                buzzAway(result.buzzVolume);
                console.log("Buzz volume found:", result.buzzVolume);
            }
        });

        return true;
    }
    if (request.action === "ping") {
        sendResponse({ status: "content_script_running" });
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
        if (result.debuzzed == true) {
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
    if (window.audioInstance) {
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

function debuzzSubstitute() {

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    let node;
    let nodeList = [];

    while ((node = walker.nextNode())) {
        if (
            !node.parentElement
            || node.parentElement.tagName === "STYLE"
            || node.parentElement.tagName === "SCRIPT"
            || !/[a-zA-Z]{2}/.test(node.textContent)
        ) {
            continue;
        }
        nodeList.push(node);
    }

    fetch('http://localhost:7777/api/debuzz', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(nodeList.map(node => node.textContent)),
    }).then(response => {
        if (!response.ok) {
            return response.json().then(json => {
                throw new Error(json.error);
            });
        }
        return response.json();
    }).then(json => {
        json.map((newContent, index) => {
            nodeList[index].textContent = newContent;
        })
    }).catch(error => {
        console.error('Debuzzing error:', error.message);
    });

}

// getBuzzVolume();