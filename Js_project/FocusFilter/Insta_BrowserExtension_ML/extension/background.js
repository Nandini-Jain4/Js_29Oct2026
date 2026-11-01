chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.action === "predict") {

        fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                caption: request.caption
            })
        })
        .then(response => response.json())
        .then(result => {
            sendResponse(result);
        })
        .catch(error => {
            console.error("InstaFocus Backend Error:", error);
            sendResponse({ error: error.message });
        });

        return true;
    }
});