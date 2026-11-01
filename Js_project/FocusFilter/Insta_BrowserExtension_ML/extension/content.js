
let selectedInterest = "Technology";
let processedPosts = new WeakSet();

console.log("InstaFocus: Content script started!");

// Load saved interest
chrome.storage.local.get(["interest"], (data) => {
    if (data.interest) {
        selectedInterest = data.interest;
    }

    console.log("InstaFocus: Selected interest =", selectedInterest);
    scanInstagramPosts();
});

// Scan Instagram text
async function scanInstagramPosts() {
    const captionElements = document.querySelectorAll('span[dir="auto"]');

    console.log("InstaFocus: Text elements found =", captionElements.length);

    for (const captionElement of captionElements) {
        const caption = captionElement.innerText?.trim();

        console.log("InstaFocus: Text detected =", caption);

        if (!caption || caption.length < 30) {
            continue;
        }

        if (processedPosts.has(captionElement)) {
            continue;
        }

        console.log("InstaFocus: Possible caption =", caption);

        // Find nearby media container
        let container = captionElement.parentElement;
        let media = null;
        let level = 0;

        while (container && level < 8) {
            media = container.querySelector("video, img");

            if (media) break;

            container = container.parentElement;
            level++;
        }

        if (!container || !media) {
            console.log("InstaFocus: Media container not found");
            continue;
        }

        processedPosts.add(captionElement);

        try {
            // Ask background.js to contact Flask
            const result = await chrome.runtime.sendMessage({
                action: "predict",
                caption: caption
            });

            if (!result || result.error || !result.category) {
                throw new Error(result?.error || "Invalid prediction");
            }

            console.log(
                "InstaFocus: Predicted category =",
                result.category
            );

            console.log(
                "InstaFocus: Selected interest =",
                selectedInterest
            );

            if (result.category === selectedInterest) {
                media.classList.remove("instafocus-blurred");
                console.log("InstaFocus: Post allowed");
            } else {
                media.classList.add("instafocus-blurred");
                console.log("InstaFocus: Post blurred");
            }

        } catch (error) {
            console.error("InstaFocus: API error =", error);
            processedPosts.delete(captionElement);
        }
    }
}

// Watch for newly loaded Instagram content
const observer = new MutationObserver(() => {
    scanInstagramPosts();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Handle saved interest changes
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && changes.interest) {
        selectedInterest = changes.interest.newValue;

        console.log("InstaFocus: Interest changed =", selectedInterest);

        document.querySelectorAll(".instafocus-blurred").forEach((element) => {
            element.classList.remove("instafocus-blurred");
        });

        processedPosts = new WeakSet();
        scanInstagramPosts();
    }
});

