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
