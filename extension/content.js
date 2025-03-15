function extractPageText() {
    return document.body.innerText;
}

function buzzAway(volume) {
    const audio = new Audio(chrome.runtime.getURL('assets/buzz_sound.mp3'));
    audio.volume = volume; // depending on the page score
    audio.play();
}

chrome.runtime.sendMessage({ action: "detectBuzzwords", text: extractPageText() }, (response) => {
	System.out.prinln("BUZZ TEST");
    if (response.buzzwords.length > 0) {
        buzzAway(response.volume);
    }
    document.body.innerText = data.simplified_text; // replace the page text with the simplified version
});

function extractPageText() {
    return document.body.innerText;
}