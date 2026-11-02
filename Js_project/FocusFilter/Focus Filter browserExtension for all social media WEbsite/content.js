
console.log("Focus Filter Extension is Running");

// Default productive keywords
const productiveKeywords = [
    "job",
    "internship",
    "startup",
    "business",
    "freelance",
    "study",
    "work",
    "school",
    "focus"
];

let filterEnabled = true;

// Select likely content blocks instead of every div and span
const CONTENT_SELECTOR = [
    "article",
    '[role="article"]',
    "main p",
    "main li"
].join(",");

// Avoid filtering very short text or irrelevant elements
const MIN_TEXT_LENGTH = 40;

// Add blur style
const style = document.createElement("style");

style.textContent = `
    .focus-filter-blur {
        filter: blur(5px) !important;
    }
`;

(document.head || document.documentElement).appendChild(style);


// Check whether an element is suitable for filtering
function isValidContent(element) {

    if (!(element instanceof Element)) {
        return false;
    }

    // Avoid filtering buttons, inputs and navigation
    if (element.closest(
        "button, input, textarea, select, nav, header, footer"
    )) {
        return false;
    }

    const text = element.textContent.trim();

    return text.length >= MIN_TEXT_LENGTH;
}


// Check and filter one content element
function checkElement(element) {

    if (!filterEnabled || !isValidContent(element)) {
        return;
    }

    const text = element.textContent.toLowerCase();

    const isProductive = productiveKeywords.some(keyword =>
        text.includes(keyword)
    );

    if (isProductive) {
        element.classList.remove("focus-filter-blur");
    } else {
        element.classList.add("focus-filter-blur");
    }
}


// Store elements waiting to be processed
const pendingElements = new Set();

let animationScheduled = false;


// Add an element to the processing queue
function queueElement(element) {

    if (!element || !filterEnabled) {
        return;
    }

    pendingElements.add(element);

    // Batch processing into one animation frame
    if (!animationScheduled) {

        animationScheduled = true;

        requestAnimationFrame(() => {

            animationScheduled = false;

            if (!filterEnabled) {
                pendingElements.clear();
                return;
            }

            pendingElements.forEach(element => {
                checkElement(element);
            });

            pendingElements.clear();
        });
    }
}


// Process a newly added or modified node
function processNode(node) {

    if (!filterEnabled) {
        return;
    }

    // Find the nearest existing content block
    const parentElement =
        node.nodeType === Node.ELEMENT_NODE
            ? node
            : node.parentElement;

    if (!parentElement) {
        return;
    }

    const existingContent = parentElement.closest(CONTENT_SELECTOR);

    if (existingContent) {
        queueElement(existingContent);
    }

    // Check whether the new node itself is a content block
    if (
        parentElement.matches &&
        parentElement.matches(CONTENT_SELECTOR)
    ) {
        queueElement(parentElement);
    }

    // Check content blocks inside the newly added node
    if (parentElement.querySelectorAll) {

        const children =
            parentElement.querySelectorAll(CONTENT_SELECTOR);

        children.forEach(child => {
            queueElement(child);
        });
    }
}


// Initial page scan
function scanPage() {

    const elements =
        document.querySelectorAll(CONTENT_SELECTOR);

    elements.forEach(element => {
        queueElement(element);
    });
}


// Remove all applied blur effects
function removeFilter() {

    document.querySelectorAll(".focus-filter-blur")
        .forEach(element => {
            element.classList.remove("focus-filter-blur");
        });

    pendingElements.clear();
}


// Load saved ON/OFF preference
chrome.storage.local.get("enabled", result => {

    filterEnabled = result.enabled !== false;

    if (filterEnabled) {
        scanPage();
    }
});


// Receive ON/OFF messages from popup
chrome.runtime.onMessage.addListener(message => {

    if (typeof message.enabled !== "boolean") {
        return;
    }

    filterEnabled = message.enabled;

    if (filterEnabled) {
        scanPage();
    } else {
        removeFilter();
    }
});


// Detect dynamically added and modified content
const observer = new MutationObserver(mutations => {

    if (!filterEnabled) {
        return;
    }

    mutations.forEach(mutation => {

        // Handle newly added elements or text nodes
        mutation.addedNodes.forEach(node => {
            processNode(node);
        });

        // Handle text changes inside existing elements
        if (mutation.type === "characterData") {
            processNode(mutation.target);
        }

    });

});


// Start observing the webpage
observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true
});
