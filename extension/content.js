function fetchAPI(path) {
    const baseURL = "http://localhost:7777/api/";
    return baseURL + path;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "debuzz") {
        console.log("debuzzing from content");

        chrome.storage.sync.set({ debuzzed: true });
        stopBuzzing();
        console.log("this page has been debuzzled");

        debuzzSubstitute();

        return true;
    }
    if (request.action === "turnOn") {
        console.log("i'm tryong ok");

        chrome.storage.sync.set({ debuzzed: false }, async () => {
            console.log("Reset debuzzed state");
            await getBuzzVolume();

            chrome.storage.sync.get(["buzzVolume"], (result) => {
                if (result.buzzVolume) {
                    buzzAway(result.buzzVolume);
                    console.log("Buzz volume found:", result.buzzVolume);
                }
            });
        });

        return true;
    }
    if (request.action === "ping") {
        sendResponse({ status: "content_script_running" });
    }
    if (request.action === "history") {
        window.open('http://localhost:7777/history', '_blank').focus();
    }
});

// -----------------------------------------------------------------------------
//                            BUZZ AUDIO HANDLING
// -----------------------------------------------------------------------------

if (!window.audioInstance) {
    window.audioInstance = null;
}

async function getBuzzVolume() {
    const result = await chrome.storage.sync.get(["debuzzed"]);

    if (result.debuzzed) {
        console.log("page debuzzed, no buzz :((((");
        return;
    }

    const pageText = extractTreeWalkerText();

    try {
        const response = await fetch(fetchAPI('buzzvol'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: pageText })
        });

        if (!response.ok) {
            throw new Error('failed to fetch buzz volume, oh nooooo');
        }

        const data = await response.json();
        console.log("Buzz Volume response :", data);

        await chrome.storage.sync.set({
            buzzScore: data.buzz_score,
            buzzVolume: data.buzz_volume
        });

        return data;
    } catch (error) {
        console.error('eror fetching buzz volume :', error);
    }
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

    const chunkSize = 5;

    for (let i = 0; i < nodeList.length; i += chunkSize) {
        const chunk = nodeList.slice(i, i + chunkSize);
        console.debug(`Debuzzing strings ${i}-${i + chunkSize - 1}...`)

        chunk.forEach(node => {
            const parentStyle = node.parentElement.style;
            parentStyle.transition = `color 0.5s ${Math.random()}s ease-out`;
            parentStyle.color = '#ffbf00';
        })

        fetch('http://localhost:7777/api/debuzz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(chunk.map(node => node.textContent)),
        }).then(response => {
            if (!response.ok) {
                return response.json().then(json => {
                    throw new Error(json.error);
                });
            }
            return response.json();
        }).then(json => {
            json.map((newContent, index) => {
                chunk[index].textContent = newContent;

                const parentStyle = chunk[index].parentElement.style;
                parentStyle.backgroundColor = '#ffbf00';
                parentStyle.removeProperty('color');

                setTimeout(() => {
                    parentStyle.transition = 'background-color 1s cubic-bezier(0.25, 1, 0.5, 1)';
                    parentStyle.backgroundColor = 'transparent';
                }, 100);
            });
            console.debug(`Successfully debuzzed strings ${i}-${i + chunkSize - 1}!`);
        }).catch(error => {
            console.error('Debuzzing error:', error.message);
        });
    }
}

function extractTreeWalkerText() {
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

    const textNodes = [];
    let node;

    while ((node = walker.nextNode())) {
        textNodes.push(node.textContent.trim());
    }

    return textNodes.join(" ");

}
