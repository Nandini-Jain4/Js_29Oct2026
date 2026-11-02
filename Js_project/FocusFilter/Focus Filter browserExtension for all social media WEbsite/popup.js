const toggle = document.getElementById("toggle");
const statusText = document.getElementById("status");


// ----------------------------------------
// LOAD SAVED ON/OFF STATUS
// ----------------------------------------

async function loadStatus() {

    try {

        const result = await chrome.storage.local.get("enabled");

        const enabled = result.enabled !== false;

        toggle.checked = enabled;

        updateStatus(enabled);

    } catch (error) {

        console.error("Error loading status:", error);

    }

}


// ----------------------------------------
// HANDLE ON/OFF TOGGLE
// ----------------------------------------

toggle.addEventListener("change", async () => {

    const enabled = toggle.checked;

    try {

        // Save ON/OFF status
        await chrome.storage.local.set({
            enabled: enabled
        });

        // Update popup status
        updateStatus(enabled);


        // Get currently active tab
        const tabs = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        if (tabs.length > 0 && tabs[0].id !== undefined) {

            try {

                // Send ON/OFF status to content.js
                await chrome.tabs.sendMessage(
                    tabs[0].id,
                    {
                        enabled: enabled
                    }
                );

            } catch (error) {

                // Content script may not be available
                console.log(
                    "Content script unavailable on this tab."
                );

            }

        }

    } catch (error) {

        console.error("Error updating filter:", error);

    }

});


// ----------------------------------------
// UPDATE STATUS TEXT
// ----------------------------------------

function updateStatus(enabled) {

    if (enabled) {

        statusText.textContent = "Focus Filter is ON";

    } else {

        statusText.textContent = "Focus Filter is OFF";

    }

}


// ----------------------------------------
// INITIALIZE POPUP
// ----------------------------------------

loadStatus();