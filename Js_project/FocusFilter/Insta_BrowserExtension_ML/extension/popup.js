const saveButton = document.getElementById("save");
const interestSelect = document.getElementById("interest");
const status = document.getElementById("status");

saveButton.addEventListener("click", () => {
    const selectedInterest = interestSelect.value;

    chrome.storage.local.set(
        { interest: selectedInterest },
        () => {
            status.textContent = "Interest saved: " + selectedInterest;
        }
    );
});